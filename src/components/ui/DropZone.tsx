'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { CheckCircle2, Loader2, AlertCircle, Box, Image as ImageIcon } from 'lucide-react';
import { api, STORAGE_BUCKET_IMAGES, STORAGE_BUCKET_MODELS } from '@/lib/supabase';

interface DropZoneProps {
  label: string;
  accept: string;
  type: 'image' | 'model';
  currentValue?: string;
  onUploaded: (url: string) => void;
  helperText?: string;
}

export function DropZone({
  label,
  accept,
  type,
  currentValue,
  onUploaded,
  helperText,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentValue || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const bucket = type === 'image' ? STORAGE_BUCKET_IMAGES : STORAGE_BUCKET_MODELS;
      const uploadedUrl = await api.uploadFile(file, bucket);
      setPreviewUrl(uploadedUrl);
      onUploaded(uploadedUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-heading font-bold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {previewUrl && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-[10px] rounded-custom-mobile transition-all duration-300 ease-in-out cursor-pointer select-none min-h-[95px] shadow-darker border-none ${
          isDragging
            ? 'bg-purple-100 dark:bg-purple-900/60 scale-102'
            : previewUrl
            ? 'bg-emerald-50 dark:bg-emerald-950/30'
            : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-1 text-purple-600 dark:text-purple-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-[11px] font-bold">Uploading file...</span>
          </div>
        ) : previewUrl ? (
          <div className="flex items-center gap-3 w-full p-1">
            {type === 'image' ? (
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-darker border-none shrink-0">
                <Image
                  src={previewUrl}
                  alt="Upload Preview"
                  fill
                  unoptimized
                  sizes="48px"
                  className="object-cover rounded-2xl"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-darker border-none shrink-0">
                <Box className="w-6 h-6 animate-pulse" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-heading font-extrabold text-slate-900 dark:text-white block truncate">
                {type === 'image' ? 'Image Attached' : '3D Model Attached'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                Click or drop to replace
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-1">
            <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-soft border-none">
              {type === 'image' ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <Box className="w-4 h-4" />
              )}
            </div>
            <p className="text-[11px] font-heading font-bold text-slate-800 dark:text-slate-200">
              Drop {type === 'image' ? 'Food Photo' : '3D .GLB Model'}
            </p>
            <p className="text-[9px] text-slate-400">
              {helperText || (type === 'image' ? 'JPG, PNG, WebP' : '.glb 3D files')}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-red-500 font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
