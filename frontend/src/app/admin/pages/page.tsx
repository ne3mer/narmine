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

const DEFAULT_PAGES: Page[] = [
  {
    _id: 'contact',
    pageSlug: 'contact',
    title: 'تماس با ما',
    subtitle: 'راه‌های ارتباط با تیم پشتیبانی نرمینه خواب',
    sections: [],
    seo: {
      metaTitle: 'تماس با نرمینه خواب',
      metaDescription: 'ارتباط با پشتیبانی نرمینه خواب برای پیگیری سفارش و مشاوره خرید'
    },
    isActive: true,
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: 'shipping',
    pageSlug: 'shipping',
    title: 'ارسال و تحویل',
    subtitle: 'اطلاعات روش‌های ارسال و زمان تحویل سفارش‌ها',
    sections: [],
    seo: {
      metaTitle: 'روش‌های ارسال نرمینه خواب',
      metaDescription: 'جزئیات ارسال، زمان‌بندی و هزینه‌های تحویل سفارش در نرمینه خواب'
    },
    isActive: true,
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: 'returns',
    pageSlug: 'returns',
    title: 'شرایط بازگشت کالا',
    subtitle: 'ضمانت ۷ روزه بازگشت کالا و فرآیند مرجوعی',
    sections: [],
    seo: {
      metaTitle: 'بازگشت کالا در نرمینه خواب',
      metaDescription: 'آشنایی با شرایط و مراحل بازگشت کالا و بازگشت وجه در نرمینه خواب'
    },
    isActive: true,
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: 'faq',
    pageSlug: 'faq',
    title: 'سوالات متداول',
    subtitle: 'پاسخ به پرتکرارترین سوال‌های مشتریان',
    sections: [],
    seo: {
      metaTitle: 'سوالات متداول نرمینه خواب',
      metaDescription: 'جواب پرسش‌های پرتکرار درباره محصولات، سفارش و خدمات نرمینه خواب'
    },
    isActive: true,
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: 'privacy',
    pageSlug: 'privacy',
    title: 'حریم خصوصی',
    subtitle: 'چگونگی محافظت از اطلاعات شخصی مشتریان',
    sections: [],
    seo: {
      metaTitle: 'سیاست حریم خصوصی نرمینه خواب',
      metaDescription: 'اطلاعات مربوط به نگهداری و استفاده از داده‌های کاربران نرمینه خواب'
    },
    isActive: true,
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

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
    faq: 'info',
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

  const ensuredBasePages = DEFAULT_PAGES.map((defaultPage) => {
    const existing = pages.find((page) => page.pageSlug === defaultPage.pageSlug);
    return existing ?? { ...defaultPage };
  });

  const extraPages = pages.filter(
    (page) => !DEFAULT_PAGES.some((defaultPage) => defaultPage.pageSlug === page.pageSlug)
  );

  const displayPages = [...ensuredBasePages, ...extraPages];

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
      ) : displayPages.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Icon name="file" size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 font-semibold mb-2">هیچ صفحه‌ای یافت نشد</p>
          <p className="text-sm text-slate-500">صفحات به صورت خودکار از فرانت‌اند ایجاد می‌شوند</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayPages.map((page) => (
            <div
              key={page._id || page.pageSlug}
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
                  <Icon name="link" size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-3xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/70 p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <span className="absolute -top-2 -left-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-blue-500 shadow-sm">
              نکته مهم
            </span>
            <Icon name="info" size={28} className="mt-2 flex-shrink-0 text-blue-600" />
          </div>
          <div className="space-y-3 text-sm text-blue-900">
            <div>
              <p className="font-bold">صفحات از دل فرانت‌اند ساخته می‌شوند</p>
              <p className="leading-relaxed text-blue-800/80">
                هر زمان یک فایل صفحه در پروژه وجود داشته باشد، در اینجا هم نسخه‌ای برای مدیریت محتوای همان صفحه ساخته می‌شود.
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-blue-100">
              <p className="mb-2 text-xs font-semibold text-blue-500">چطور ویرایش کنیم؟</p>
              <ul className="list-disc space-y-1 pr-4 text-[13px] text-blue-900/90">
                <li>روی «ویرایش» هر کارت کلیک کن تا وارد ویرایشگر زنده همان صفحه شوی.</li>
                <li>تمام تغییراتت در دیتابیس ذخیره می‌شود و نیاز به دیپلوی جدید نداری.</li>
                <li>با پیش‌نمایش می‌توانی نسخه نهایی را قبل از انتشار ببینی.</li>
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-blue-200/80 px-3 py-1 font-semibold text-blue-900">
                بدون دستکاری کد
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1 font-semibold text-blue-600">
                مناسب تیم محتوا
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
