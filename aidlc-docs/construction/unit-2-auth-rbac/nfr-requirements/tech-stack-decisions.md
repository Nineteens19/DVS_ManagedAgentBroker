# Tech Stack Decisions — Unit 2: Authentication, RBAC & Organization Service

This document records the technology stack and package decisions for identity, authorization, and rate limiting in Unit 2.

---

## 1. Selected Libraries and Frameworks

| Component | Technology / Library | Version | Rationale |
|---|---|---|---|
| **JWT Bearer Auth** | `Microsoft.AspNetCore.Authentication.JwtBearer` | 8.0.11 | Native ASP.NET Core middleware for high-performance stateless token verification. |
| **Password Hashing** | `Microsoft.AspNetCore.Identity` | 8.0.11 | Standardized PBKDF2 HMAC-SHA512 hashing implementation with automatic salt handling. |
| **API Rate Limiting** | `Microsoft.AspNetCore.RateLimiting` | 8.0.11 | Built-in .NET 8 middleware for IP-based fixed-window rate limiting on sensitive auth routes. |
| **OIDC / SSO Client** | `System.IdentityModel.Tokens.Jwt` | 8.0.1 | Standard JWT token decoding and validation against external Azure AD / OpenID Connect endpoints. |

---

## 2. Configuration Settings

```json
{
  "Jwt": {
    "Secret": "SuperSecretJwtSigningKeyForManagedAgentBroker2026!#$",
    "Issuer": "ManagedAgentBroker.Api",
    "Audience": "ManagedAgentBroker.Web",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  },
  "RateLimiting": {
    "LoginPermitLimit": 10,
    "LoginWindowMinutes": 1
  }
}
```
