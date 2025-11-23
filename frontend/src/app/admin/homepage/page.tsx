'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, adminHeaders } from '@/lib/api';
import { Icon, type IconName } from '@/components/icons/Icon';
import {
  defaultHomeContent,
  type HomeContent,
  type HeroContent,
  type BannerContent,
  type ShippingMethodContent
} from '@/data/homeContent';

interface SectionConfig {
  id: string;
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
}

const SECTION_INFO: Record<string, { name: string; icon: IconName; description: string }> = {
  'hero-carousel': { name: 'اسلایدر اصلی', icon: 'image', description: 'قهرمان و معرفی برند' },
  'popular-games': { name: 'محصولات محبوب', icon: 'trending', description: 'پرفروش‌ترین‌ها' },
  'new-arrivals': { name: 'تازه‌ها', icon: 'star', description: 'جدیدترین محصولات' },
  'categories': { name: 'دسته‌بندی‌ها', icon: 'dashboard', description: 'دسته‌های مورد علاقه' }, // 'grid' is not in IconName, using 'dashboard' as placeholder or need to add 'grid'
  'gaming-gear': { name: 'لوازم خواب تکمیلی', icon: 'cpu', description: 'جانبی‌های خواب' },
  'collectibles': { name: 'اکسسوری‌های دکوراتیو', icon: 'package', description: 'تزئینات اتاق' },
  'testimonials': { name: 'نظرات کاربران', icon: 'message', description: 'بازخورد مشتریان' }, // 'message-circle' -> 'message'
  'trust-signals': { name: 'نشانه‌های اعتماد', icon: 'shield', description: 'گارانتی و پشتیبانی' }
};

const normalizeContent = (incoming?: HomeContent): HomeContent => ({
  ...defaultHomeContent,
  ...(incoming ?? {}),
  hero: {
    ...defaultHomeContent.hero,
    ...(incoming?.hero ?? {}),
    stats: incoming?.hero?.stats && incoming.hero.stats.length > 0 ? incoming.hero.stats : defaultHomeContent.hero.stats
  },
  heroSlides:
    incoming?.heroSlides && incoming.heroSlides.length > 0 ? incoming.heroSlides : defaultHomeContent.heroSlides,
  spotlights: incoming?.spotlights ?? defaultHomeContent.spotlights,
  trustSignals: incoming?.trustSignals ?? defaultHomeContent.trustSignals,
  testimonials: incoming?.testimonials ?? defaultHomeContent.testimonials,
  creativeBanner: {
    ...defaultHomeContent.creativeBanner,
    ...(incoming?.creativeBanner ?? {})
  },
  shippingMethods:
    incoming?.shippingMethods && incoming.shippingMethods.length > 0
      ? incoming.shippingMethods
      : defaultHomeContent.shippingMethods
});

