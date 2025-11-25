'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { ImageGalleryUpload } from '@/components/upload/ImageGalleryUpload';
import CategorySelector from '@/components/admin/products/CategorySelector';
import type { NewProductState, ProductRow } from '@/types/admin';
import { Icon } from '@/components/icons/Icon';

const RichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor').then((mod) => ({ default: mod.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-slate-200 p-4 text-center text-slate-500">در حال بارگذاری ویرایشگر...</div>
    )
  }
);

const parseList = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

type EditableProductState = NewProductState & { detailedDescription: string };

type StatusState = {
  type: 'success' | 'error';
  message: string;
} | null;

type TabType = 'basic' | 'media' | 'metadata' | 'seo' | 'variants';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params?.id;
  const [formState, setFormState] = useState<EditableProductState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [discountPercent, setDiscountPercent] = useState<string>('');

  const loadProduct = useCallback(async (silent = false) => {
    if (!productId) return;
    if (!silent) {
      setLoading(true);
      setStatus(null);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${productId}`);
      if (!response.ok) {
        throw new Error('دریافت اطلاعات محصول با خطا مواجه شد.');
      }
      const json = await response.json();
      const product: ProductRow | undefined = json?.data;
      if (!product) {
        throw new Error('محصول مورد نظر یافت نشد.');
      }

      const releaseDateStr = product.releaseDate 
        ? new Date(product.releaseDate).toISOString().split('T')[0]
        : '';

      setFormState({
        title: product.title ?? '',
        slug: product.slug ?? '',
        description: product.description ?? '',
        detailedDescription: product.detailedDescription ?? '',
        genre: product.genre?.join(', ') ?? '',
        platform: product.platform ?? '',
        regionOptions: product.regionOptions?.join(', ') ?? '',
        basePrice: product.basePrice != null ? String(product.basePrice) : '',

        coverUrl: product.coverUrl ?? '',
        gallery: product.gallery ?? [],
        tags: product.tags?.join(', ') ?? '',
        categories: product.categories ?? [],
        trailerUrl: product.trailerUrl ?? '',
        gameplayVideoUrl: product.gameplayVideoUrl ?? '',
        screenshots: product.screenshots?.join(', ') ?? '',
        rating: product.rating != null ? String(product.rating) : '',
        releaseDate: releaseDateStr,
        developer: product.developer ?? '',
        publisher: product.publisher ?? '',
        ageRating: product.ageRating ?? '',
        features: product.features?.join(', ') ?? '',
        systemRequirementsMinimum: product.systemRequirements?.minimum ?? '',
        systemRequirementsRecommended: product.systemRequirements?.recommended ?? '',
        metaTitle: product.metaTitle ?? '',
        metaDescription: product.metaDescription ?? '',
        featured: Boolean(product.featured),
        onSale: Boolean(product.onSale),
        salePrice: product.salePrice != null ? String(product.salePrice) : '',
        options: product.options?.map(opt => ({ ...opt, values: opt.values.join(', ') })) ?? [],
        variants: product.variants ?? []
      });
      
      // Calculate initial discount percent
      if (product.basePrice && product.salePrice && product.basePrice > product.salePrice) {
        const percent = Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100);
        setDiscountPercent(String(percent));
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'بروزرسانی محصول ممکن نیست.'
      });
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleFieldChange = (field: keyof NewProductState, value: string | boolean) => {
    setFormState((prev) => {
      const newState = prev ? { ...prev, [field]: value } : prev;
      
      // Auto-calculate discount percentage if sale price or base price changes
      if (prev && (field === 'salePrice' || field === 'basePrice')) {
        const base = Number(field === 'basePrice' ? value : prev.basePrice);
        const sale = Number(field === 'salePrice' ? value : prev.salePrice);
        
        if (base > 0 && sale > 0 && sale < base) {
          const percent = Math.round(((base - sale) / base) * 100);
          setDiscountPercent(String(percent));
        } else if (field === 'salePrice' && !value) {
          setDiscountPercent('');
        }
      }
      
      return newState;
    });
  };

  const handleDiscountChange = (percentStr: string) => {
    setDiscountPercent(percentStr);
    if (!formState) return;

    const percent = Number(percentStr);
    const base = Number(formState.basePrice);
    
    if (base > 0 && percent > 0 && percent <= 100) {
      const sale = Math.round(base * (1 - percent / 100));
      // Round to nearest 1000 for cleaner prices
      const roundedSale = Math.round(sale / 1000) * 1000;
      handleFieldChange('salePrice', String(roundedSale));
      handleFieldChange('onSale', true);
    } else if (!percentStr) {
      handleFieldChange('salePrice', '');
    }
  };

  const handleScreenshotsChange = (value: string) => {
    setFormState((prev) => (prev ? { ...prev, screenshots: value } : prev));
  };

  const handleOptionNameChange = (id: string, name: string) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            options: prev.options.map((opt) => (opt.id === id ? { ...opt, name } : opt))
          }
        : prev
    );
  };

  const handleOptionValuesChange = (id: string, valuesStr: string) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            options: prev.options.map((opt) =>
              opt.id === id ? { ...opt, values: valuesStr } : opt
            )
          }
        : prev
    );
  };

  const handleAddOption = () => {
    setFormState((prev) =>
      prev ? { ...prev, options: [...prev.options, { id: crypto.randomUUID(), name: '', values: '' }] } : prev
    );
  };

  const handleRemoveOption = (id: string) => {
    setFormState((prev) =>
      prev ? { ...prev, options: prev.options.filter((opt) => opt.id !== id) } : prev
    );
  };

  const handleVariantChange = (id: string, field: 'price' | 'stock', value: number) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            variants: prev.variants.map((variant) =>
              variant.id === id ? { ...variant, [field]: value } : variant
            )
          }
        : prev
    );
  };

  const generateVariants = () => {
    setFormState((prev) => {
      if (!prev || !prev.options.length) return prev;

      const generateCombinations = (optionIndex: number, current: Record<string, string>): Record<string, string>[] => {
        if (optionIndex === prev.options.length) {
          return [current];
        }

        const option = prev.options[optionIndex];
        if (!option || !option.values || !option.name) {
          return [];
        }

        const combinations: Record<string, string>[] = [];
        for (const value of parseList(option.values)) {
          combinations.push(
            ...generateCombinations(optionIndex + 1, {
              ...current,
              [option.name]: value
            })
          );
        }

        return combinations;
      };

      const combinations = generateCombinations(0, {});
      if (!combinations.length) {
        return prev;
      }

      const basePrice = Number(prev.basePrice) || 0;

      return {
        ...prev,
        variants: combinations.map((combo) => ({
          id: crypto.randomUUID(),
          selectedOptions: combo,
          price: basePrice,
          stock: 10
        }))
      };
    });
  };

  const handleSaveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState) return;

    if (!ADMIN_API_KEY) {
      setStatus({
        type: 'error',
        message: 'لطفاً NEXT_PUBLIC_ADMIN_API_KEY را برای ویرایش تنظیم کنید.'
      });
      return;
    }

    const priceNum = Number(formState.basePrice);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setStatus({
        type: 'error',
        message: 'قیمت باید یک عدد معتبر باشد.'
      });
      return;
    }

    setSaving(true);
    setStatus(null);

    const payload: any = {
      title: formState.title,
      slug: formState.slug,
      description: formState.description,
      detailedDescription: formState.detailedDescription || undefined,
      genre: parseList(formState.genre),
      platform: formState.platform,
      regionOptions: parseList(formState.regionOptions),
      basePrice: priceNum,

      coverUrl: formState.coverUrl || undefined,
      gallery: formState.gallery,
      tags: parseList(formState.tags),
      categories: formState.categories,
      options: formState.options.map(opt => ({ ...opt, values: parseList(opt.values) })),
      variants: formState.variants
    };

    // Media fields
    if (formState.trailerUrl) payload.trailerUrl = formState.trailerUrl;
    if (formState.gameplayVideoUrl) payload.gameplayVideoUrl = formState.gameplayVideoUrl;
    if (formState.screenshots) {
      const screenshotsList = parseList(formState.screenshots);
      if (screenshotsList.length > 0) payload.screenshots = screenshotsList;
    }

    // Enhanced metadata
    if (formState.rating) {
      const ratingNum = Number(formState.rating);
      if (!Number.isNaN(ratingNum) && ratingNum >= 0 && ratingNum <= 5) {
        payload.rating = ratingNum;
      }
    }
    if (formState.releaseDate) payload.releaseDate = formState.releaseDate;
    if (formState.developer) payload.developer = formState.developer;
    if (formState.publisher) payload.publisher = formState.publisher;
    if (formState.ageRating) payload.ageRating = formState.ageRating;
    if (formState.features) {
      const featuresList = parseList(formState.features);
      if (featuresList.length > 0) payload.features = featuresList;
    }
    if (formState.systemRequirementsMinimum || formState.systemRequirementsRecommended) {
      payload.systemRequirements = {};
      if (formState.systemRequirementsMinimum) payload.systemRequirements.minimum = formState.systemRequirementsMinimum;
      if (formState.systemRequirementsRecommended) payload.systemRequirements.recommended = formState.systemRequirementsRecommended;
    }

    // SEO & Marketing
    if (formState.metaTitle) payload.metaTitle = formState.metaTitle;
    if (formState.metaDescription) payload.metaDescription = formState.metaDescription;
    payload.featured = formState.featured;
    payload.onSale = formState.onSale;
    if (formState.onSale && formState.salePrice) {
      const salePriceNum = Number(formState.salePrice);
      if (!Number.isNaN(salePriceNum) && salePriceNum > 0) {
        payload.salePrice = salePriceNum;
      }
    }

    if (!productId) {
      setStatus({
        type: 'error',
        message: 'شناسه محصول معتبر نیست.'
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${productId}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'ذخیره تغییرات با خطا مواجه شد.');
      }

      setStatus({
        type: 'success',
        message: 'تغییرات محصول با موفقیت ذخیره شد.'
      });
      await loadProduct(true);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'ذخیره تغییرات ممکن نیست.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!ADMIN_API_KEY) {
      setStatus({
        type: 'error',
        message: 'برای حذف محصول باید کلید ادمین را تنظیم کنید.'
      });
      return;
    }

    if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;

    if (!productId) {
      setStatus({
        type: 'error',
        message: 'شناسه محصول معتبر نیست.'
      });
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`${API_BASE_URL}/api/games/${productId}`, {
        method: 'DELETE',
        headers: adminHeaders()
      });

      if (!response.ok) {
        throw new Error('حذف محصول با مشکل مواجه شد.');
      }

      setStatus({
        type: 'success',
        message: 'محصول حذف شد.'
      });
      router.push('/admin/products');
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'حذف محصول ممکن نیست.'
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">در حال بارگذاری اطلاعات محصول...</p>
        </div>
      </div>
    );
  }

  if (!formState) {
    return (
      <div className="space-y-4">
        {status && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {status.message}
          </div>
        )}
        <button
          onClick={() => loadProduct()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          تلاش مجدد برای بارگذاری
        </button>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'basic', label: 'اطلاعات پایه', icon: 'file' },
    { id: 'media', label: 'رسانه و تصاویر', icon: 'image' },
    { id: 'metadata', label: 'اطلاعات تکمیلی', icon: 'file' },
    { id: 'seo', label: 'SEO و بازاریابی', icon: 'trending' },
    { id: 'variants', label: 'انواع و قیمت', icon: 'package' }
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">ویرایش محصول</h1>
          <p className="text-sm text-slate-500 mt-1">{formState.title || 'محصول جدید'}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Icon name="arrow-right" size={16} />
            بازگشت
          </button>
          <button
            type="button"
            onClick={handleDeleteProduct}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-70 transition"
          >
            <Icon name="trash" size={16} />
            {deleting ? 'در حال حذف...' : 'حذف'}
          </button>
        </div>
      </header>

      {/* Status Message */}
      {status && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon name={tab.icon as any} size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSaveProduct} className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">اطلاعات پایه محصول</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">نام محصول *</span>
                <input
                  value={formState.title}
                  onChange={(event) => handleFieldChange('title', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                  placeholder="مثال: سرویس خواب دو نفره مدل رویال"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">اسلاگ (URL) *</span>
                <input
                  value={formState.slug}
                  onChange={(event) => handleFieldChange('slug', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                  placeholder="royal-double-bedding-set"
                />
                <p className="text-xs text-slate-500 mt-1">فقط حروف انگلیسی، اعداد و خط تیره</p>
              </label>



              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">قیمت پایه (تومان) *</span>
                <input
                  type="number"
                  value={formState.basePrice}
                  onChange={(event) => handleFieldChange('basePrice', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                  min="0"
                  placeholder="2500000"
                />
              </label>



              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">توضیحات کوتاه *</span>
                <textarea
                  value={formState.description}
                  onChange={(event) => handleFieldChange('description', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  rows={4}
                  required
                  placeholder="توضیحات کوتاه و جذاب درباره محصول..."
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">تگ‌ها (با کاما)</span>
                <input
                  value={formState.tags}
                  onChange={(event) => handleFieldChange('tags', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="محبوب, جدید, پیشنهاد ویژه"
                />
              </label>

              <div className="md:col-span-2">
                <ImageUpload
                  currentImage={formState.coverUrl}
                  onImageUploaded={(url) => handleFieldChange('coverUrl', url)}
                  label="تصویر کاور محصول"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">توضیحات کامل محصول (Rich Text)</label>
                <RichTextEditor 
                  content={formState.detailedDescription} 
                  onChange={(value) => handleFieldChange('detailedDescription', value)} 
                />
                <p className="mt-2 text-xs text-slate-500">می‌توانید از تصاویر، لینک‌ها و فرمت‌های مختلف استفاده کنید</p>
              </div>

              <div className="md:col-span-2">
                <CategorySelector
                  selectedCategories={formState.categories || []}
                  onChange={(categories) => handleFieldChange('categories', categories as any)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">رسانه و تصاویر</h2>
            
            <div className="grid gap-6">


              <div className="md:col-span-2">
                <ImageGalleryUpload
                  images={formState.gallery}
                  onImagesChange={(images) => {
                    handleFieldChange('gallery', images as any);
                    // Automatically set first image as cover if cover is empty or was previous first image
                    if (images.length > 0 && (!formState.coverUrl || formState.coverUrl === formState.gallery[0])) {
                      handleFieldChange('coverUrl', images[0]);
                    }
                  }}
                  label="گالری تصاویر محصول"
                  maxImages={10}
                />
              </div>


            </div>
          </div>
        )}

        {/* Metadata Tab */}
        {activeTab === 'metadata' && (
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">اطلاعات تکمیلی</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">امتیاز (0-5)</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formState.rating}
                  onChange={(event) => handleFieldChange('rating', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="4.5"
                />
              </label>



              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">ویژگی‌ها (با کاما)</span>
                <input
                  value={formState.features}
                  onChange={(event) => handleFieldChange('features', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="ضد حساسیت, قابل شستشو, رنگ ثابت"
                />
              </label>


            </div>
          </div>
        )}

        {/* SEO & Marketing Tab */}
        {activeTab === 'seo' && (
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">SEO و بازاریابی</h2>
            
            <div className="grid gap-6">
              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">عنوان SEO (Meta Title)</span>
                <input
                  value={formState.metaTitle}
                  onChange={(event) => handleFieldChange('metaTitle', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="عنوانی که در نتایج جستجو نمایش داده می‌شود"
                  maxLength={60}
                />
                <p className="text-xs text-slate-500 mt-1">حداکثر 60 کاراکتر (بهینه: 50-60)</p>
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">توضیحات SEO (Meta Description)</span>
                <textarea
                  value={formState.metaDescription}
                  onChange={(event) => handleFieldChange('metaDescription', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  rows={3}
                  placeholder="توضیحات کوتاه برای نتایج جستجو"
                  maxLength={160}
                />
                <p className="text-xs text-slate-500 mt-1">حداکثر 160 کاراکتر (بهینه: 150-160)</p>
              </label>

              <div className="grid gap-4 md:grid-cols-2 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(event) => handleFieldChange('featured', event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 accent-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-700">محصول ویژه</span>
                    <p className="text-xs text-slate-500 mt-1">نمایش در بخش محصولات ویژه</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formState.onSale}
                    onChange={(event) => handleFieldChange('onSale', event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 accent-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-700">در حال فروش</span>
                    <p className="text-xs text-slate-500 mt-1">نمایش برچسب تخفیف</p>
                  </div>
                </label>
              </div>

              {formState.onSale && (
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="text-sm font-bold text-slate-700 mb-2 block">درصد تخفیف (%)</span>
                    <div className="relative">
                      <input
                        type="number"
                        value={discountPercent}
                        onChange={(event) => handleDiscountChange(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition pl-10"
                        min="0"
                        max="100"
                        placeholder="20"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon name="trending-down" size={16} />
                      </div>
                    </div>
                  </label>
                  <label>
                    <span className="text-sm font-bold text-slate-700 mb-2 block">قیمت تخفیف (تومان)</span>
                    <input
                      type="number"
                      value={formState.salePrice}
                      onChange={(event) => handleFieldChange('salePrice', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      min="0"
                      placeholder="1200000"
                    />
                    <p className="text-xs text-slate-500 mt-1">قیمت با تخفیف (باید کمتر از قیمت پایه باشد)</p>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Variants Tab */}
        {activeTab === 'variants' && (
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">انواع و قیمت‌گذاری</h2>
            
            <div className="space-y-6 rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">ویژگی‌های محصول (Options)</h3>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 transition"
                >
                  <Icon name="plus" size={16} />
                  افزودن ویژگی
                </button>
              </div>

              {formState.options.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">هنوز ویژگی‌ای اضافه نشده است</p>
                  <p className="text-xs mt-1">برای ایجاد انواع مختلف محصول، ابتدا ویژگی‌ها را اضافه کنید</p>
                </div>
              )}

              {formState.options.map((opt) => (
                <div key={opt.id} className="grid gap-4 md:grid-cols-2 rounded-xl bg-white border border-slate-200 p-4">
                  <label>
                    <span className="text-xs text-slate-500 mb-1 block">نام ویژگی</span>
                    <input
                      value={opt.name}
                      onChange={(e) => handleOptionNameChange(opt.id, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      placeholder="مثال: منطقه"
                    />
                  </label>
                  <div className="flex items-end gap-2">
                    <label className="flex-1">
                      <span className="text-xs text-slate-500 mb-1 block">مقادیر (با کاما)</span>
                      <input
                        value={opt.values}
                        onChange={(e) => handleOptionValuesChange(opt.id, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                        placeholder="R1, R2, R3"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      className="mb-1 rounded-lg bg-rose-50 p-2 text-rose-500 hover:bg-rose-100 transition"
                      title="حذف"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {formState.options.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">انواع محصول (Variants)</h3>
                    <button
                      type="button"
                      onClick={generateVariants}
                      className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-100 transition"
                    >
                      <Icon name="refresh" size={16} />
                      تولید خودکار انواع
                    </button>
                  </div>

                  {formState.variants.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <p className="text-sm">هنوز نوعی ایجاد نشده است</p>
                      <p className="text-xs mt-1">روی دکمه "تولید خودکار انواع" کلیک کنید</p>
                    </div>
                  )}

                  {formState.variants.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500">
                          <tr>
                            <th className="p-3 text-right">ترکیب</th>
                            <th className="p-3 text-right">قیمت (تومان)</th>
                            <th className="p-3 text-right">موجودی</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {formState.variants.map((variant) => (
                            <tr key={variant.id} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-mono text-right text-xs" dir="ltr">
                                {Object.entries(variant.selectedOptions)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(' | ')}
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => handleVariantChange(variant.id, 'price', Number(e.target.value))}
                                  className="w-32 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                  min="0"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => handleVariantChange(variant.id, 'stock', Number(e.target.value))}
                                  className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                  min="0"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-6 -mb-6 rounded-b-3xl shadow-lg">
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                در حال ذخیره...
              </>
            ) : (
              <>
                <Icon name="save" size={20} />
                ذخیره تغییرات محصول
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
