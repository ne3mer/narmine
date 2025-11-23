'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, adminHeaders } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';

interface SectionConfig {
  id: string;
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
}

const SECTION_INFO: Record<string, { name: string; icon: string; description: string }> = {
  'hero-carousel': {
    name: 'اسلایدر اصلی',
    icon: 'image',
    description: 'کاروسل بنرهای اصلی صفحه'
  },
  'popular-games': {
    name: 'محصولات محبوب',
    icon: 'trending',
    description: 'نمایش پرفروش‌ترین محصولات خواب'
  },
  'new-arrivals': {
    name: 'تازه‌ها',
    icon: 'star',
    description: 'جدیدترین محصولات'
  },
  'categories': {
    name: 'دسته‌بندی‌ها',
    icon: 'grid',
    description: 'نمایش دسته‌بندی‌های محصولات'
  },
  'gaming-gear': {
    name: 'لوازم خواب تکمیلی',
    icon: 'cpu',
    description: 'ویترین ملزومات و لوازم خواب'
  },
  'collectibles': {
    name: 'اکسسوری‌های دکوراتیو',
    icon: 'package',
    description: 'کوسن‌ها و تزئینات اتاق خواب'
  },
  'testimonials': {
    name: 'نظرات کاربران',
    icon: 'message-circle',
    description: 'نمایش نظرات و تجربیات'
  },
  'trust-signals': {
    name: 'نشانه‌های اعتماد',
    icon: 'shield',
    description: 'گارانتی، پشتیبانی، و...'
  }
};

export default function HomepageSettingsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-settings`);
      const data = await response.json();
      if (data.success) {
        setSections(data.data.sections.sort((a: SectionConfig, b: SectionConfig) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showMessage('error', 'خطا در دریافت تنظیمات');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggle = (id: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, enabled: !section.enabled } : section
      )
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);

    newSections.forEach((section, idx) => {
      section.order = idx + 1;
    });

    setSections(newSections);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-settings`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ sections })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'تنظیمات با موفقیت ذخیره شد');
      } else {
        showMessage('error', data.message || 'خطا در ذخیره تنظیمات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید تنظیمات را به حالت پیش‌فرض بازگردانید؟')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-settings/reset`, {
        method: 'POST',
        headers: adminHeaders()
      });

      const data = await response.json();
      if (data.success) {
        setSections(data.data.sections.sort((a: SectionConfig, b: SectionConfig) => a.order - b.order));
        showMessage('success', 'تنظیمات به حالت پیش‌فرض بازگردانده شد');
      } else {
        showMessage('error', data.message || 'خطا در بازگردانی تنظیمات');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      showMessage('error', 'خطا در بازگردانی تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">تنظیمات صفحه اصلی</h1>
          <p className="mt-1 text-sm text-slate-500">مدیریت بخش‌های نمایش داده شده در صفحه اصلی</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <Icon name="arrow-right" size={16} />
          بازگشت
        </button>
      </header>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:opacity-50"
        >
          <Icon name="save" size={16} />
          {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <Icon name="refresh" size={16} />
          بازگردانی به پیش‌فرض
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Icon name="info" size={14} />
          <span>برای تغییر ترتیب، بخش‌ها را بکشید و رها کنید</span>
        </div>

        {sections.map((section, index) => {
          const info = SECTION_INFO[section.id] || { name: section.id, icon: 'box', description: '' };
          
          return (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group cursor-move rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                draggedIndex === index ? 'opacity-50' : ''
              } ${section.enabled ? 'border-slate-200' : 'border-slate-100 bg-slate-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 text-slate-400 transition group-hover:text-slate-600">
                  <Icon name="menu" size={20} />
                </div>

                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                  section.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Icon name={info.icon as any} size={20} />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{info.name}</h3>
                  <p className="text-xs text-slate-500">{info.description}</p>
                </div>

                <div className="flex-shrink-0 rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  #{section.order}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(section.id)}
                  className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
                    section.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      section.enabled ? 'right-0.5' : 'right-5'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Icon name="eye" size={20} className="text-blue-600" />
          <div>
            <h3 className="font-bold text-blue-900">پیش‌نمایش تغییرات</h3>
            <p className="mt-1 text-sm text-blue-700">
              برای مشاهده تغییرات، ابتدا ذخیره کنید و سپس{' '}
              <a href="/" target="_blank" className="underline">
                صفحه اصلی
              </a>{' '}
              را مشاهده کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
