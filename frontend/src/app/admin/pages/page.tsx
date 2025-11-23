'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL, adminHeaders } from '@/lib/api';

type Page = {
  _id: string;
  pageSlug: string;
  title: string;
  subtitle?: string;
  sections: any[];
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  isActive: boolean;
  updatedAt: string;
};

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pages`, {
        headers: adminHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setPages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const pageIcons: Record<string, string> = {
    contact: 'mail',
    shipping: 'truck',
    returns: 'refresh',
    faq: 'help-circle',
    privacy: 'shield'
  };

  const pageColors: Record<string, string> = {
    contact: 'blue',
    shipping: 'emerald',
    returns: 'amber',
    faq: 'purple',
    privacy: 'rose'
  };

  const getColorClasses = (slug: string) => {
    const color = pageColors[slug] || 'slate';
    const classes: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      amber: 'bg-amber-50 border-amber-200 text-amber-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      rose: 'bg-rose-50 border-rose-200 text-rose-600',
      slate: 'bg-slate-50 border-slate-200 text-slate-600'
    };
    return classes[color];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">مدیریت صفحات</h1>
          <p className="text-sm text-slate-500 mt-1">ویرایش محتوای صفحات ثابت سایت</p>
        </div>
      </header>

      {/* Pages Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Icon name="file" size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 font-semibold mb-2">هیچ صفحه‌ای یافت نشد</p>
          <p className="text-sm text-slate-500">صفحات به صورت خودکار از فرانت‌اند ایجاد می‌شوند</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <div
              key={page._id}
              className="group rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-lg"
            >
              {/* Icon & Status */}
              <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-2xl border p-3 ${getColorClasses(page.pageSlug)}`}>
                  <Icon name={pageIcons[page.pageSlug] as any || 'file'} size={24} />
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  page.isActive 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {page.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </div>

              {/* Title */}
              <h3 className="mb-2 font-serif text-xl font-bold text-slate-900">
                {page.title}
              </h3>
              {page.subtitle && (
                <p className="mb-4 text-sm text-slate-600 line-clamp-2">
                  {page.subtitle}
                </p>
              )}

              {/* Meta */}
              <div className="mb-4 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Icon name="link" size={14} />
                  <span className="font-mono">/{page.pageSlug}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="layers" size={14} />
                  <span>{page.sections.length} بخش</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="clock" size={14} />
                  <span>{new Date(page.updatedAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/pages/${page.pageSlug}/edit`}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-center text-sm font-bold text-white transition-all hover:shadow-lg"
                >
                  ویرایش
                </Link>
                <Link
                  href={`/${page.pageSlug}`}
                  target="_blank"
                  className="flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  <Icon name="external-link" size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-3xl border-2 border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <Icon name="info" size={24} className="mt-0.5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="mb-2 font-bold text-blue-900">نکته مهم</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              صفحات به صورت خودکار از فایل‌های فرانت‌اند ایجاد می‌شوند. برای ویرایش محتوا، روی دکمه "ویرایش" کلیک کنید.
              تغییرات شما در دیتابیس ذخیره می‌شود و می‌توانید محتوای صفحات را بدون تغییر کد مدیریت کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
