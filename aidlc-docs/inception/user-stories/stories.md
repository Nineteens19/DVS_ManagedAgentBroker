# User Stories — Agent & Broker Management System

This document contains INVEST-compliant user stories with Gherkin BDD acceptance criteria organized by Epics and end-to-end User Journeys.

---

## Epic 1: Digital Intake & Application Form Processing (F-CM-035)

### Story US-1.1: Create & Draft Agent Application
- **As a**: Branch Business Development Officer (`ROLE_BRANCH_BU`)
- **I want to**: create a new digital agent/broker application with personal details, guarantor info, and collateral details
- **So that**: I can initiate the onboarding process digitally without relying on paper forms.
- **Primary Persona**: Somsak (Branch BU)
- **Traceability**: `FR-1.1`, `FR-1.2`, `FR-1.4` | `SECURITY-05` (Input Validation)

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Successfully create a draft agent application
  Given Somsak is authenticated as "ROLE_BRANCH_BU"
  When he fills in agent details with valid Thai ID "1234567890123", name "สมชาย ใจดี", credit limit 100000, and guarantor details
  And clicks "Save Draft"
  Then the system generates a unique Application Number "APP-YYYYMMDD-XXXX"
  And saves the application in "DRAFT" status with an audit timestamp
  And displays a success confirmation message.

Scenario: Validation failure on invalid credit terms or salary ratio
  Given Somsak is creating an application
  When he enters a Credit Term exceeding 45 days for Non-Motor or enters guarantor salary less than policy threshold
  Then the system displays validation errors highlighting the invalid fields
  And prevents submission until corrected.
```

---

### Story US-1.2: Upload & Manage Supporting Attachments
- **As a**: Branch Business Development Officer (`ROLE_BRANCH_BU`)
- **I want to**: upload scanned copies of the ID card, broker license, bank book, and contract bundle (F-CM-018)
- **So that**: all required supporting documentation is digitized and attached to the application package.
- **Primary Persona**: Somsak (Branch BU)
- **Traceability**: `FR-1.3` | `SECURITY-01` (Encrypted Storage), `SECURITY-05` (File Validation)

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Upload valid PDF/Image attachments
  Given an application in "DRAFT" status
  When Somsak uploads "ID_Card.pdf", "Broker_License.pdf", and "Bank_Book.pdf" (each under 10MB)
  Then the system validates file types (PDF, PNG, JPG), runs antivirus scan, and stores files encrypted in Object Storage
  And associates the file URLs with the application record.

Scenario: Reject disallowed file extensions or oversized files
  Given an application in "DRAFT" status
  When Somsak attempts to upload an executable file ".exe" or file exceeding 25MB
  Then the system rejects the upload with error "Invalid file type or file size exceeded".
```

---

### Story US-1.3: Mandatory Schema Validation for Automated Deves Mastermanagement Intake
- **As a**: Branch Business Development Officer (`ROLE_BRANCH_BU`)
- **I want to**: be guided by real-time frontend and backend validation enforcing 100% schema completeness required by Deves Mastermanagement
- **So that**: the application payload is zero-defect and can be provisioned into Deves Master automatically without human IT intervention.
- **Primary Persona**: Somsak (Branch BU)
- **Traceability**: `FR-1.5` | `SECURITY-05` (Input Validation & Invariant Checking)

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Complete intake submission passes schema validation
  Given Somsak has filled in all mandatory fields: Thai/EN names, Modulo-11 validated Citizen ID, complete address with postal code, bank account for payout, valid OIC license and expiry, branch/handler code, credit limit, guarantor income, and collateral evaluation
  When he clicks "Submit Application to Head Office"
  Then the system validates 100% schema compliance against Deves Master specifications
  And transitions status to "SUBMITTED_BRANCH"
  And displays confirmation that the application is forwarded to Head Office.

Scenario: Incomplete intake submission is blocked with specific field errors
  Given an application missing bank account details or with an invalid Citizen ID checksum
  When Somsak attempts to submit
  Then the system blocks the submission
  And highlights the exact missing fields with error "Deves Master required field is missing or invalid".
