'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Trash2 } from 'lucide-react';
import { validateFileMagicBytes } from '../../services/fileValidation';
import { AttachmentDto } from '../../types/domain';

interface MagicByteDropzoneProps {
  onFileValidated: (attachment: AttachmentDto) => void;
  documentType: string;
  label: string;
  required?: boolean;
}

export const MagicByteDropzone: React.FC<MagicByteDropzoneProps> = ({
  onFileValidated,
  documentType,
  label,
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<AttachmentDto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setIsValidating(true);

    try {
      // 1. Client-Side Magic Byte Binary Verification
      const validation = await validateFileMagicBytes(file);
      if (!validation.isValid) {
        setErrorMsg(validation.errorMessage || 'ไฟล์ไม่ถูกต้องตาม Header ลายเซ็นดิจิทัล');
        setIsValidating(false);
        return;
      }

      // 2. Check File Size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('ขนาดไฟล์เกินขีดจำกัด 10MB');
        setIsValidating(false);
        return;
      }

      // 3. Create Validated Attachment Record
      const newAttachment: AttachmentDto = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        fileName: file.name,
        fileSizeBytes: file.size,
        contentType: validation.detectedType || file.type,
        documentType: documentType,
        uploadedAt: new Date().toISOString(),
      };

      setUploadedFile(newAttachment);
      onFileValidated(newAttachment);
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการตรวจสอบไฟล์');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {uploadedFile ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50/80 border border-green-200 shadow-sm">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 rounded-lg bg-green-100 text-green-700">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-gray-800 truncate">{uploadedFile.fileName}</p>
              <p className="text-[11px] text-green-700 flex items-center mt-0.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                ตรวจสอบ Magic Byte Header ถูกต้อง ({(uploadedFile.fileSizeBytes / 1024).toFixed(1)} KB)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUploadedFile(null)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-150 ${
            isDragging
              ? 'border-primary bg-blue-50/50'
              : errorMsg
              ? 'border-red-300 bg-red-50/50'
              : 'border-gray-300 hover:border-primary bg-white hover:bg-gray-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="p-2 rounded-full bg-blue-50 text-primary">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs text-gray-700">
              <span className="font-semibold text-primary">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์มาวางที่นี่
            </div>
            <p className="text-[11px] text-gray-400">
              รองรับ PDF, JPG, PNG (ตรวจสอบ Magic Byte ป้องกันปลอมนามสกุลไฟล์ สูงสุด 10MB)
            </p>
          </div>

          {isValidating && (
            <p className="text-xs text-primary mt-2 animate-pulse font-medium">
              กำลังตรวจสอบลายเซ็นไบนารี Magic Byte...
            </p>
          )}

          {errorMsg && (
            <div className="mt-2 text-xs text-red-600 flex items-center justify-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
