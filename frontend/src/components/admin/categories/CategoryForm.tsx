'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { toast } from 'react-hot-toast';

interface CategoryFormProps {
  initialData?: any;
  isEditing?: boolean;
}

type CategoryFormState = {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  seoDescription: string;
  seoKeywords: string;
  imageUrl: string;
  icon: string;
  isActive: boolean;
  showOnHome: boolean;
};

export default function CategoryForm({ initialData, isEditing = false }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CategoryFormState>({
    name: initialData?.name || '',
    nameEn: initialData?.nameEn || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    seoDescription: initialData?.seoDescription || '',
    seoKeywords: Array.isArray(initialData?.seoKeywords)
      ? initialData.seoKeywords.join(', ')
      : initialData?.seoKeywords || '',
    imageUrl: initialData?.imageUrl || '',
    icon: initialData?.icon || '🎮',
    isActive: initialData?.isActive ?? true,
    showOnHome: initialData?.showOnHome ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: keyof CategoryFormState) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getAuthToken();
      const url = isEditing 
        ? `${API_BASE_URL}/api/categories/${initialData._id}`
        : `${API_BASE_URL}/api/categories`;
      
      const method = isEditing ? 'PUT' : 'POST';

      // Process keywords
      const dataToSend = {
        ...formData,
        seoKeywords: formData.seoKeywords
          ? formData.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
          : []
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isEditing ? 'دسته‌بندی با موفقیت ویرایش شد' : 'دسته‌بندی با موفقیت ایجاد شد');
        router.push('/admin/categories');
        router.refresh();
      } else {
        toast.error(data.message || 'خطا در ذخیره دسته‌بندی');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">اطلاعات اصلی</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">نام دسته‌بندی (فارسی)</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="مثال: کالای خواب"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">نام انگلیسی</label>
                <input
                  type="text"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleChange}
                  required
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Bedding"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  اسلاگ URL (اختیاری - خودکار ساخته می‌شود)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. bedding-products"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">توضیحات</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="توضیحات کوتاه درباره این دسته‌بندی..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">تنظیمات SEO</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">توضیحات متا (SEO Description)</label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="توضیحات جذاب برای نمایش در نتایج گوگل..."
                />
                <p className="mt-1 text-xs text-slate-500">حداکثر ۱۶۰ کاراکتر پیشنهاد می‌شود.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">کلمات کلیدی (با ویرگول جدا کنید)</label>
                <input
                  type="text"
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="کالای خواب, خرید روتختی, ..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">تنظیمات نمایش</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">آیکون (ایموجی)</label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="🛏️"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">لینک تصویر بنر</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">نمایش در صفحه اصلی</p>
                  <p className="text-xs text-slate-500">با فعال‌سازی، این دسته در بخش «برای هر سلیقه» دیده می‌شود.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('showOnHome')}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    formData.showOnHome ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.showOnHome ? 'translate-x-1' : 'translate-x-6'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-sm font-bold text-slate-700">وضعیت انتشار</span>
                <button
                  type="button"
                  onClick={() => handleToggle('isActive')}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-1' : 'translate-x-6'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 disabled:opacity-70"
          >
            {loading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Icon name="save" size={24} />
                <span>{isEditing ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
