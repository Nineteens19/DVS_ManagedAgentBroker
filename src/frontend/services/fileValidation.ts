export interface FileSignatureValidationResult {
  isValid: boolean;
  detectedType?: string;
  errorMessage?: string;
}

/**
 * Validates binary magic byte headers (Anti-Spoofing ISO 27001 requirement)
 */
export async function validateFileMagicBytes(file: File): Promise<FileSignatureValidationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e.target?.result || !(e.target.result instanceof ArrayBuffer)) {
        return resolve({ isValid: false, errorMessage: 'ไม่สามารถอ่านข้อมูลไบนารีของไฟล์ได้' });
      }

      const arr = new Uint8Array(e.target.result).subarray(0, 8);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, '0').toUpperCase();
      }

      // Check PDF (%PDF -> 25 50 44 46)
      if (header.startsWith('25504446')) {
        return resolve({ isValid: true, detectedType: 'application/pdf' });
      }

      // Check JPEG (FF D8 FF)
      if (header.startsWith('FFD8FF')) {
        return resolve({ isValid: true, detectedType: 'image/jpeg' });
      }

      // Check PNG (89 50 4E 47)
      if (header.startsWith('89504E47')) {
        return resolve({ isValid: true, detectedType: 'image/png' });
      }

      // File extension spoofing detected
      resolve({
        isValid: false,
        errorMessage: 'รูปแบบไฟล์ไม่ถูกต้องตาม Header ลายเซ็นดิจิทัล (Security Violation: File spoofing detected)'
      });
    };

    reader.onerror = () => {
      resolve({ isValid: false, errorMessage: 'เกิดข้อผิดพลาดในการตรวจสอบไฟล์' });
    };

    reader.readAsArrayBuffer(file.slice(0, 8));
  });
}

/**
 * Real-time Thai National ID Modulo 11 Checksum Validator
 */
export function validateThaiNationalId(id: string): { isValid: boolean; message: string } {
  if (!id || id.trim() === '') {
    return { isValid: false, message: 'กรุณากรอกเลขประจำตัวประชาชน 13 หลัก' };
  }

  const cleanId = id.replace(/\D/g, '');

  if (cleanId.length !== 13) {
    return { isValid: false, message: `กรอกแล้ว ${cleanId.length}/13 หลัก` };
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanId.charAt(i), 10) * (13 - i);
  }

  const remainder = sum % 11;
  const checkDigit = (11 - remainder) % 10;
  const lastDigit = parseInt(cleanId.charAt(12), 10);

  if (checkDigit === lastDigit) {
    return { isValid: true, message: 'เลขประจำตัวประชาชนถูกต้องตามสูตรคำนวณ' };
  }

  return { isValid: false, message: 'เลขประจำตัวประชาชนไม่ถูกต้อง (Checksum Failed)' };
}

/**
 * PII Data Masking Utility (1-1004-XXXXX-XX-3)
 */
export function maskNationalId(id?: string): string {
  if (!id || id.length !== 13) return id || '-';
  return `${id.substring(0, 1)}-${id.substring(1, 5)}-XXXXX-XX-${id.substring(12, 13)}`;
}

export function maskBankAccount(account?: string): string {
  if (!account || account.length < 8) return account || '-';
  return `XXX-X-XX${account.substring(account.length - 4)}`;
}
