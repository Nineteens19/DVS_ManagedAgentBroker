# Production Deployment Guide — Insurance Agent & Broker Management System

## 1. System Architecture Overview
The system is structured as a cloud-native monorepo:
- **Frontend**: Next.js 14+ standalone Node.js container (Port 3000)
- **Backend API**: ASP.NET Core 8 Web API container (Port 5000)
- **Database**: Microsoft SQL Server 2022 (Port 1433)
- **Background Daemon**: In-process or standalone `SlaSuspensionBackgroundDaemon` (Hourly cron)

---

## 2. Production Environment Variables & Secrets Configuration

### Backend Web API (`appsettings.Production.json` or Environment Variables)
| Variable | Example Value | Description |
|:---|:---|:---|
| `ConnectionStrings__DefaultConnection` | `Server=tcp:sqlserver.corp.local,1433;...` | SQL Server 2022 connection string |
| `SecuritySettings__MasterEncryptionKey` | `MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=` | 256-bit AES Master Key for column encryption |
| `JwtSettings__SecretKey` | `YourHighEntropySuperSecretKey2026!@#$` | HMAC-SHA256 Secret Key for JWT signing |
| `JwtSettings__Issuer` | `ManagedAgentBroker.API` | JWT Issuer URL |
| `JwtSettings__Audience` | `ManagedAgentBroker.Clients` | JWT Audience URL |
| `SmtpSettings__Host` | `smtp.office365.com` | SMTP Relay Host for Executive Approval notifications |
| `SmtpSettings__Port` | `587` | SMTP Port |
| `SmtpSettings__EnableSsl` | `true` | Enforce TLS/SSL email encryption |
| `SmtpSettings__SenderEmail` | `noreply-agentbroker@insurance.co.th` | System sender email address |

### Frontend Web Portal (`.env.production`)
| Variable | Value | Description |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | `https://agentbroker-api.insurance.co.th/api` | Production REST API Gateway |
| `NEXT_PUBLIC_APP_NAME` | `Agent & Broker Management System` | Application Title |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | `false` | Disable demo fallback in production |

---

## 3. Production Deployment Commands

### Option A: Docker Compose Multi-Container Deployment
```bash
# Build and start all services in production mode
docker-compose -f docker-compose.yml up --build -d

# Verify container health status
docker-compose ps
```

### Option B: Kubernetes Deployment (Helm / Manifests)
```bash
# Apply SQL Server, Backend API, and Frontend manifests
kubectl apply -f k8s/
```

---

## 4. Database Migration & Initialization
```bash
# Apply Entity Framework Core database migrations to SQL Server
dotnet ef database update --project src/backend/ManagedAgentBroker.Infrastructure --startup-project src/backend/ManagedAgentBroker.API
```
