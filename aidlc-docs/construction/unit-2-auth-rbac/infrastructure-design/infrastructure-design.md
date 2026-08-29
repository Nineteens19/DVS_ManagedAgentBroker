# Infrastructure Design — Unit 2: Authentication, RBAC & Organization Service

This document defines the database schemas, seed fixtures, and performance indexing for Unit 2.

---

## 1. Relational Table Schemas

| Table Name | Primary Key | Foreign Keys | Key Indexes |
|---|---|---|---|
| `Users` | `Id` (UniqueIdentifier) | `BranchCode` $\rightarrow$ `Branches.BranchCode` | `IX_Users_Username` (Unique), `IX_Users_Email` (Unique), `IX_Users_BranchCode` |
| `Roles` | `Id` (UniqueIdentifier) | None | `IX_Roles_Code` (Unique) |
| `UserRoles` | `(UserId, RoleId)` | `UserId` $\rightarrow$ `Users.Id`, `RoleId` $\rightarrow$ `Roles.Id` | `IX_UserRoles_UserId_RoleId` |
| `Branches` | `Id` (UniqueIdentifier) | None | `IX_Branches_BranchCode` (Unique) |
| `RefreshTokens` | `Id` (UniqueIdentifier) | `UserId` $\rightarrow$ `Users.Id` | `IX_RefreshTokens_TokenHash` (Unique), `IX_RefreshTokens_UserId` |

---

## 2. Seed Master Data & 6 Persona Demo Fixtures

### 2.1 Corporate Branches
- `HQ`: สำนักงานใหญ่ (Central)
- `5Q`: สาขาอุดรธานี (Northeast)
- `10`: สาขาหาดใหญ่ (South)
- `3A`: สาขาเชียงใหม่ (North)
- `2B`: สาขาชลบุรี (East)

### 2.2 Standard 6 Personas (Default Password: `P@ssword123!`)
1. **`branch.user`**: เจ้าหน้าที่การตลาดสาขาอุดรธานี (`BranchCode: 5Q`, Role: `ROLE_BRANCH_BU`)
2. **`ho.reviewer`**: เจ้าหน้าที่ธุรกิจสาขา สำนักงานใหญ่ (`BranchCode: HQ`, Role: `ROLE_HO_BU`)
3. **`premium.officer`**: เจ้าหน้าที่ฝ่ายการเงินและเบี้ยประกัน (`BranchCode: HQ`, Role: `ROLE_PREMIUM_DEPT`)
4. **`legal.officer`**: นิติกรฝ่ายกฎหมาย (`BranchCode: HQ`, Role: `ROLE_LEGAL_DEPT`)
5. **`md.approver`**: กรรมการผู้จัดการ (MD) (`BranchCode: HQ`, Role: `ROLE_APPROVER_MD`)
6. **`it.admin`**: ผู้ดูแลระบบเทคโนโลยีสารสนเทศ (`BranchCode: HQ`, Role: `ROLE_IT_ADMIN`)
