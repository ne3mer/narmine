'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { API_BASE_URL, adminHeaders, resolveImageUrl } from '@/lib/api';

interface MultiImageUploadProps {
  currentImages?: string[];
  onImagesChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({ 
  currentImages = [], 
  onImagesChange, 
  label = 'گالری تصاویر',
  maxImages = 10
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(currentImages);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(currentImages.map((img) => resolveImageUrl(img)));
  }, [currentImages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`حداکثر ${maxImages} تصویر می‌توانید آپلود کنید`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
          method: 'POST',
          headers: adminHeaders(false),
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = resolveImageUrl(data.data?.url);
          if (imageUrl) {
            uploadedUrls.push(imageUrl);
          }
        }
      }

      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChange(newImages);
    } catch (err) {
      setError('خطا در آپلود تصاویر');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-slate-700">{label}</label>
      
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <Image
                src={img}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 rounded-lg bg-rose-500 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {uploading ? 'در حال آپلود...' : `افزودن تصویر (${images.length}/${maxImages})`}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-rose-600">{error}</p>
      )}

      <p className="text-xs text-slate-500">
        فرمت‌های مجاز: JPG, PNG, WEBP - حداکثر حجم هر تصویر: 5MB
      </p>
    </div>
  );
}
