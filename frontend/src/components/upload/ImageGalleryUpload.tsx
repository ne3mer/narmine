'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { API_BASE_URL, adminHeaders, resolveImageUrl } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';

interface ImageGalleryUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

export function ImageGalleryUpload({ 
  images = [], 
  onImagesChange, 
  label = 'گالری تصاویر',
  maxImages = 10 
}: ImageGalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`حداکثر ${maxImages} تصویر مجاز است`);
      return;
    }

    setUploading(true);
    setError('');

    const newImages: string[] = [];
    const errors: string[] = [];

    try {
      // Upload files sequentially to maintain order (or parallel for speed)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name}: فرمت نامعتبر`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          errors.push(`${file.name}: حجم بیش از 5MB`);
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
          const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
            method: 'POST',
            headers: adminHeaders(false),
            body: formData
          });

          if (!response.ok) throw new Error('Upload failed');

          const data = await response.json();
          newImages.push(data.data.url);
        } catch (err) {
          errors.push(`${file.name}: خطا در آپلود`);
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }

      if (errors.length > 0) {
        setError(errors.join(', '));
      }
    } catch (err) {
      setError('خطای کلی در آپلود تصاویر');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) || 
      (direction === 'right' && index === images.length - 1)
    ) return;

    const newImages = [...images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-slate-700">
          {label} <span className="text-slate-400 font-normal">({images.length}/{maxImages})</span>
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="plus" size={16} />
          {uploading ? 'در حال آپلود...' : 'افزودن تصویر'}
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((url, index) => (
          <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <Image
              src={resolveImageUrl(url)}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover transition group-hover:scale-105"
              unoptimized
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => moveImage(index, 'right')}
                disabled={index === images.length - 1}
                className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/40 disabled:opacity-30"
                title="جابجایی به راست"
              >
                <Icon name="arrow-right" size={16} />
              </button>
              
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="rounded-lg bg-rose-500/80 p-2 text-white hover:bg-rose-500"
                title="حذف"
              >
                <Icon name="trash" size={16} />
              </button>

              <button
                type="button"
                onClick={() => moveImage(index, 'left')}
                disabled={index === 0}
                className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/40 disabled:opacity-30"
                title="جابجایی به چپ"
              >
                <Icon name="arrow-left" size={16} />
              </button>
            </div>

            {/* Index Badge */}
            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white backdrop-blur-sm">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Empty State / Add Button Placeholder */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <Icon name="image" size={24} />
            <span className="text-xs font-bold">افزودن</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 border border-rose-100">
          {error}
        </div>
      )}
      
      <p className="text-xs text-slate-500">
        اولین تصویر به عنوان تصویر اصلی (کاور) استفاده خواهد شد.
      </p>
    </div>
  );
}
