# Logical Components — Unit 2: Authentication, RBAC & Organization Service

This document defines the logical interfaces, service contracts, and dependency injection mappings for Unit 2.

---

## 1. Logical Interface Contracts

### 1.1 `ITokenService`
```csharp
public interface ITokenService
{
    string GenerateAccessToken(User user, IEnumerable<string> roles);
    (string rawToken, string tokenHash, DateTime expiresAt) GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
```

### 1.2 `IPasswordHashService`
```csharp
public interface IPasswordHashService
{
    string HashPassword(string password);
    bool VerifyPassword(string hashedPassword, string providedPassword);
}
```

### 1.3 `IBranchScopeEvaluator`
```csharp
public interface IBranchScopeEvaluator
{
    bool IsGlobalScope(ClaimsPrincipal user);
    string? GetUserBranchCode(ClaimsPrincipal user);
    IQueryable<AgentApplication> ApplyBranchFilter(IQueryable<AgentApplication> query, ClaimsPrincipal user);
}
```

### 1.4 `IIdentityService`
```csharp
public interface IIdentityService
{
    Task<AuthResult> LoginAsync(string username, string password, string ipAddress, CancellationToken ct = default);
    Task<AuthResult> RefreshTokenAsync(string refreshToken, string ipAddress, CancellationToken ct = default);
    Task<bool> RevokeTokenAsync(string refreshToken, CancellationToken ct = default);
    Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<BranchDto>> GetActiveBranchesAsync(CancellationToken ct = default);
}
```

---

## 2. Dependency Injection Registration

```csharp
services.AddScoped<ITokenService, JwtTokenService>();
services.AddScoped<IPasswordHashService, PasswordHashService>();
services.AddScoped<IBranchScopeEvaluator, BranchScopeEvaluator>();
services.AddScoped<IIdentityService, IdentityService>();
```