```

---

## Epic 2: Compliance Screening & Risk Verification (AMLO / OIC)

### Story US-2.1: Automated AMLO (ปปง.) Screening
- **As a**: Head Office Business Officer (`ROLE_HO_BU`)
- **I want to**: automatically verify applicant and guarantor names against AMLO Designated Person and PEP lists
- **So that**: the company complies with anti-money laundering regulations and prevents onboarding sanctioned individuals.
- **Primary Persona**: Pornthip (HO BU)
- **Traceability**: `FR-2.1` | `NFR-RES-02` (Circuit Breaker & Fallback), `SECURITY-03` (Audit Logging)

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Applicant is clear of AMLO sanctions
  Given application "APP-001" is submitted to Head Office
  When the automated AMLO screening service evaluates the applicant and guarantor
  Then the system records AMLO status as "PASSED" with verification timestamp and log reference
  And allows the application to proceed to OIC screening.

Scenario: Applicant is identified on AMLO Designated Persons list
  Given application "APP-002" contains an individual matching the Designated Persons list
  When the AMLO screening executes
  Then the system flags the application as "AMLO_REJECTED"
  And automatically captures the screening evidence
  And notifies Pornthip and AMLO Compliance Officer with an urgent high-risk alert.
```

---

### Story US-2.2: Automated OIC (คปภ.) Blacklist & License Screening
- **As a**: Head Office Business Officer (`ROLE_HO_BU`)
- **I want to**: automatically verify the broker/agent license validity and disciplinary rating with OIC
- **So that**: uncertified or blacklisted agents are blocked immediately.
- **Primary Persona**: Pornthip (HO BU)
- **Traceability**: `FR-2.2` | `PBT-01` (Color Rating Invariant)

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: License check returns Green (Clean) status
  Given application "APP-003" with valid active license
  When the OIC screening service is executed
  Then the system sets OIC status to "GREEN" (Valid) and displays license expiration date.

Scenario: License check returns Red (Blacklist) status
  Given application "APP-004" with revoked or blacklisted license
  When the OIC screening service returns Red status
  Then the system flags the application as "OIC_REJECTED"
  And generates a rejection notification to the submitting branch.

Scenario: License check returns Orange/Yellow status
  Given application "APP-005" with conditional rating
  When the OIC screening returns "ORANGE" or "YELLOW"
  Then the system flags the record for Division Director manual review and approval.
```

---

## Epic 3: Multi-Department Review & EAS Electronic Approval

### Story US-3.1: Head Office Review & Reject Checklist
- **As a**: Head Office Business Officer (`ROLE_HO_BU`)
- **I want to**: review the application and either approve or return with a structured reject checklist
- **So that**: defects are clearly communicated to branch officers for correction.
- **Primary Persona**: Pornthip (HO BU)
- **Traceability**: `FR-3.1`, `FR-3.2`

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Head Office approves and forwards application
  Given application "APP-001" has passed AMLO and OIC screenings
  When Pornthip reviews the complete dossier and clicks "Forward to EAS Approval"
  Then the system transitions status to "PENDING_EAS_APPROVAL"
  And dispatches the approval bundle to the EAS integration service.

Scenario: Head Office rejects with checklist items
  Given application "APP-001" has an illegible ID copy and missing guarantor salary slip
  When Pornthip selects checklist items ["Illegible ID Card", "Incomplete Guarantor Document"] and enters remark
  And clicks "Return to Branch"
  Then the system transitions status to "RETURNED_FOR_CORRECTION"
  And sends an email/notification to Somsak at the submitting branch.
```

---

### Story US-3.2: EAS Digital Signing & Executive Approval
- **As an**: Executive Approver (`ROLE_APPROVER_MD` / Director)
- **I want to**: review application summary and sign approval electronically via integrated EAS
- **So that**: management sign-off is completed securely and without paper routing.
- **Primary Persona**: Dr. Chaiwat (MD / Director)
- **Traceability**: `FR-3.3` | `SECURITY-01` (Digital Signature Verification)

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Executive approves application in EAS
  Given application "APP-001" is in "PENDING_EAS_APPROVAL"
  When Dr. Chaiwat signs the electronic approval in EAS
  Then EAS notifies the Agent Management API via webhook/callback
  And the system records the digital signature timestamp and cryptographic hash
  And transitions status to "REVIEW_PREMIUM" (Forwarded to Premium Dept).

Scenario: Executive rejects application in EAS
  Given application "APP-001" in EAS
  When Dr. Chaiwat rejects the application with reason "Credit limit too high for new broker"
  Then the system updates status to "EAS_REJECTED" and notifies all relevant department officers.
