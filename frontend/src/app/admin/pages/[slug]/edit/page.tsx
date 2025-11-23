'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL, adminHeaders } from '@/lib/api';

type PageSection = {
  id: string;
  type: 'text' | 'list' | 'faq' | 'contact-info' | 'steps';
  title: string;
  content: string;
  items?: string[];
  order: number;
};

type Page = {
  pageSlug: string;
  title: string;
  subtitle?: string;
  sections: PageSection[];
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  isActive: boolean;
};

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pages/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setPage(data.data);
      } else {
        // Create new page if doesn't exist
        setPage({
          pageSlug: slug,
          title: '',
          subtitle: '',
          sections: [],
          seo: {
            metaTitle: '',
            metaDescription: ''
          },
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/pages/${slug}`, {
        method: 'PUT',
        headers: {
          ...adminHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(page)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'تغییرات با موفقیت ذخیره شد' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'خطا در ذخیره تغییرات' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در ارتباط با سرور' });
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    if (!page) return;

    const newSection: PageSection = {
      id: Date.now().toString(),
      type: 'text',
      title: 'بخش جدید',
      content: '',
      order: page.sections.length
    };

    setPage({
      ...page,
      sections: [...page.sections, newSection]
    });
  };

  const updateSection = (id: string, updates: Partial<PageSection>) => {
    if (!page) return;

    setPage({
      ...page,
      sections: page.sections.map(section =>
        section.id === id ? { ...section, ...updates } : section
      )
    });
  };

  const deleteSection = (id: string) => {
    if (!page) return;

    setPage({
      ...page,
      sections: page.sections.filter(section => section.id !== id)
    });
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    if (!page) return;

    const index = page.sections.findIndex(s => s.id === id);
    if (index === -1) return;

    const newSections = [...page.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    // Update order
    newSections.forEach((section, idx) => {
      section.order = idx;
    });

    setPage({ ...page, sections: newSections });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">صفحه یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-6 py-4 -mx-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <Icon name="arrow-right" size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900">ویرایش صفحه</h1>
              <p className="text-sm text-slate-500">/{slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/${slug}`}
              target="_blank"
              className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <Icon name="link" size={16} />
              <span className="hidden sm:inline">پیش‌نمایش</span>
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            >
              <Icon name="save" size={16} />
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 rounded-xl border-2 p-4 ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              <Icon name={message.type === 'success' ? 'check' : 'x'} size={20} />
              <p className="text-sm font-semibold">{message.text}</p>
            </div>
          </div>
        )}
      </header>

      {/* Basic Info */}
      <section className="rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">اطلاعات پایه</h2>
        
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              عنوان صفحه *
            </label>
            <input
              type="text"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none"
              placeholder="مثال: تماس با ما"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              زیرعنوان (اختیاری)
            </label>
            <input
              type="text"
              value={page.subtitle || ''}
              onChange={(e) => setPage({ ...page, subtitle: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none"
              placeholder="توضیح کوتاه"
            />
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">تنظیمات SEO</h2>
        
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              عنوان متا (Meta Title)
            </label>
            <input
              type="text"
              value={page.seo.metaTitle}
              onChange={(e) => setPage({ ...page, seo: { ...page.seo, metaTitle: e.target.value } })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none"
              placeholder="عنوان برای موتورهای جستجو"
            />
            <p className="mt-1 text-xs text-slate-500">{page.seo.metaTitle.length} / 60 کاراکتر</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              توضیحات متا (Meta Description)
            </label>
            <textarea
              value={page.seo.metaDescription}
              onChange={(e) => setPage({ ...page, seo: { ...page.seo, metaDescription: e.target.value } })}
              rows={3}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none resize-none"
              placeholder="توضیح کوتاه برای موتورهای جستجو"
            />
            <p className="mt-1 text-xs text-slate-500">{page.seo.metaDescription.length} / 160 کاراکتر</p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">بخش‌های محتوا</h2>
          <button
            onClick={addSection}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <Icon name="plus" size={16} />
            افزودن بخش
          </button>
        </div>

        {page.sections.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <Icon name="layers" size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 font-semibold mb-2">هیچ بخشی وجود ندارد</p>
            <p className="text-sm text-slate-500 mb-4">برای شروع، یک بخش اضافه کنید</p>
            <button
              onClick={addSection}
              className="rounded-xl bg-emerald-500 px-6 py-2 text-sm font-bold text-white"
            >
              افزودن اولین بخش
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {page.sections.map((section, index) => (
              <div
                key={section.id}
                className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                      {index + 1}
                    </span>
                    <select
                      value={section.type}
                      onChange={(e) => updateSection(section.id, { type: e.target.value as any })}
                      className="rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
                    >
                      <option value="text">متن</option>
                      <option value="list">لیست</option>
                      <option value="faq">سوال و جواب</option>
                      <option value="contact-info">اطلاعات تماس</option>
                      <option value="steps">مراحل</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30"
                    >
                      <Icon name="chevron-up" size={16} />
                    </button>
                    <button
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === page.sections.length - 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30"
                    >
                      <Icon name="chevron-down" size={16} />
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-rose-200 text-rose-600 transition-all hover:border-rose-300 hover:bg-rose-50"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      عنوان بخش
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      محتوا
                    </label>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      rows={6}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none resize-none font-mono text-sm"
                      placeholder="محتوای بخش را وارد کنید..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
