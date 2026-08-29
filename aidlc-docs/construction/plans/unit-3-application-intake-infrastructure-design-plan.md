# Infrastructure Design Plan — Unit 3: Application Intake & Document Management Service (F-CM-035 & F-CM-018)

## Purpose
This plan outlines the file system storage mapping, directory structures, storage configuration parameters, and deployment boundaries for **Unit 3: Application Intake & Document Management Service**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define Infrastructure Design (`infrastructure-design.md`)**
  - [x] Physical directory layout mapping (`storage/attachments/{yyyy}/{MM}/{appId}/`)
  - [x] Configuration schema in `appsettings.json` for storage base paths and file limits
  - [x] Disk cleanup and orphan file reconciliation background strategy

- [x] **Step 2: Define Deployment Architecture (`deployment-architecture.md`)**
  - [x] Container volume mounting strategy for Docker (`/app/storage` persistent volume)
  - [x] Web API multipart request body size limits configuration (Kestrel `MaxRequestBodySize = 15MB`)

---

## Planning Questions for Unit 3 Infrastructure Design

Please answer the following questions to help finalize the infrastructure setup. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Local File Storage Path Configuration
สำหรับการจัดเก็บไฟล์ในสภาพแวดล้อม Development / Container ต้องการกำหนด Base Path ใน `appsettings.json` อย่างไร?

A) Configurable Relative Path (`storage/attachments`) with auto-creation of missing directory trees *(Recommended)*

B) Hardcoded Absolute Path

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Kestrel Multipart Body Size Limit
เนื่องจากระบบรองรับการอัปโหลดไฟล์ขนาดสูงสุด 10MB ต้องการกำหนด Max Request Body Size บน Kestrel Server เท่าใดเพื่อความปลอดภัย?

A) 15 MB (`15,728,640 bytes`) เพื่อรองรับ Multipart Form Boundary Overhead *(Recommended)*

B) 50 MB

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
