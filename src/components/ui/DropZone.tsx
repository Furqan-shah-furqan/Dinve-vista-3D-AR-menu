'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { CheckCircle2, Loader2, AlertCircle, Box, Image as ImageIcon } from 'lucide-react';
import { api, STORAGE_BUCKET_IMAGES } from '@/lib/supabase';

interface DropZoneProps {
  label: string;
  accept: string;
  type: 'image' | 'model';
  currentValue?: string;
  onUploaded: (url: string) => void;
  helperText?: string;
  onBusy?: (busy: boolean) => void;
}

export function DropZone({
  label,
  accept,
  type,
  currentValue,
  onUploaded,
  helperText,
  onBusy,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentValue || null);
  const [fileName, setFileName] = useState('');
  const uploading = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: File[]) => {
    const file = type === 'model' ? files.find(item => /\.(glb|gltf)$/i.test(item.name)) : files[0];
    if (uploading.current) return;
    uploading.current = true;
    setError(null);
    setIsUploading(true);
    onBusy?.(true);

    try {
      if (!file) throw new Error('Select one GLB or glTF model with its required files.');
      if (type === 'image' && !/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Choose a JPG, PNG or WebP image.');
      const uploadedUrl = type === 'model' ? await api.uploadModelFiles(files) : await api.uploadFile(file, STORAGE_BUCKET_IMAGES);
      setPreviewUrl(uploadedUrl);
      setFileName(`${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`);
      onUploaded(uploadedUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      uploading.current = false;
      onBusy?.(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-heading font-bold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {type === 'model' && <button type="button" disabled={isUploading} onClick={() => folderInputRef.current?.click()} className="text-[10px] font-bold px-2 py-1 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-200 rounded-custom-mobile border-none transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50">Choose folder</button>}
        {previewUrl && !isUploading && !error && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        )}
      </div>

      {type === 'model' && <input ref={folderInputRef} type="file" multiple {...{ webkitdirectory: '', directory: '' }} aria-label="Upload glTF model folder" className="hidden" onChange={event => { if (event.target.files?.length) void handleFiles(Array.from(event.target.files)); }} />}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={label}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!isUploading) fileInputRef.current?.click(); } }}
        onClick={() => { if (!isUploading) fileInputRef.current?.click(); }}
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
          multiple={type === 'model'}
          className="hidden"
          onClick={(event) => event.stopPropagation()}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              void handleFiles(Array.from(e.target.files));
            }
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-1 text-purple-600 dark:text-purple-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span role="status" className="text-[11px] font-bold">{type === 'model' ? 'Preparing and saving model…' : 'Saving attachment…'}</span>
          </div>
        ) : previewUrl ? (
          <div className="flex items-center gap-3 w-full p-1">
            {type === 'image' ? (
              <div className="relative w-[73px] h-[73px] rounded-2xl overflow-hidden shadow-darker border-none shrink-0">
                <Image
                  src={previewUrl}
                  alt="Upload Preview"
                  fill
                  unoptimized
                  sizes="73px"
                  className="object-cover rounded-2xl"
                />
              </div>
            ) : (
              <div className="w-[73px] h-[73px] rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-darker border-none shrink-0">
                <Box className="w-8 h-8" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-heading font-extrabold text-slate-900 dark:text-white block truncate">
                {fileName || (type === 'image' ? 'Image Attached' : '3D Model Attached')}
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
              Drop {type === 'image' ? 'Food Photo' : '3D GLB / glTF Model'}
            </p>
            <p className="text-[9px] text-slate-400">
              {helperText || (type === 'image' ? 'JPG, PNG, WebP' : '.glb or .gltf + .bin/textures')}
            </p>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-1 flex items-start gap-1 text-[11px] text-red-500 font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>{error}{previewUrl ? ' Previous attachment kept.' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
