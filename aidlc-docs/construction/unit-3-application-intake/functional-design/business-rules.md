# Business Rules & Validation Matrix — Unit 3: Application Intake & Document Management

This document defines validation constraints, national ID checksum algorithms, and mandatory checklist rules.

---

## 1. Thai National ID Modulo 11 Checksum Algorithm

For 13-digit Thai National ID $D_1 D_2 D_3 ... D_{12} D_{13}$:
1. Compute Weighted Sum:
   $$\text{Sum} = \sum_{i=1}^{12} D_i \times (14 - i)$$
2. Compute Checksum:
   $$\text{CheckDigit} = (11 - (\text{Sum} \bmod 11)) \bmod 10$$
3. Validation Rule:
   $$\text{CheckDigit} == D_{13}$$

---

## 2. Mandatory Attachment Checklist Matrix

| Document Type | Individual Agent | Juristic Agent | Max Size | Allowed Extensions |
|---|---|---|---|---|
| Copy of National ID / Tax ID | Mandatory | Mandatory | 10 MB | `.pdf`, `.jpg`, `.png` |
| Copy of Agent / Broker License | Mandatory | Mandatory | 10 MB | `.pdf`, `.jpg`, `.png` |
| Commercial / DBD Registration | Optional | Mandatory | 10 MB | `.pdf`, `.jpg`, `.png` |
| Guarantor National ID | Mandatory (if Credit > 0) | N/A | 10 MB | `.pdf`, `.jpg`, `.png` |
| Guarantor Salary Slip | Mandatory (if Credit > 0) | N/A | 10 MB | `.pdf`, `.jpg`, `.png` |
| Collateral Deed / Bank Guarantee | Mandatory (if Collateralized) | Mandatory (if Collateralized) | 10 MB | `.pdf`, `.jpg`, `.png` |

---

## 3. Submission Gate Rule

An application cannot be submitted (`SubmitByBranch`) if:
1. Agent Profile is missing or incomplete.
2. Individual agent with credit limit $> 0$ has no guarantor.
3. Mandatory attachments are missing from `ApplicationAttachments`.
