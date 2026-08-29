# Deployment Architecture — Unit 1: Core Domain & DB Schema

This document details the local container setup and enterprise deployment topology for Unit 1.

---

## 1. Local Development Docker Compose Configuration

```yaml
version: '3.8'

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: mab-sqlserver-dev
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=DevPassword123!
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P DevPassword123! -C -Q 'SELECT 1' || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s
    restart: unless-stopped

volumes:
  sqlserver-data:
    driver: local
```

---

## 2. Enterprise Production Deployment Topology

```
+-------------------------------------------------------------------------------+
|                           Enterprise Load Balancer / Ingress                  |
|                        (TLS 1.3 Termination, HTTPS Port 443)                  |
+-------------------------------------------------------------------------------+
                                        |
                    +-------------------+-------------------+
                    |                                       |
                    v                                       v
    +-------------------------------+       +-------------------------------+
    |  Next.js 14+ Frontend Portal  |       |  ASP.NET Core 8 Web API Node  |
    |  (Container / Port 3000)      |       |  (Container / Port 5000)      |
    +-------------------------------+       +-------------------------------+
                                                            |
                                                            v
                                            +-------------------------------+
                                            |   MS SQL Server 2022 Cluster  |
                                            |   (Always On / Port 1433)     |
                                            +-------------------------------+
```