```

---

## Epic 4: 100% Automated Deves Mastermanagement Provisioning & Core Integration

### Story US-4.1: 100% Automated Deves Mastermanagement Provisioning (Zero Manual IT Intervention)
- **As a**: Premium Management Officer (`ROLE_PREMIUM_DEPT`)
- **I want to**: approve credit terms and trigger fully automated background provisioning into Deves Mastermanagement and downstream core systems
- **So that**: Agent and Source codes are generated and granted provisional selling rights immediately without requiring IT staff to manually key in data.
- **Primary Persona**: Kittipong (Premium Dept)
- **Traceability**: `FR-3.2`, `FR-4.1`, `FR-4.2`, `FR-4.3` | `NFR-RES-03` (Idempotent Execution)

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Automated provisioning into Deves Master grants provisional selling rights (เปิดขายชั่วคราว)
  Given application "APP-001" has received executive approval via EAS/Portal and credit approval from Premium Dept
  When Kittipong confirms the credit line and approves onboarding
  Then the system automatically constructs the 100% complete intake payload
  And executes the automated provisioning call to Deves Mastermanagement
  And receives generated Agent Code "AG-90812", Source Code "SRC-101", and Unit Executive "UE-01"
  And automatically cascades sync to downstream systems:
    | Target System | Automated Action Executed |
    | AS400 Core   | Sets Agent/Source active for policy issuance and selling |
    | APAR         | Maps Vendor/Payable account |
    | SAP          | Provisions Business Partner financial entity |
    | PCSDIS       | Configures Node and maps Commission Schedule |
  And transitions application status to "ACTIVE_TEMPORARY" (Provisional Selling Active)
  And starts the 30-Day SLA timer on Calendar Days for physical contract delivery
  And sends real-time notifications to Somsak (Branch) and the agent that selling rights are active.

Scenario: Resilient automated retry upon Deves Master or core system transient error
  Given the Deves Master or downstream interface returns a transient timeout (503) during provisioning
  When the automated flow executes
  Then the system records the pending/partial state and enqueues an idempotent retry with exponential backoff
  And alerts IT Admin Voravit in the Health & Exception Dashboard without requiring manual data entry.
```

---

### Story US-4.2: IT Admin Exception & Health Dashboard
- **As an**: IT Administrator (`ROLE_IT_ADMIN`)
- **I want to**: monitor the health of automated provisioning pipelines, view sync logs, and trigger retries on external system timeouts
- **So that**: I can ensure high system reliability and zero dropped provisioning requests without performing manual data entry in production.
- **Primary Persona**: Voravit (System Admin / Auditor)
- **Traceability**: `FR-4.3` | `NFR-RES-04` (Health Checks & Structured Logging)

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: IT Admin views automated sync health and triggers retry
  Given an external downstream system was temporarily unreachable
  When Voravit accesses the IT Exception Dashboard
  Then he sees the failed provisioning transaction with detailed error code and timestamp
  And can click "Retry Provisioning Sync" to re-dispatch the payload idempotently.
```

---

## Epic 5: SLA Document Tracking & Automated Selling Suspension (ระงับการส่งงาน Auto)

### Story US-5.1: Physical Hard-Copy Receipt & SLA Verification
- **As a**: Legal & Compliance Officer (`ROLE_LEGAL_DEPT`)
- **I want to**: inspect and acknowledge receipt of physical contract packages (F-CM-018) within the SLA window
- **So that**: compliant agents are promoted to Permanent Active status and SLA defect notices are tracked automatically.
- **Primary Persona**: Nattaporn (Legal Dept)
- **Traceability**: `FR-5.1`, `FR-5.2`

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Hard copy verified within 30-day SLA promotes agent to Permanent Active
  Given agent "AG-90812" is in "ACTIVE_TEMPORARY" (Provisional Selling)
  When Nattaporn receives the original signed physical contract package, validates wet signatures, and clicks "Verify & Archive Hard Copy"
  Then the system records the archive box number and physical receipt timestamp
  And promotes agent status to "ACTIVE_PERMANENT" (Permanent Selling Rights)
  And stops all active SLA timers.

Scenario: Legal issues a Defect Notice starting the 30-Day SLA correction timer
  Given original contract has missing guarantor signatures
  When Nattaporn issues a Defect Notice with reject checklist items
  Then the system starts the automated "30-Day SLA Correction Countdown"
  And dispatches urgent notifications to Branch BU and Premium Dept.
```

