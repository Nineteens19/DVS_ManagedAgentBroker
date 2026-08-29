using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ManagedAgentBroker.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user, IEnumerable<string> roles);
        (string rawToken, string tokenHash, DateTime expiresAtUtc) GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }

    public class JwtTokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly SymmetricSecurityKey _signingKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _accessTokenLifetimeMinutes;
        private readonly int _refreshTokenLifetimeDays;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;

            var secret = _configuration["Jwt:Secret"] ?? "SuperSecretJwtSigningKeyForManagedAgentBroker2026!#$";
            var keyBytes = Encoding.UTF8.GetBytes(secret);
            if (keyBytes.Length < 32)
            {
                keyBytes = SHA256.HashData(keyBytes);
            }
            _signingKey = new SymmetricSecurityKey(keyBytes);

            _issuer = _configuration["Jwt:Issuer"] ?? "ManagedAgentBroker.Api";
            _audience = _configuration["Jwt:Audience"] ?? "ManagedAgentBroker.Web";
            _accessTokenLifetimeMinutes = int.TryParse(_configuration["Jwt:AccessTokenExpirationMinutes"], out var accMin) ? accMin : 15;
            _refreshTokenLifetimeDays = int.TryParse(_configuration["Jwt:RefreshTokenExpirationDays"], out var refDays) ? refDays : 7;
        }

        public string GenerateAccessToken(User user, IEnumerable<string> roles)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.FullName),
                new(ClaimTypes.Email, user.Email),
                new("username", user.Username),
                new("branch_code", user.BranchCode ?? string.Empty),
                new("department", user.Department ?? string.Empty),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_accessTokenLifetimeMinutes),
                Issuer = _issuer,
                Audience = _audience,
                SigningCredentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public (string rawToken, string tokenHash, DateTime expiresAtUtc) GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            RandomNumberGenerator.Fill(randomBytes);
            var rawToken = Convert.ToBase64String(randomBytes);

            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
            var tokenHash = Convert.ToHexString(hashBytes).ToLowerInvariant();

            var expiresAtUtc = DateTime.UtcNow.AddDays(_refreshTokenLifetimeDays);

            return (rawToken, tokenHash, expiresAtUtc);
        }

        public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _signingKey,
                ValidateLifetime = false // Allow expired token to read user identity during refresh
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
                if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}
