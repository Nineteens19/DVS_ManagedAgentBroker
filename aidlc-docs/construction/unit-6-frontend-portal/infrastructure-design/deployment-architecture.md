# Deployment Architecture & Containerization — Unit 6: Next.js Enterprise Web Portal

## Overview
This document specifies the multi-stage container build process, Docker Compose topology, and monorepo execution orchestration for the Next.js Enterprise Web Portal.

---

## 1. Multi-Stage Dockerfile (`src/frontend/Dockerfile`)

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

---

## 2. Monorepo Docker Compose Stack (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  database:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: agentbroker-db
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=Password123!
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql/data
    networks:
      - agentbroker-net

  backend-api:
    build:
      context: .
      dockerfile: src/backend/Dockerfile
    container_name: agentbroker-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Server=database,1433;Database=ManagedAgentBrokerDb;User Id=sa;Password=Password123!;TrustServerCertificate=True;
      - SecuritySettings__MasterEncryptionKey=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=
    ports:
      - "5000:8080"
    depends_on:
      - database
    networks:
      - agentbroker-net

  frontend-portal:
    build:
      context: ./src/frontend
      dockerfile: Dockerfile
    container_name: agentbroker-portal
    environment:
      - NEXT_PUBLIC_API_URL=http://backend-api:8080/api
      - NEXT_PUBLIC_ENABLE_DEMO_MODE=true
    ports:
      - "3000:3000"
    depends_on:
      - backend-api
    networks:
      - agentbroker-net

volumes:
  sqlserver-data:

networks:
  agentbroker-net:
    driver: bridge
```

---

## 3. Monorepo Root Script (`package.json`)

```json
{
  "name": "managed-agent-broker-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev:frontend": "cd src/frontend && npm run dev",
    "dev:backend": "dotnet run --project src/backend/ManagedAgentBroker.API",
    "dev": "npm run dev:frontend",
    "build:frontend": "cd src/frontend && npm run build",
    "build:backend": "dotnet build",
    "test:backend": "dotnet test",
    "docker:up": "docker-compose up --build -d",
    "docker:down": "docker-compose down"
  }
}
```
