# AI-DLC for Antigravity Bundle

โฟลเดอร์นี้รวบรวมไฟล์ที่พร้อมสำหรับนำไปวางในโปรเจกต์อื่น ๆ ที่ใช้งานกับ **Antigravity**

---

## 📁 โครงสร้างในชุด Bundle

```text
antigravity-aidlc-bundle/
├── .agents/
│   ├── rules/
│   │   └── aidlc-workflow.md       # Project Rule สำหรับ Antigravity
│   └── skills/
│       └── aidlc/
│           └── SKILL.md            # Antigravity Skill Definition
├── .aidlc-rule-details/            # กฎระเบียบย่อยทุกขั้นตอน
│   ├── common/
│   ├── inception/
│   ├── construction/
│   ├── extensions/
│   └── operations/
├── install.sh                      # Script สำหรับติดตั้งลงโปรเจกต์ปลายทางอัตโนมัติ
└── README.md                       # คู่มือการใช้งาน
```

---

## 🚀 วิธีนำไปใช้งานกับโปรเจกต์อื่น

### วิธีที่ 1: ใช้ Script ติดตั้งอัตโนมัติ (ง่ายที่สุด)

เปิด Terminal แล้วรันคำสั่ง:

```bash
# ติดตั้งลงในโฟลเดอร์โปรเจกต์ปลายทาง
/Users/nineteen/Project_dev/awslabs_aidlc_workflows/antigravity-aidlc-bundle/install.sh /path/to/your-project
```

---

### วิธีที่ 2: Copy โฟลเดอร์ด้วยคำสั่ง Shell

```bash
# คัดลอก .agents และ .aidlc-rule-details ไปยังโปรเจกต์ปลายทาง
cp -R /Users/nineteen/Project_dev/awslabs_aidlc_workflows/antigravity-aidlc-bundle/.agents /path/to/your-project/
cp -R /Users/nineteen/Project_dev/awslabs_aidlc_workflows/antigravity-aidlc-bundle/.aidlc-rule-details /path/to/your-project/
```

---

### วิธีที่ 3: Copy ผ่าน Finder (ลากและวาง)

1. เข้าไปที่โฟลเดอร์ `antigravity-aidlc-bundle`
2. กด `Cmd + Shift + .` ใน Mac Finder เพื่อแสดง Hidden Files (ไฟล์ที่ขึ้นต้นด้วยจุด `.`)
3. ลากโฟลเดอร์ `.agents` และ `.aidlc-rule-details` ไปวางที่ Root ของโปรเจกต์ปลายทาง

---

## 💬 การเรียกใช้งานใน Antigravity

เมื่อเปิดโปรเจกต์ปลายทางใน Antigravity แล้ว ให้เริ่มพิมพ์คำสั่ง:

```text
Using AI-DLC, [สิ่งที่ต้องการพัฒนาหรือแก้ไข]
```
