'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL, adminHeaders } from '@/lib/api';
import { DynamicBanner } from '@/components/banners/DynamicBanner';
import { BannerBuilder } from '@/components/banners/BannerBuilder';
import Image from 'next/image';

function BannerPreview({ banner }: { banner: any }) {
  const getBackgroundStyle = () => {
    if (banner.background?.type === 'gradient' && banner.background.gradientColors) {
      const dir = banner.background.gradientDirection || 'to-r';
      const direction = dir === 'to-r' ? 'to right' : dir === 'to-l' ? 'to left' : dir === 'to-b' ? 'to bottom' : dir === 'to-t' ? 'to top' : dir === 'to-br' ? 'to bottom right' : dir === 'to-bl' ? 'to bottom left' : dir === 'to-tr' ? 'to top right' : 'to top left';
      return {
        background: `linear-gradient(${direction}, ${banner.background.gradientColors.join(', ')})`
      };
    }
    if (banner.background?.type === 'solid' && banner.background.color) {
      return { backgroundColor: banner.background.color };
    }
    return {};
  };

  const sortedElements = [...(banner.elements || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  return (
    <div
      className="relative overflow-hidden rounded-xl min-h-[200px] p-6"
      style={getBackgroundStyle()}
    >
      {banner.background?.type === 'image' && banner.background.imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={banner.background.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="relative z-10 flex flex-wrap items-center gap-4">
        {sortedElements.map((element: any, index: number) => {
          if (element.type === 'text') {
            return <div key={index} style={element.style} dangerouslySetInnerHTML={{ __html: element.content }} />;
          }
          if (element.type === 'icon') {
            return <span key={index} className="text-3xl">{element.iconName}</span>;
          }
          if (element.type === 'button') {
            return (
              <button key={index} style={element.style} className="rounded-xl bg-white px-4 py-2 text-sm font-bold">
                {element.content}
              </button>
            );
          }
          if (element.type === 'badge') {
            return (
              <span key={index} style={element.style} className="rounded-full bg-white/20 px-3 py-1 text-xs">
                {element.content}
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/banners`, {
        headers: adminHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setBanners(Array.isArray(data?.data) ? data.data : []);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این بنر اطمینان دارید؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
        method: 'DELETE',
        headers: adminHeaders()
      });

      if (response.ok) {
        fetchBanners();
      }
    } catch (err) {
      alert('خطا در حذف بنر');
    }
  };

  const handleToggleActive = async (banner: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/banners/${banner.id || banner._id}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ active: !banner.active })
      });

      if (response.ok) {
        fetchBanners();
      }
    } catch (err) {
      alert('خطا در به‌روزرسانی بنر');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">مدیریت بنرها</h1>
          <p className="text-sm text-slate-500 mt-1">ایجاد و مدیریت بنرهای خلاقانه</p>
        </div>
        <button
          onClick={() => {
            setEditingBanner(null);
            setShowBuilder(true);
          }}
          className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition"
        >
          + بنر جدید
        </button>
      </div>

      {showBuilder && (
        <BannerBuilder
          banner={editingBanner}
          onClose={() => {
            setShowBuilder(false);
            setEditingBanner(null);
          }}
          onSave={() => {
            fetchBanners();
            setShowBuilder(false);
            setEditingBanner(null);
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">هنوز بنری ایجاد نشده</h3>
          <p className="text-sm text-slate-500 mb-6">با کلیک روی دکمه "بنر جدید" شروع کنید</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id || banner._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{banner.name}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      banner.active
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {banner.active ? 'فعال' : 'غیرفعال'}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {banner.type}
                    </span>
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                      {banner.layout}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    نمایش در: {banner.displayOn?.join(', ') || 'همه صفحات'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>👁️ {banner.views || 0} بازدید</span>
                    <span>👆 {banner.clicks || 0} کلیک</span>
                    <span>⭐ اولویت: {banner.priority || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                      banner.active
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                    }`}
                  >
                    {banner.active ? 'غیرفعال' : 'فعال'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingBanner(banner);
                      setShowBuilder(true);
                    }}
                    className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id || banner._id)}
                    className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">پیش‌نمایش:</p>
                <div className="rounded-xl bg-white p-4 overflow-hidden">
                  <BannerPreview banner={banner} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
