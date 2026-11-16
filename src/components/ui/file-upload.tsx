'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  label?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  value?: string[];
  onChange?: (urls: string[]) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  description = 'PNG, JPG, PDF up to 10MB',
  multiple = false,
  value = [],
  onChange,
  className,
}) => {
  const [files, setFiles] = useState<string[]>(value);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    setUploading(true);

    // Simulate upload - create local Object URLs or data placeholders
    setTimeout(() => {
      const newUrls: string[] = [];
      for (let i = 0; i < selected.length; i++) {
        newUrls.push(selected[i].name);
      }
      const updated = multiple ? [...files, ...newUrls] : newUrls;
      setFiles(updated);
      onChange?.(updated);
      setUploading(false);
    }, 600);
  };

  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onChange?.(updated);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-xs font-semibold text-slate-700">{label}</label>}

      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed border-slate-200 hover:border-[#2563EB]/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 text-center',
          uploading && 'opacity-60 pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-slate-700">
          {uploading ? 'Processing files...' : 'Click or drag files to upload'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
            >
              <div className="flex items-center gap-2 truncate">
                <File className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate font-medium">{file}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="p-1 text-slate-400 hover:text-rose-500 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
