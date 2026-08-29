# Deployment Architecture — Unit 2: Authentication, RBAC & Organization Service

This document details the authentication middleware pipeline, rate limiting filters, and reverse proxy IP extraction.

---

## 1. Middleware Pipeline Architecture

```
[Incoming HTTP Request]
        |
        +---> [UseForwardedHeaders] (Extracts Client IP from X-Forwarded-For)
        |
        +---> [UseRateLimiter] (Enforces 10 req/min on /api/v1/auth/login)
        |
        +---> [UseAuthentication] (Validates JWT Bearer Token & Claims)
        |
        +---> [UseAuthorization] (Enforces [Authorize(Roles = "...")] and Branch Scope Policy)
        |
        +---> [ASP.NET Core API Controllers / MediatR Handlers]
```

---

## 2. Reverse Proxy IP Configuration

To prevent IP spoofing behind enterprise load balancers (e.g. Nginx, Azure Application Gateway, F5), the Web API configures `ForwardedHeadersOptions`:
- `ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto`
- Known networks configured to prevent spoofing from untrusted header injection.
