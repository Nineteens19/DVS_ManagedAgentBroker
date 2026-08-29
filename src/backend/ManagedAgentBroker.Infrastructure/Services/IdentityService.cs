using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public record AuthResult(
        bool Success,
        string? AccessToken = null,
        string? RefreshToken = null,
        int ExpiresInSeconds = 0,
        string? ErrorMessage = null,
        UserDto? User = null);

    public record UserDto(
        Guid Id,
        string Username,
        string Email,
        string FullName,
        string BranchCode,
        string Department,
        IReadOnlyList<string> Roles);

    public record BranchDto(
        Guid Id,
        string BranchCode,
        string BranchName,
        string Region,
        string Address,
        string PhoneNumber,
        bool IsActive);

    public interface IIdentityService
    {
        Task<AuthResult> LoginAsync(string username, string password, string ipAddress, CancellationToken ct = default);
        Task<AuthResult> RefreshTokenAsync(string refreshToken, string ipAddress, CancellationToken ct = default);
        Task<bool> RevokeTokenAsync(string refreshToken, CancellationToken ct = default);
        Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken ct = default);
        Task<IReadOnlyList<BranchDto>> GetActiveBranchesAsync(CancellationToken ct = default);
    }

    public class IdentityService : IIdentityService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IPasswordHashService _passwordHashService;
        private readonly ITokenService _tokenService;
        private readonly ILogger<IdentityService> _logger;

        public IdentityService(
            ApplicationDbContext dbContext,
            IPasswordHashService passwordHashService,
            ITokenService tokenService,
            ILogger<IdentityService> logger)
        {
            _dbContext = dbContext;
            _passwordHashService = passwordHashService;
            _tokenService = tokenService;
            _logger = logger;
        }

        public async Task<AuthResult> LoginAsync(string username, string password, string ipAddress, CancellationToken ct = default)
        {
            var user = await _dbContext.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Username == username, ct);

            if (user == null)
            {
                _logger.LogWarning("AUTH_LOGIN_FAILED: User '{Username}' not found from IP {IpAddress}", username, ipAddress);
                return new AuthResult(false, ErrorMessage: "Invalid username or password.");
            }

            if (!user.IsActive)
            {
                _logger.LogWarning("AUTH_LOGIN_FAILED: User '{Username}' is inactive from IP {IpAddress}", username, ipAddress);
                return new AuthResult(false, ErrorMessage: "Account is disabled. Please contact system administrator.");
            }

            if (user.IsLockedOut)
            {
                _logger.LogWarning("AUTH_ACCOUNT_LOCKED: User '{Username}' attempted login while locked until {LockoutEndUtc}", username, user.LockoutEndUtc);
                return new AuthResult(false, ErrorMessage: $"Account temporarily locked due to failed attempts. Try again after {user.LockoutEndUtc:HH:mm} UTC.");
            }

            if (string.IsNullOrEmpty(user.PasswordHash) || !_passwordHashService.VerifyPassword(user.PasswordHash, password))
            {
                user.RecordFailedLogin();
                await _dbContext.SaveChangesAsync(ct);
                _logger.LogWarning("AUTH_LOGIN_FAILED: Invalid password for user '{Username}' from IP {IpAddress}. Failed attempts: {Attempts}", username, ipAddress, user.FailedLoginAttempts);

                if (user.IsLockedOut)
                {
                    return new AuthResult(false, ErrorMessage: "Account locked for 15 minutes due to 5 failed login attempts.");
                }

                return new AuthResult(false, ErrorMessage: "Invalid username or password.");
            }

            user.RecordSuccessfulLogin();

            var roles = user.UserRoles.Select(ur => ur.Role?.Code ?? string.Empty).Where(r => !string.IsNullOrEmpty(r)).ToList();
            var accessToken = _tokenService.GenerateAccessToken(user, roles);
            var (rawRefreshToken, tokenHash, expiresAtUtc) = _tokenService.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiresAtUtc = expiresAtUtc,
                CreatedByIp = ipAddress
            };

            _dbContext.RefreshTokens.Add(refreshTokenEntity);
            await _dbContext.SaveChangesAsync(ct);

            _logger.LogInformation("AUTH_LOGIN_SUCCESS: User '{Username}' logged in successfully from IP {IpAddress}", username, ipAddress);

            var userDto = new UserDto(user.Id, user.Username, user.Email, user.FullName, user.BranchCode, user.Department, roles);
            return new AuthResult(true, accessToken, rawRefreshToken, 900, User: userDto);
        }

        public async Task<AuthResult> RefreshTokenAsync(string refreshToken, string ipAddress, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return new AuthResult(false, ErrorMessage: "Refresh token cannot be empty.");

            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
            var tokenHash = Convert.ToHexString(hashBytes).ToLowerInvariant();

            var storedToken = await _dbContext.RefreshTokens
                .Include(r => r.User)
                .ThenInclude(u => u!.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(r => r.TokenHash == tokenHash, ct);

            if (storedToken == null)
            {
                _logger.LogWarning("AUTH_REFRESH_FAILED: Refresh token hash not found.");
                return new AuthResult(false, ErrorMessage: "Invalid refresh token.");
            }

            // Replay Attack Detection: If token is revoked, revoke all tokens for that user
            if (storedToken.IsRevoked)
            {
                _logger.LogWarning("AUTH_REPLAY_DETECTED: Revoked refresh token submitted for user '{UserId}'. Revoking all sessions.", storedToken.UserId);
                var activeTokens = await _dbContext.RefreshTokens
                    .Where(r => r.UserId == storedToken.UserId && !r.IsRevoked)
                    .ToListAsync(ct);

                foreach (var t in activeTokens)
                {
                    t.Revoke();
                }
                await _dbContext.SaveChangesAsync(ct);

                return new AuthResult(false, ErrorMessage: "Security violation detected. All sessions terminated.");
            }

            if (storedToken.IsExpired)
            {
                return new AuthResult(false, ErrorMessage: "Refresh token has expired. Please login again.");
            }

            var user = storedToken.User;
            if (user == null || !user.IsActive)
            {
                return new AuthResult(false, ErrorMessage: "User account is inactive.");
            }

            // Rotate refresh token
            var (newRawToken, newTokenHash, newExpiresAtUtc) = _tokenService.GenerateRefreshToken();
            storedToken.Revoke(newTokenHash);

            var newRefreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = newTokenHash,
                ExpiresAtUtc = newExpiresAtUtc,
                CreatedByIp = ipAddress
            };

            _dbContext.RefreshTokens.Add(newRefreshTokenEntity);
            await _dbContext.SaveChangesAsync(ct);

            var roles = user.UserRoles.Select(ur => ur.Role?.Code ?? string.Empty).Where(r => !string.IsNullOrEmpty(r)).ToList();
            var newAccessToken = _tokenService.GenerateAccessToken(user, roles);

            _logger.LogInformation("AUTH_TOKEN_REFRESHED: Token rotated for user '{Username}' from IP {IpAddress}", user.Username, ipAddress);

            var userDto = new UserDto(user.Id, user.Username, user.Email, user.FullName, user.BranchCode, user.Department, roles);
            return new AuthResult(true, newAccessToken, newRawToken, 900, User: userDto);
        }

        public async Task<bool> RevokeTokenAsync(string refreshToken, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(refreshToken)) return false;

            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
            var tokenHash = Convert.ToHexString(hashBytes).ToLowerInvariant();

            var storedToken = await _dbContext.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == tokenHash, ct);
            if (storedToken == null || storedToken.IsRevoked) return false;

            storedToken.Revoke();
            await _dbContext.SaveChangesAsync(ct);
            return true;
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken ct = default)
        {
            var user = await _dbContext.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId, ct);

            if (user == null) return null;

            var roles = user.UserRoles.Select(ur => ur.Role?.Code ?? string.Empty).Where(r => !string.IsNullOrEmpty(r)).ToList();
            return new UserDto(user.Id, user.Username, user.Email, user.FullName, user.BranchCode, user.Department, roles);
        }

        public async Task<IReadOnlyList<BranchDto>> GetActiveBranchesAsync(CancellationToken ct = default)
        {
            var branches = await _dbContext.Branches
                .Where(b => b.IsActive)
                .OrderBy(b => b.BranchCode)
                .Select(b => new BranchDto(b.Id, b.BranchCode, b.BranchName, b.Region, b.Address, b.PhoneNumber, b.IsActive))
                .ToListAsync(ct);

            return branches;
        }
    }
}
