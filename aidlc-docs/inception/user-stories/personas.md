# User Personas — Agent & Broker Management System

This document outlines the comprehensive user personas interacting with the Agent & Broker Management System across all operational branches and head office departments.

---

## Persona 1: Branch Business Development Officer (เจ้าหน้าที่ฝ่ายธุรกิจสาขา)
- **Role Code**: `ROLE_BRANCH_BU`
- **Archetype Name**: Somsak (สมศักดิ์ — ผู้ประสานงานสาขาภูมิภาค)
- **Department**: ฝ่ายธุรกิจสาขาย่อย (Branch Business Unit)
- **Primary Goals**:
  - รับเรื่องและจัดทำคำขอเปิดรหัสตัวแทน/นายหน้ารายใหม่ (F-CM-035) ได้อย่างรวดเร็วและถูกต้อง
  - อัปโหลดเอกสารหลักฐานและสแกนชุดสัญญา (F-CM-018) เข้าระบบโดยไม่ต้องส่งเอกสารทางไปรษณีย์ล่วงหน้า
  - ตรวจสอบสถานะคำขอและ SLA ของแต่ละคำขอได้แบบ Real-Time เพื่อตอบข้อซักถามของตัวแทน
  - รับแจ้งเตือนเมื่อเอกสารมีข้อผิดพลาดเพื่อแก้ไขและส่งเอกสารจริงกลับไปยังสำนักงานใหญ่ได้ทันกำหนด
- **Pain Points in Legacy Workflow**:
  - การจัดส่งเอกสารกระดาษทางไปรษณีย์ใช้เวลานานและเสี่ยงต่อการสูญหาย
  - ไม่ทราบว่าเรื่องอยู่ที่ฝ่ายใด หรือติดปัญหาอะไร
  - การแก้ไขเอกสารใช้เวลานาน ทำให้ตัวแทนเริ่มขายงานได้ล่าช้า
- **Key Permissions**:
  - Create & Edit Agent Draft Application
  - Upload & Replace Scanned Documents
  - Submit Application to Head Office Review
  - Track Application Status & Document Dispatch

---

## Persona 2: Head Office Business Unit Officer (เจ้าหน้าที่ฝ่ายธุรกิจ สำนักงานใหญ่)
- **Role Code**: `ROLE_HO_BU`
- **Archetype Name**: Pornthip (พรทิพย์ — เจ้าหน้าที่ฝ่ายธุรกิจส่วนกลาง)
- **Department**: ฝ่ายธุรกิจ สนญ. (Head Office Business Unit)
- **Primary Goals**:
  - ตรวจสอบความถูกต้อง ครบถ้วนของข้อมูลคำขอและเอกสารแนบจากสาขาทั่วประเทศ
  - ดำเนินการคัดกรองความเสี่ยงบุคคล (AMLO / ปปง.) และตรวจสอบใบอนุญาต/สถานะ คปภ. (OIC Blacklist)
  - นำส่งเรื่องให้ผู้บริหารฝ่ายและกรรมการผู้จัดการพิจารณาลงนามผ่านระบบ EAS
  - ส่งต่อเอกสารที่ผ่านการอนุมัติให้ฝ่ายบริหารจัดการเบี้ยประกันภัย
- **Pain Points in Legacy Workflow**:
  - ต้องตรวจสอบรายชื่อ ปปง. และ คปภ. แบบ Manual และแคปหน้าจอเก็บไว้
  - ปัญหาความเสี่ยงจากการปล่อยให้ตัวแทนขายงานก่อนกระบวนการตรวจสอบเสร็จสมบูรณ์
  - การส่งต่อระหว่างฝ่ายผ่านกระดาษล่าช้าและยากต่อการจัดทำรายงานควบคุม
- **Key Permissions**:
  - Review & Verify Branch Application Submissions
  - Trigger & Review Automated AMLO/OIC Screenings
  - Initiate Reject Checklist & Return for Branch Correction
  - Forward Application to EAS Approval / Executive Signer
  - Handover Approved Applications to Premium Dept

---

## Persona 3: Premium Management Officer (เจ้าหน้าที่ฝ่ายบริหารจัดการเบี้ยประกันภัย)
- **Role Code**: `ROLE_PREMIUM_DEPT`
- **Archetype Name**: Kittipong (กิตติพงษ์ — เจ้าหน้าที่ตรวจสอบวงเงินและเบี้ย)
- **Department**: ฝ่ายบริหารจัดการเบี้ยประกันภัย (Premium Department)
- **Primary Goals**:
  - ตรวจสอบวงเงินเครดิต (Credit Line) เทียบกับหลักทรัพย์ค้ำประกันและเงินเดือนผู้ค้ำประกัน
  - อนุมัติการเปิดขายชั่วคราว (Provisional Selling) และส่ง Trigger ให้ระบบ Auto-Provisioning ทำงานอัตโนมัติ 100%
  - ตรวจรับเอกสารสัญญาฉบับจริงก่อนส่งต่อสำนักนิติกรรม
  - รับแจ้งเตือนอัตโนมัติเมื่อตัวแทนถูกระงับการส่งงาน (Auto-Suspended) เพื่อควบคุมความเสี่ยงและติดตามเบี้ยค้างชำระ
