# Build Instructions — Insurance Agent & Broker Management System

## Prerequisites
- **Backend**: .NET 8.0 SDK (`dotnet --version` >= 8.0.0)
- **Frontend**: Node.js 20+ LTS (`node --version` >= 20.0.0), npm (`npm --version` >= 10.0.0)
- **Database**: Microsoft SQL Server 2022 (Local, Remote, or via Docker)
- **Container Tooling**: Docker Engine & Docker Compose v2+
- **Environment Variables**:
  - `ConnectionStrings__DefaultConnection`: Connection string for SQL Server 2022
  - `SecuritySettings__MasterEncryptionKey`: Base64 encoded 256-bit AES encryption key
  - `JwtSettings__SecretKey`: HMAC-SHA256 signing key for JWT tokens
  - `NEXT_PUBLIC_API_URL`: Backend REST API URL (`http://localhost:5000/api`)
  - `NEXT_PUBLIC_ENABLE_DEMO_MODE`: `true` for standalone in-memory preview fallback

---

## Build Steps

### 1. Restore & Build Backend (.NET 8 Solution)
```bash
# Build the entire backend solution (Domain, Infrastructure, API, and Tests)
dotnet build
```

### 2. Install & Build Frontend (Next.js 14 Standalone)
```bash
# Navigate to frontend and install dependencies
cd src/frontend
npm install

# Build Next.js 14 standalone bundle
npm run build
```

### 3. Build & Run Unified Multi-Container Stack (Docker Compose)
```bash
# Build and launch SQL Server 2022, ASP.NET Core API, and Next.js Web Portal
docker-compose up --build -d
```

### 4. Verify Build Success
- **Backend Artifacts**: `src/backend/ManagedAgentBroker.API/bin/Debug/net8.0/ManagedAgentBroker.API.dll`
- **Frontend Artifacts**: `src/frontend/.next/standalone/server.js`, `src/frontend/.next/static/`
- **Expected Ports**:
  - Frontend Web Portal: `http://localhost:3000`
  - Backend REST API / Swagger: `http://localhost:5000/swagger`
  - Microsoft SQL Server 2022: `localhost:1433`