export default function HomepageSettingsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [content, setContent] = useState<HomeContent>(defaultHomeContent);
  const [loading, setLoading] = useState(true);
  const [savingSections, setSavingSections] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
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
        setContent(normalizeContent(data.data.content));
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
    setSections((prev) => prev.map((section) => (section.id === id ? { ...section, enabled: !section.enabled } : section)));
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newSections = [...sections];
    const dragged = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, dragged);
    newSections.forEach((section, idx) => (section.order = idx + 1));
    setSections(newSections);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const saveSections = async () => {
    setSavingSections(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-settings`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ sections })
      });
      const data = await response.json();
      if (response.ok && data.success !== false) {
        showMessage('success', 'چیدمان سکشن‌ها ذخیره شد');
      } else {
        throw new Error(data?.message || 'ذخیره سکشن‌ها انجام نشد');
      }
    } catch (error) {
      console.error('Error saving sections:', error);
      showMessage('error', error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      setSavingSections(false);
    }
  };

  const resetSettings = async () => {
    if (!confirm('تنظیمات به حالت اولیه بازگردانی شود؟')) return;
    setSavingSections(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-settings/reset`, {
        method: 'POST',
        headers: adminHeaders()
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSections(data.data.sections.sort((a: SectionConfig, b: SectionConfig) => a.order - b.order));
        setContent(normalizeContent(data.data.content));
        showMessage('success', 'بازنشانی انجام شد');
      } else {
        throw new Error(data?.message || 'بازنشانی ممکن نیست');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      showMessage('error', error instanceof Error ? error.message : 'بازنشانی انجام نشد');
    } finally {
      setSavingSections(false);
    }
  };

  const saveContent = async () => {
    setSavingContent(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-settings`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      if (response.ok && data.success !== false) {
        showMessage('success', 'محتوای صفحه ذخیره شد');
      } else {
        throw new Error(data?.message || 'ذخیره محتوا انجام نشد');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showMessage('error', error instanceof Error ? error.message : 'امکان ذخیره محتوا نیست');
    } finally {
      setSavingContent(false);
    }
  };

  const updateHero = (field: keyof HeroContent, value: string) => {
    setContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  const updateHeroCta = (cta: 'primaryCta' | 'secondaryCta', field: 'label' | 'href', value: string) => {
    setContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [cta]: {
          ...prev.hero[cta],
          [field]: value
        }
      }
    }));
  };

  const updateHeroStat = (index: number, field: 'label' | 'value', value: string) => {
    setContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: prev.hero.stats.map((stat, idx) => (idx === index ? { ...stat, [field]: value } : stat))
      }
    }));
  };

  const addHeroStat = () => {
    setContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: [...prev.hero.stats, { id: crypto.randomUUID(), label: 'برچسب جدید', value: '۰' }]
      }
    }));
  };

  const removeHeroStat = (index: number) => {
    setContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: prev.hero.stats.filter((_, idx) => idx !== index)
      }
    }));
  };

  const updateSlide = (index: number, field: keyof HeroContent, value: string) => {
    setContent((prev) => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).map((slide, idx) => (idx === index ? { ...slide, [field]: value } : slide))
    }));
  };

  const updateSlideCta = (
    index: number,
    cta: 'primaryCta' | 'secondaryCta',
    field: 'label' | 'href',
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).map((slide, idx) =>
        idx === index
          ? {
              ...slide,
              [cta]: {
                ...slide[cta],
                [field]: value
              }
            }
          : slide
      )
    }));
  };

  const updateSlideStat = (slideIndex: number, statIndex: number, field: 'label' | 'value', value: string) => {
    setContent((prev) => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).map((slide, idx) =>
        idx === slideIndex
          ? {
              ...slide,
              stats: slide.stats.map((stat, sIdx) => (sIdx === statIndex ? { ...stat, [field]: value } : stat))
            }
          : slide
      )
    }));
  };

  const addSlide = () => {
    setContent((prev) => ({
      ...prev,
      heroSlides: [
        ...(prev.heroSlides || []),
        {
          badge: 'اسلاید جدید',
          title: 'عنوان جدید',
          subtitle: 'توضیحات اسلاید',
          primaryCta: { label: 'مشاهده محصولات', href: '/products' },
          secondaryCta: { label: 'اطلاعات بیشتر', href: '#' },
          stats: [],
          image: ''
        }
      ]
    }));
  };

  const removeSlide = (index: number) => {
    setContent((prev) => ({ ...prev, heroSlides: (prev.heroSlides || []).filter((_, idx) => idx !== index) }));
  };

  const updateBannerField = (field: keyof BannerContent, value: string | string[]) => {
    setContent((prev) => ({
      ...prev,
      creativeBanner: {
        ...prev.creativeBanner,
        [field]: value
      }
    }));
  };

  const addShippingMethod = () => {
    setContent((prev) => ({
      ...prev,
      shippingMethods: [
        ...prev.shippingMethods,
        {
          id: crypto.randomUUID(),
          name: 'روش جدید ارسال',
          description: 'توضیحات کوتاه این روش ارسال',
          eta: '۲ تا ۳ روز',
          price: 0,
          badge: 'جدید',
          icon: '🚚',
          perks: []
        }
      ]
    }));
  };

  const updateShippingMethod = <K extends keyof ShippingMethodContent>(
    index: number,
    field: K,
    value: ShippingMethodContent[K]
  ) => {
    setContent((prev) => ({
      ...prev,
      shippingMethods: prev.shippingMethods.map((method, idx) => {
        if (idx !== index) return method;
        const nextValue =
          field === 'price' || field === 'freeThreshold' ? Number(value ?? 0) : (value as ShippingMethodContent[K]);
        return { ...method, [field]: nextValue };
      })
    }));
  };

  const updateShippingPerks = (index: number, perksValue: string) => {
    const perks = perksValue
      .split(',')
      .map((perk) => perk.trim())
      .filter(Boolean);
    setContent((prev) => ({
      ...prev,
      shippingMethods: prev.shippingMethods.map((method, idx) => (idx === index ? { ...method, perks } : method))
    }));
  };

  const removeShippingMethod = (index: number) => {
    setContent((prev) => ({
      ...prev,
      shippingMethods: prev.shippingMethods.filter((_, idx) => idx !== index)
    }));
  };

  const moveShippingMethod = (index: number, direction: 'up' | 'down') => {
    setContent((prev) => {
      const next = [...prev.shippingMethods];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const [removed] = next.splice(index, 1);
      next.splice(newIndex, 0, removed);
      return { ...prev, shippingMethods: next };
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">تنظیمات صفحه اصلی</h1>
          <p className="mt-1 text-sm text-slate-500">همه چیز را بدون کدنویسی مدیریت کنید</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetSettings}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            بازنشانی پیش‌فرض
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <Icon name="arrow-right" size={16} />
            بازگشت
          </button>
        </div>
      </header>

      {message && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-rose-200 bg-rose-50 text-rose-600'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Section ordering */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">مدیریت بخش‌ها</h2>
            <p className="text-sm text-slate-500">کشیدن و رها کردن برای تغییر ترتیب</p>
          </div>
          <button
            type="button"
            onClick={saveSections}
            disabled={savingSections}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg disabled:opacity-70"
          >
            {savingSections ? 'در حال ذخیره...' : 'ذخیره سکشن‌ها'}
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(event) => handleDragOver(event, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                  section.enabled ? 'border-slate-200 bg-white' : 'border-dashed border-slate-300 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2 text-slate-600">
                    <Icon name={SECTION_INFO[section.id]?.icon ?? 'dashboard'} size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{SECTION_INFO[section.id]?.name ?? section.id}</p>
                    <p className="text-xs text-slate-500">{SECTION_INFO[section.id]?.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(section.id)}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    section.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {section.enabled ? 'فعال' : 'غیرفعال'}
                </button>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-[#f8f5f2] p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">راهنما</p>
            <ul className="mt-3 list-disc space-y-2 pr-5">
              <li>با کشیدن هر کارت، ترتیب نمایش روی سایت تغییر می‌کند.</li>
              <li>برای مخفی کردن هر بخش، دکمه فعال/غیرفعال را بزنید.</li>
              <li>برای اعمال تغییرات حتماً روی «ذخیره سکشن‌ها» کلیک کنید.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Content editor */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">ویرایش محتوا</h2>
            <p className="text-sm text-slate-500">عنوان، اسلایدها و بنر را به‌صورت لحظه‌ای تنظیم کنید.</p>
          </div>
          <button
            type="button"
            onClick={saveContent}
            disabled={savingContent}
            className="rounded-xl bg-[#4a3f3a] px-4 py-2 text-sm font-bold text-white shadow-lg disabled:opacity-70"
          >
            {savingContent ? 'در حال ذخیره...' : 'ذخیره محتوا'}
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">قهرمان صفحه</h3>
            <label className="text-xs font-semibold text-slate-500">نشان</label>
            <input
              value={content.hero.badge}
              onChange={(e) => updateHero('badge', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
            />
            <label className="text-xs font-semibold text-slate-500">عنوان</label>
            <textarea
              value={content.hero.title}
              onChange={(e) => updateHero('title', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
            />
            <label className="text-xs font-semibold text-slate-500">زیرعنوان</label>
            <textarea
              value={content.hero.subtitle}
              onChange={(e) => updateHero('subtitle', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-500">CTA اصلی</p>
                <input
                  value={content.hero.primaryCta.label}
                  onChange={(e) => updateHeroCta('primaryCta', 'label', e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  value={content.hero.primaryCta.href}
                  onChange={(e) => updateHeroCta('primaryCta', 'href', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">CTA ثانویه</p>
                <input
                  value={content.hero.secondaryCta.label}
                  onChange={(e) => updateHeroCta('secondaryCta', 'label', e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  value={content.hero.secondaryCta.href}
                  onChange={(e) => updateHeroCta('secondaryCta', 'href', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-[#f8f5f2]/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">آمار</p>
                <button type="button" onClick={addHeroStat} className="text-xs font-bold text-emerald-600">
                  افزودن آمار
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {content.hero.stats.map((stat, index) => (
                  <div key={stat.id ?? index} className="rounded-xl bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>برچسب</span>
                      <button type="button" onClick={() => removeHeroStat(index)} className="text-rose-500">
                        حذف
                      </button>
                    </div>
                    <input
                      value={stat.label}
                      onChange={(e) => updateHeroStat(index, 'label', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <p className="mt-2 text-xs font-semibold text-slate-500">مقدار</p>
                    <input
                      value={stat.value}
                      onChange={(e) => updateHeroStat(index, 'value', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">اسلایدها</h3>
                <button
                  type="button"
                  onClick={addSlide}
                  className="text-xs font-bold text-emerald-600"
                >
                  افزودن اسلاید
                </button>
              </div>
              <div className="space-y-4">
                {content.heroSlides.map((slide, index) => (
                  <div key={index} className="rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                      <span>{slide.badge}</span>
                      <button type="button" onClick={() => removeSlide(index)} className="text-rose-500 text-xs">
                        حذف
                      </button>
                    </div>
                    <input
                      value={slide.badge}
                      onChange={(e) => updateSlide(index, 'badge', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      placeholder="نشان"
                    />
                    <input
                      value={slide.title}
                      onChange={(e) => updateSlide(index, 'title', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="عنوان"
                    />
                    <textarea
                      value={slide.subtitle}
                      onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="توضیحات"
                    />
                    <input
                      value={slide.image || ''}
                      onChange={(e) => updateSlide(index, 'image', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      placeholder="لینک تصویر"
                    />
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">CTA اصلی</p>
                        <input
                          value={slide.primaryCta.label}
                          onChange={(e) => updateSlideCta(index, 'primaryCta', 'label', e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                        />
                        <input
                          value={slide.primaryCta.href}
                          onChange={(e) => updateSlideCta(index, 'primaryCta', 'href', e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">CTA ثانویه</p>
                        <input
                          value={slide.secondaryCta.label}
                          onChange={(e) => updateSlideCta(index, 'secondaryCta', 'label', e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                        />
                        <input
                          value={slide.secondaryCta.href}
                          onChange={(e) => updateSlideCta(index, 'secondaryCta', 'href', e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                    {slide.stats.map((stat, statIndex) => (
                      <div key={stat.id ?? statIndex} className="mt-2 grid gap-2 text-xs">
                        <input
                          value={stat.label}
                          onChange={(e) => updateSlideStat(index, statIndex, 'label', e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5"
                          placeholder="برچسب"
                        />
                        <input
                          value={stat.value}
                          onChange={(e) => updateSlideStat(index, statIndex, 'value', e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5"
                          placeholder="مقدار"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-[#f8f5f2]/60 p-4">
              <h3 className="mb-3 text-base font-semibold text-slate-900">بنر خلاق</h3>
              <div className="grid gap-3">
                <input
                  value={content.creativeBanner.title}
                  onChange={(e) => updateBannerField('title', e.target.value)}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="عنوان"
                />
                <input
                  value={content.creativeBanner.subtitle}
                  onChange={(e) => updateBannerField('subtitle', e.target.value)}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="زیرعنوان"
                />
                <textarea
                  value={content.creativeBanner.description}
                  onChange={(e) => updateBannerField('description', e.target.value)}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="توضیحات"
                />
                <input
                  value={content.creativeBanner.badge}
                  onChange={(e) => updateBannerField('badge', e.target.value)}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="برچسب"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={content.creativeBanner.priceLabel}
                    onChange={(e) => updateBannerField('priceLabel', e.target.value)}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="برچسب قیمت"
                  />
                  <input
                    value={content.creativeBanner.priceValue}
                    onChange={(e) => updateBannerField('priceValue', e.target.value)}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="مقدار"
                  />
                </div>
                <input
                  value={content.creativeBanner.perks.join(', ')}
                  onChange={(e) =>
                    updateBannerField(
                      'perks',
                      e.target.value
                        .split(',')
                        .map((perk) => perk.trim())
                        .filter(Boolean)
                    )
                  }
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="مزیت‌ها (با کاما جدا کنید)"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={content.creativeBanner.ctaLabel}
                    onChange={(e) => updateBannerField('ctaLabel', e.target.value)}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="متن دکمه"
                  />
                  <input
                    value={content.creativeBanner.ctaHref}
                    onChange={(e) => updateBannerField('ctaHref', e.target.value)}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="لینک دکمه"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-[#f8f5f2]/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">روش‌های ارسال</h3>
                  <p className="text-xs text-slate-500">از اینجا کارت‌های تجربه ارسال در سایت و صفحه پرداخت کنترل می‌شوند.</p>
                </div>
                <button type="button" onClick={addShippingMethod} className="text-xs font-bold text-emerald-600">
                  افزودن روش ارسال
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {content.shippingMethods.map((method, index) => (
                  <div key={method.id ?? index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          value={method.icon ?? ''}
                          onChange={(e) => updateShippingMethod(index, 'icon', e.target.value)}
                          className="w-14 rounded-xl border border-slate-200 px-2 py-1 text-center text-xl"
                          placeholder="🚚"
                          maxLength={4}
                        />
                        <input
                          value={method.name}
                          onChange={(e) => updateShippingMethod(index, 'name', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="نام روش"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveShippingMethod(index, 'up')}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveShippingMethod(index, 'down')}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeShippingMethod(index)}
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-500"
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <input
                        value={method.badge ?? ''}
                        onChange={(e) => updateShippingMethod(index, 'badge', e.target.value)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        placeholder="برچسب (مثال: سریع‌ترین)"
                      />
                      <input
                        value={method.eta}
                        onChange={(e) => updateShippingMethod(index, 'eta', e.target.value)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        placeholder="زمان تحویل"
                      />
                    </div>

                    <textarea
                      value={method.description}
                      onChange={(e) => updateShippingMethod(index, 'description', e.target.value)}
                      className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="توضیح کوتاه"
                      rows={2}
                    />

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div>
                        <label className="text-xs text-slate-500">هزینه ارسال (تومان)</label>
                        <input
                          type="number"
                          min={0}
                          value={method.price ?? 0}
                          onChange={(e) => updateShippingMethod(index, 'price', Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">برچسب قیمت</label>
                        <input
                          value={method.priceLabel ?? ''}
                          onChange={(e) => updateShippingMethod(index, 'priceLabel', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="مثال: رایگان"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">ارسال رایگان از</label>
                        <input
                          type="number"
                          min={0}
                          value={method.freeThreshold ?? 0}
                          onChange={(e) => updateShippingMethod(index, 'freeThreshold', Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="مثال: 500000"
                        />
                      </div>
                    </div>

                    <input
                      value={method.perks?.join(', ') ?? ''}
                      onChange={(e) => updateShippingPerks(index, e.target.value)}
                      className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="مزایا را با کاما جدا کنید"
                    />

                    <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={Boolean(method.highlight)}
                        onChange={(e) => updateShippingMethod(index, 'highlight', e.target.checked)}
                      />
                      این روش را به عنوان پیشنهاد ویژه نمایش بده
                    </label>
                  </div>
                ))}

                {content.shippingMethods.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                    هنوز روشی تعریف نشده است.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
