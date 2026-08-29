# NFR Requirements Plan — Unit 2: Authentication, RBAC & Organization Service

## Purpose
This plan outlines the non-functional requirements (NFRs), security controls, cryptographic algorithms, and rate limiting policies for **Unit 2: Authentication, RBAC & Organization Directory Service**.

---

## Execution Checklist

- [x] **Step 1: Define NFR Requirements (`nfr-requirements.md`)**
  - [x] Password Hashing & Salt generation standards (PBKDF2 HMAC-SHA512 / BCrypt)
  - [x] JWT Signing specifications (HS256 / RS256, Claims structure, ClockSkew: 0)
  - [x] Brute-force protection & API Rate Limiting (10 requests/minute on `/api/v1/auth/login`)
  - [x] Audit trail for authentication events (Login Success, Login Failure, Token Refresh, Account Lockout)

- [x] **Step 2: Define Tech Stack Decisions (`tech-stack-decisions.md`)**
  - [x] ASP.NET Core Authentication (`Microsoft.AspNetCore.Authentication.JwtBearer`)
  - [x] Password hashing provider (`Microsoft.AspNetCore.Identity.IPasswordHasher<T>`)
  - [x] Rate limiting middleware (`Microsoft.AspNetCore.RateLimiting`)

---

## Planning Questions for Unit 2 NFR Requirements

Please answer the following questions to help finalize security standards and technical decisions. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Password Hashing Standard
สำหรับบัญชีผู้ใช้ระบบภายใน (Local Database Credentials) ต้องการใช้มาตรฐาน Password Hashing ใด?

A) ASP.NET Core Identity PasswordHasher (PBKDF2 with HMAC-SHA512, 100,000 Iterations, 128-bit Salt) *(Recommended ตามมาตรฐานความปลอดภัยสูงสุด)*

B) BCrypt (`BCrypt.Net-Next` with Work Factor 12)

C) Argon2id

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: JWT Token Signing Algorithm
สำหรับการ Sign และ Verify JWT Access Token ต้องการใช้ Algorithm ใด?

A) HMAC-SHA256 (HS256) ด้วย Symmetric Secret Key 256-bit จาก Key Vault / Configuration *(Recommended สำหรับความเร็วและความเสถียรของ Web API + Next.js)*

B) RSA-SHA256 (RS256) ด้วย Asymmetric Private/Public Key Pair

X) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

### Question 3: Brute-Force & Rate Limiting Strategy on Login API
ต้องการจำกัดอัตราการเรียก API ล็อกอิน (`/api/v1/auth/login`) ต่อ Client IP อย่างไรเพื่อป้องกัน Brute-force attack?

A) Fixed Window Rate Limiting (สูงสุด 10 ครั้งต่อนาที ต่อ IP Address พร้อม Response `429 Too Many Requests` เมื่อเกินเกณฑ์) *(Recommended)*

B) Sliding Window Rate Limiting (สูงสุด 5 ครั้งต่อ 30 วินาที)

C) No API Rate Limiting (ใช้เฉพาะ Account Lockout ระดับ Username)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