- **Pain Points in Legacy Workflow**:
  - ต้องคำนวณและเทียบเงินเดือนกับวงเงินเครดิตแบบ Manual
  - การประสานงานส่งต่อให้ฝ่าย IT เปิดรหัสแบบ Manual ทำให้เกิดความล่าช้าและผิดพลาดได้ง่าย
  - ขาดระบบแจ้งเตือนและระงับการส่งงานอัตโนมัติเมื่อสัญญาผิดนัด SLA
- **Key Permissions**:
  - Credit Limit & Collateral Verification
  - Approve Provisional Selling & Trigger 100% Automated Multi-System Provisioning
  - View Automated Commission & Unit Executive (UE) Configuration Logs
  - Monitor Auto-Suspended Agent Portfolio & Debt Collection

---

## Persona 4: Legal & Compliance Officer (เจ้าหน้าที่สำนักนิติกรรม)
- **Role Code**: `ROLE_LEGAL_DEPT`
- **Archetype Name**: Nattaporn (ณัฐพร — นิติกรตรวจสอบสัญญาและหลักประกัน)
- **Department**: สำนักนิติกรรม (Legal Department)
- **Primary Goals**:
  - ตรวจสอบความสมบูรณ์ทางกฎหมายของชุดสัญญา F-CM-018 และหลักประกัน
  - ตรวจรับและบันทึกการรับเอกสารฉบับจริง (Hard Copy) เข้าคลังเอกสาร เพื่อปรับสถานะเป็น "เปิดขายถาวร"
  - แจ้งบันทึกข้อบกพร่อง (Defect Memorandum) ซึ่งจะเริ่มนับเวลา SLA ถอยหลังอัตโนมัติ
  - มั่นใจได้ว่าหากสาขาไม่แก้ไขภายใน 30 วัน ระบบจะ "ระงับการส่งงาน Auto" และหากเกิน 90 วัน จะ "ปิดรหัสถาวร Auto" โดยไม่ต้องสั่งการซ้ำ
- **Pain Points in Legacy Workflow**:
  - ไม่สามารถติดตามได้ว่าสัญญาฉบับจริงค้างอยู่ที่สาขาหรือฝ่ายใด
  - สัญญาที่แก้ไขไม่ทันกำหนดไม่ถูกระงับรหัสโดยอัตโนมัติ ทำให้บริษัทแบกรับความเสี่ยงการขายงานโดยไม่มีสัญญา
  - การค้นหาเอกสารสัญญาฉบับจริงเพื่อการตรวจสอบประจำปีทำได้ยาก
- **Key Permissions**:
  - Legal Contract Bundle Verification (F-CM-018)
  - Log & Acknowledge Physical Hard-Copy Receipt (Promote to Permanent Active)
  - Issue Defect Notice (Starts Automated 30-Day / 90-Day SLA Suspension Watcher)
  - Archive Contract for Annual Audit & Compliance Inspection

---

## Persona 5: Executive Approver & Signer (ผู้มีอำนาจลงนาม / ผู้บริหาร)
- **Role Code**: `ROLE_APPROVER_MD`
- **Archetype Name**: Dr. Chaiwat (ดร.ชัยวัฒน์ — กรรมการผู้จัดการ / ผู้อำนวยการฝ่าย)
- **Department**: ฝ่ายบริหารระดับสูง (Executive Management / EAS Approver)
- **Primary Goals**:
  - ตรวจสอบสรุปข้อมูลคำขอ ผลการคัดกรองความเสี่ยง ปปง./คปภ. และหลักทรัพย์ค้ำประกัน
  - ลงนามอนุมัติคำขอเปิดรหัสและชุดสัญญาทางอิเล็กทรอนิกส์ผ่านระบบ EAS
  - ติดตามภาพรวมรายงานการเปิดตัวแทนนายหน้าและสถานะสัญญาประจำเดือน
- **Pain Points in Legacy Workflow**:
  - แฟ้มเอกสารกระดาษรอลงนามจำนวนมาก ขาดความสะดวกในการลงนามนอกสถานที่
  - ขาดข้อมูลสรุปความเสี่ยงที่ชัดเจนก่อนการตัดสินใจลงนาม
- **Key Permissions**:
  - Review Executive Application Summary
  - Electronic Approval / Rejection via Integrated EAS
  - Access Executive Monthly Summary & Credit Committee Reports

---

## Persona 6: System Administrator & Compliance Auditor (ผู้ดูแลระบบและผู้ตรวจสอบ)
- **Role Code**: `ROLE_IT_ADMIN`
- **Archetype Name**: Voravit (วรวิทย์ — ผู้ดูแลระบบและวิศวกรความปลอดภัย)
- **Department**: ฝ่ายพัฒนาระบบสารสนเทศและกำกับดูแล (IT & Audit)
- **Primary Goals**:
  - ดูแลความพร้อมใช้งาน ความปลอดภัย และความเสถียรของระบบ (99.9% Availability, SLA)
  - ติดตามการทำงานของ Background Automated Flows (Core Provisioning, Auto-Suspension Daemon)
  - กำกับดูแลตามมาตรฐาน ISO27001 โดยเจ้าหน้าที่ IT ไม่มีหน้าที่คีย์ข้อมูลเปิดรหัสในระบบงาน Production
- **Key Permissions**:
  - System Configuration & Role Management
  - Monitor Automated Background Flows & Integration Connectors
  - View Security Audit Trail & Health Dashboard
  - Manage Core Service Connectors & Retry Queue
