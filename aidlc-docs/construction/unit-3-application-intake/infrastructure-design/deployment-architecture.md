# Deployment Architecture — Unit 3: Application Intake & Document Management

This document defines Kestrel server limits, container volume mounts, and streaming throughput configurations.

---

## 1. Container Volume Mounting

```yaml
services:
  api:
    volumes:
      - managed_agent_storage:/app/storage/attachments
volumes:
  managed_agent_storage:
    driver: local
```

---

## 2. Kestrel Server Body Size & Streaming Buffer

- **Kestrel Max Request Body Size**: 15 MB (`15,728,640 bytes`)
- **Multipart Form Boundary Memory Buffer**: 64 KB (Streams exceeding 64 KB spill directly to disk temporaries rather than LOH memory)
- **CORS Configuration**: Explicit `Content-Disposition` header exposure for direct file download handling.