---

### Story US-5.2: Automated Policy Submission Blocking & Auto-Suspension (ระบบระงับการส่งงาน Auto)
- **As an**: Automated Compliance Background Daemon (`ROLE_IT_ADMIN`)
- **I want to**: automatically block policy submission and suspend selling rights across core systems when the 30-day SLA is breached, and permanently terminate at 90 days
- **So that**: unauthorized selling and corporate risk are prevented immediately without requiring human intervention.
- **Primary Persona**: Voravit (System Admin / Auditor)
- **Traceability**: `FR-5.2`, `FR-5.3` | `PBT-05` (Timer Boundary Invariants)

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Automatic Policy Submission Suspension upon 30-Day SLA breach (ระงับการส่งงาน Auto)
  Given agent "AG-90812" has reached Day 31 of the SLA timer without verified original contract completion
  When the automated daily SLA Compliance Daemon runs at midnight
  Then the system executes API commands to Deves Master and AS400 to set agent status to "SUSPENDED_TEMPORARY"
  And cascades suspension to ALL Source codes linked under agent "AG-90812"
  And immediately blocks all new policy issuance and submission permissions in the core systems
  And flags the application status as "SUSPENDED_30D" (ระงับการส่งงาน Auto)
  And broadcasts high-priority alerts to Branch BU (Somsak) and Premium Dept (Kittipong) for debt containment.

Scenario: Source-Specific Suspension on branch condition failure
  Given agent "AG-90812" has source "SRC-101" (Chiang Mai) and source "SRC-102" (Phuket)
  When source "SRC-102" encounters a localized defect or compliance lock
  Then the system locks only source "SRC-102"
  And allows agent "AG-90812" and source "SRC-101" to continue operating normally.

Scenario: Automatic Permanent Termination upon 90-Day SLA expiration (ปิดรหัสถาวร Auto)
  Given agent "AG-90812" remains suspended and reaches Day 91 without contract resolution
  When the automated SLA Compliance Daemon runs
  Then the system automatically revokes all credentials and sets status to "TERMINATED_PERMANENT" across Deves Master, AS400, SAP, and PCSDIS
  And permanently closes the Agent/Source codes.
```

---

## Epic 6: Real-Time Operational Dashboards & Committee Reports

### Story US-6.1: Real-Time Workflow & SLA Dashboard
- **As an**: Operational User across any department (`ROLE_BRANCH_BU`, `ROLE_HO_BU`, `ROLE_PREMIUM_DEPT`, `ROLE_LEGAL_DEPT`)
- **I want to**: view a filtered dashboard showing pending tasks, urgent SLA deadlines, and active defect timers
- **So that**: I can prioritize urgent work and prevent bottlenecks.
- **Primary Persona**: Somsak, Pornthip, Kittipong, Nattaporn
- **Traceability**: `FR-6.1` | `SECURITY-01` (RBAC Filtering)

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Department officer views role-filtered dashboard
  Given Pornthip logs in as "ROLE_HO_BU"
  When she accesses the Dashboard
  Then the dashboard displays KPI cards for "Pending HO Review", "AMLO/OIC In-Progress", and "SLA Warning (<24h)"
  And displays the interactive queue sorted by priority and submission date.
```

---

### Story US-6.2: Monthly Credit Committee Report Export
- **As an**: Executive Approver or Premium Head (`ROLE_APPROVER_MD`, `ROLE_PREMIUM_DEPT`)
- **I want to**: generate and export the monthly Agent/Broker Onboarding & Credit Committee Report
- **So that**: executive committees can evaluate monthly agent portfolio growth, credit risk exposure, and contract compliance.
- **Primary Persona**: Kittipong, Dr. Chaiwat
- **Traceability**: `FR-6.2`

#### Acceptance Criteria (Gherkin BDD):
```gherkin
Scenario: Export monthly Credit Committee Report
  Given Kittipong selects month "August 2026"
  When he clicks "Export Credit Committee Report (Excel/PDF)"
  Then the system compiles metrics for Total New Agents, Total Credit Granted, Number of Active Temporary vs Permanent, and List of Suspended Agents
  And generates the downloadable report in standard corporate format.
```
