'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { API_BASE_URL, adminHeaders, resolveImageUrl } from '@/lib/api';

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
  label?: string;
}

export function ImageUpload({ currentImage, onImageUploaded, label = 'تصویر کاور' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with currentImage prop
  useEffect(() => {
    setPreview(currentImage ? resolveImageUrl(currentImage) : '');
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم فایل نباید بیشتر از 5 مگابایت باشد');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: adminHeaders(false), // Don't set Content-Type for FormData
        body: formData
      });

      if (!response.ok) {
        throw new Error('خطا در آپلود تصویر');
      }

      const data = await response.json();
      const imageUrl = resolveImageUrl(data.data?.url);
      
      setPreview(imageUrl);
      onImageUploaded(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در آپلود تصویر');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-slate-700">{label}</label>
      
      {preview && (
        <div className="relative h-48 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {uploading ? 'در حال آپلود...' : preview ? 'تغییر تصویر' : 'انتخاب تصویر'}
        </button>
        
        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview('');
              onImageUploaded('');
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
          >
            حذف تصویر
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-rose-600">{error}</p>
      )}

      <p className="text-xs text-slate-500">
        فرمت‌های مجاز: JPG, PNG, WEBP - حداکثر حجم: 5MB
      </p>
    </div>
  );
}
