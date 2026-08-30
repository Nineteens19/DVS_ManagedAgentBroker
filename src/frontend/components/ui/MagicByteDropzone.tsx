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
      <label className="block text-xs font-semibold text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>

      {uploadedFile ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/40">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-100 truncate">{uploadedFile.fileName}</p>
              <p className="text-[10px] text-emerald-400 flex items-center mt-0.5">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                ตรวจสอบ Magic Byte สำเร็จ ({(uploadedFile.fileSizeBytes / 1024).toFixed(1)} KB)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUploadedFile(null)}
            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
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
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-sky-400 bg-sky-950/30'
              : errorMsg
              ? 'border-rose-500/50 bg-rose-950/10'
              : 'border-slate-700/80 hover:border-sky-500/50 bg-slate-900/40 hover:bg-slate-800/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="p-2 rounded-full bg-slate-800 text-sky-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-sky-400">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์มาวางที่นี่
            </div>
            <p className="text-[10px] text-slate-400">
              รองรับ PDF, JPG, PNG (ตรวจเช็ค Magic Byte Header ป้องกัน Spoofing สูงสุด 10MB)
            </p>
          </div>

          {isValidating && (
            <p className="text-xs text-sky-400 mt-2 animate-pulse">กำลังตรวจสอบลายเซ็นไบนารี Magic Byte...</p>
          )}

          {errorMsg && (
            <div className="mt-2 text-xs text-rose-400 flex items-center justify-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
