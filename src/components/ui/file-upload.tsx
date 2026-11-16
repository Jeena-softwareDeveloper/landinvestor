'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File, X, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  label?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  value?: string[];
  onChange?: (urls: string[]) => void;
  className?: string;
  folder?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  description = 'PNG, JPG, PDF up to 10MB',
  accept,
  multiple = false,
  value = [],
  onChange,
  className,
  folder = 'land-investment',
}) => {
  const [files, setFiles] = useState<string[]>(value);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFiles(value);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    setUploading(true);
    const toastId = toast.loading(`Uploading ${selected.length} file(s) to Cloudinary...`);

    try {
      const formData = new FormData();
      formData.append('folder', folder);

      for (let i = 0; i < selected.length; i++) {
        formData.append('file', selected[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'File upload failed');
      }

      let uploadedUrls: string[] = [];
      if (json.urls) {
        uploadedUrls = json.urls;
      } else if (json.url) {
        uploadedUrls = [json.url];
      }

      const updated = multiple ? [...files, ...uploadedUrls] : uploadedUrls;
      setFiles(updated);
      onChange?.(updated);

      toast.success(
        json.source === 'cloudinary'
          ? 'Uploaded to Cloudinary CDN successfully!'
          : 'File uploaded successfully!',
        { id: toastId }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error(message, { id: toastId });
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onChange?.(updated);
  };

  const isImage = (url: string) => {
    return (
      url.startsWith('data:image/') ||
      /\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(url) ||
      url.includes('res.cloudinary.com')
    );
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-xs font-semibold text-slate-700">{label}</label>}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed border-slate-200 hover:border-[#2563EB]/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 text-center',
          uploading && 'opacity-60 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2">
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5" />
          )}
        </div>
        <p className="text-sm font-medium text-slate-700">
          {uploading ? 'Uploading to Cloudinary...' : 'Click or drag files to upload'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 pt-1">
          {files.map((fileUrl, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isImage(fileUrl) ? (
                  <div className="w-9 h-9 rounded-md bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={fileUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <File className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate text-xs">
                    {fileUrl.startsWith('data:')
                      ? 'Local image preview'
                      : fileUrl.split('/').pop()?.split('?')[0] || fileUrl}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{fileUrl.includes('cloudinary') ? 'Cloudinary CDN' : 'Ready'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors shrink-0"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
