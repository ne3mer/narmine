'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, adminHeaders, ADMIN_API_KEY } from '@/lib/api';
import { NewProductState, initialNewProduct } from '@/types/admin';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { ImageGalleryUpload } from '@/components/upload/ImageGalleryUpload';
import CategorySelector from '@/components/admin/products/CategorySelector';
import { Icon } from '@/components/icons/Icon';
import { ProductTypeSelector } from '@/components/admin/ProductTypeSelector';
import { DynamicField } from '@/components/admin/DynamicField';
import { PRODUCT_TEMPLATES, getProductTemplate } from '@/config/productTemplates';

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

type TabType = 'basic' | 'media' | 'metadata' | 'seo' | 'variants';

export default function NewProductPage() {
  const router = useRouter();
  const [newProduct, setNewProduct] = useState<NewProductState>(initialNewProduct);
  const [detailedDescription, setDetailedDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  // Multi-product state
  const [productType, setProductType] = useState('physical_product');
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [inventory, setInventory] = useState({
    trackInventory: false,
    quantity: 0,
    lowStockThreshold: 5,
    sku: ''
  });
  const [shipping, setShipping] = useState({
    requiresShipping: false,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    shippingCost: 0,
    freeShippingThreshold: 0
  });

  const handleNewProductChange = (field: keyof NewProductState, value: string | boolean) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleScreenshotsChange = (value: string) => {
    setNewProduct((prev) => ({ ...prev, screenshots: value }));
  };

  const handleAddOption = () => {
    setNewProduct((prev) => ({
      ...prev,
      options: [...prev.options, { id: crypto.randomUUID(), name: '', values: [] }]
    }));
  };

  const handleRemoveOption = (id: string) => {
    setNewProduct((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id)
    }));
  };

  const handleOptionNameChange = (id: string, name: string) => {
    setNewProduct((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.id === id ? { ...opt, name } : opt))
    }));
  };

  const handleOptionValuesChange = (id: string, valuesStr: string) => {
    setNewProduct((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === id ? { ...opt, values: parseList(valuesStr) } : opt
      )
    }));
  };

  const generateVariants = () => {
    if (newProduct.options.length === 0) return;

    const generateCombinations = (optionIndex: number, current: Record<string, string>): Record<string, string>[] => {
      if (optionIndex === newProduct.options.length) return [current];

      const option = newProduct.options[optionIndex];
      if (!option || !option.values.length || !option.name) {
        return [];
      }

      const combinations: Record<string, string>[] = [];
      for (const value of option.values) {
        combinations.push(...generateCombinations(optionIndex + 1, { ...current, [option.name]: value }));
      }

      return combinations;
    };

    const combinations = generateCombinations(0, {});
    if (!combinations.length) return;

    const basePrice = Number(newProduct.basePrice) || 0;

    const newVariants = combinations.map((combo) => ({
      id: crypto.randomUUID(),
      selectedOptions: combo,
      price: basePrice,
      stock: 10
    }));

    setNewProduct((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleVariantChange = (id: string, field: 'price' | 'stock', value: number) => {
    setNewProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    }));
  };

  // Multi-product helpers
  const template = getProductTemplate(productType);

  const handleCustomFieldChange = (name: string, value: any) => {
    setCustomFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleInventoryChange = (field: string, value: any) => {
    setInventory((prev) => ({ ...prev, [field]: value }));
  };

  const handleShippingChange = (field: string, value: any) => {
    if (field === 'length' || field === 'width' || field === 'height') {
      setShipping((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [field]: value }
      }));
    } else {
      setShipping((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCreateNewProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ADMIN_API_KEY) {
      setStatusMessage({
        type: 'error',
        message: 'لطفاً NEXT_PUBLIC_ADMIN_API_KEY را برای ایجاد محصول تنظیم کنید.'
      });
      return;
    }

    const priceNum = Number(newProduct.basePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setStatusMessage({
        type: 'error',
        message: 'قیمت باید یک عدد معتبر باشد.'
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const payload: any = {
      title: newProduct.title,
      slug: newProduct.slug,
      description: newProduct.description,
      detailedDescription: detailedDescription || undefined,
      genre: parseList(newProduct.genre),
      platform: newProduct.platform,
      regionOptions: parseList(newProduct.regionOptions),
      basePrice: priceNum,

      coverUrl: newProduct.coverUrl || undefined,
      gallery: newProduct.gallery,
      tags: parseList(newProduct.tags),
      categories: newProduct.categories,
      options: newProduct.options,
      variants: newProduct.variants,
      
      // Multi-product fields
      productType,
      customFields,
      inventory: inventory.trackInventory ? inventory : undefined,
      shipping: shipping.requiresShipping ? shipping : undefined
    };

    // Media fields
    if (newProduct.trailerUrl) payload.trailerUrl = newProduct.trailerUrl;
    if (newProduct.gameplayVideoUrl) payload.gameplayVideoUrl = newProduct.gameplayVideoUrl;
    if (newProduct.screenshots) {
      const screenshotsList = parseList(newProduct.screenshots);
      if (screenshotsList.length > 0) payload.screenshots = screenshotsList;
    }

    // Enhanced metadata
    if (newProduct.rating) {
      const ratingNum = Number(newProduct.rating);
      if (!Number.isNaN(ratingNum) && ratingNum >= 0 && ratingNum <= 5) {
        payload.rating = ratingNum;
      }
    }
    if (newProduct.releaseDate) payload.releaseDate = newProduct.releaseDate;
    if (newProduct.developer) payload.developer = newProduct.developer;
    if (newProduct.publisher) payload.publisher = newProduct.publisher;
    if (newProduct.ageRating) payload.ageRating = newProduct.ageRating;
    if (newProduct.features) {
      const featuresList = parseList(newProduct.features);
      if (featuresList.length > 0) payload.features = featuresList;
    }
    if (newProduct.systemRequirementsMinimum || newProduct.systemRequirementsRecommended) {
      payload.systemRequirements = {};
      if (newProduct.systemRequirementsMinimum) payload.systemRequirements.minimum = newProduct.systemRequirementsMinimum;
      if (newProduct.systemRequirementsRecommended) payload.systemRequirements.recommended = newProduct.systemRequirementsRecommended;
    }

    // SEO & Marketing
    if (newProduct.metaTitle) payload.metaTitle = newProduct.metaTitle;
    if (newProduct.metaDescription) payload.metaDescription = newProduct.metaDescription;
    payload.featured = newProduct.featured;
    payload.onSale = newProduct.onSale;
    if (newProduct.onSale && newProduct.salePrice) {
      const salePriceNum = Number(newProduct.salePrice);
      if (!Number.isNaN(salePriceNum) && salePriceNum > 0) {
        payload.salePrice = salePriceNum;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/games`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'ساخت محصول جدید موفق نبود');
      }

      const data = await response.json();
      setStatusMessage({
        type: 'success',
        message: 'محصول جدید با موفقیت ثبت شد.'
      });
      
      // Reset form
      setTimeout(() => {
        router.push(`/admin/products/${data.data?.id || ''}/edit`);
      }, 1500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        message: err instanceof Error ? err.message : 'خطا در ایجاد محصول'
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-black text-slate-900">افزودن محصول جدید</h1>
          <p className="text-sm text-slate-500 mt-1">ایجاد محصول جدید با تمام ویژگی‌ها</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Icon name="arrow-right" size={16} />
          بازگشت به لیست
        </button>
      </header>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {statusMessage.message}
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
      <form onSubmit={handleCreateNewProduct} className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Product Type Selector */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <ProductTypeSelector value={productType} onChange={setProductType} />
            </div>

            <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">اطلاعات پایه محصول</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">نام محصول *</span>
                <input
                  value={newProduct.title}
                  onChange={(event) => handleNewProductChange('title', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                  placeholder="مثال: سرویس خواب دو نفره مدل رویال"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">اسلاگ (URL) *</span>
                <input
                  value={newProduct.slug}
                  onChange={(event) => handleNewProductChange('slug', event.target.value)}
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
                  value={newProduct.basePrice}
                  onChange={(event) => handleNewProductChange('basePrice', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                  min="0"
                  placeholder="2500000"
                />
              </label>



              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">توضیحات کوتاه *</span>
                <textarea
                  value={newProduct.description}
                  onChange={(event) => handleNewProductChange('description', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  rows={4}
                  required
                  placeholder="توضیحات کوتاه و جذاب درباره محصول..."
                />
              </label>

              {/* Dynamic Fields */}
              {template?.fields.length ? (
                <div className="md:col-span-2 space-y-4 rounded-2xl bg-slate-50 p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-xl">{template.icon}</span>
                    مشخصات {template.name}
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {template.fields.map((field) => (
                      <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <DynamicField
                          field={field}
                          value={customFields[field.name]}
                          onChange={(value) => handleCustomFieldChange(field.name, value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Inventory Section */}
              {template?.inventory.trackInventory && (
                <div className="md:col-span-2 space-y-4 rounded-2xl bg-blue-50 p-6 border border-blue-100">
                  <h3 className="font-bold text-blue-900 flex items-center gap-2">
                    <Icon name="package" size={20} />
                    مدیریت موجودی
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={inventory.trackInventory}
                        onChange={(e) => handleInventoryChange('trackInventory', e.target.checked)}
                        className="h-5 w-5 rounded border-blue-300 accent-blue-600"
                      />
                      <span className="text-sm font-bold text-blue-800">فعال‌سازی مدیریت موجودی</span>
                    </label>
                    {inventory.trackInventory && (
                      <>
                        <label>
                          <span className="text-sm font-bold text-blue-800 mb-2 block">تعداد موجودی</span>
                          <input
                            type="number"
                            value={inventory.quantity}
                            onChange={(e) => handleInventoryChange('quantity', Number(e.target.value))}
                            className="w-full rounded-xl border border-blue-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                          />
                        </label>
                        <label>
                          <span className="text-sm font-bold text-blue-800 mb-2 block">حداقل موجودی (هشدار)</span>
                          <input
                            type="number"
                            value={inventory.lowStockThreshold}
                            onChange={(e) => handleInventoryChange('lowStockThreshold', Number(e.target.value))}
                            className="w-full rounded-xl border border-blue-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                          />
                        </label>
                        <label>
                          <span className="text-sm font-bold text-blue-800 mb-2 block">کد محصول (SKU)</span>
                          <input
                            type="text"
                            value={inventory.sku}
                            onChange={(e) => handleInventoryChange('sku', e.target.value)}
                            className="w-full rounded-xl border border-blue-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping Section */}
              {template?.shipping.requiresShipping && (
                <div className="md:col-span-2 space-y-4 rounded-2xl bg-orange-50 p-6 border border-orange-100">
                  <h3 className="font-bold text-orange-900 flex items-center gap-2">
                    <Icon name="truck" size={20} />
                    تنظیمات ارسال
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="flex items-center gap-3 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={shipping.requiresShipping}
                        onChange={(e) => handleShippingChange('requiresShipping', e.target.checked)}
                        className="h-5 w-5 rounded border-orange-300 accent-orange-600"
                      />
                      <span className="text-sm font-bold text-orange-800">این محصول نیاز به ارسال فیزیکی دارد</span>
                    </label>
                    {shipping.requiresShipping && (
                      <>
                        <label>
                          <span className="text-sm font-bold text-orange-800 mb-2 block">وزن (گرم)</span>
                          <input
                            type="number"
                            value={shipping.weight}
                            onChange={(e) => handleShippingChange('weight', Number(e.target.value))}
                            className="w-full rounded-xl border border-orange-200 px-4 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                          />
                        </label>
                        <label>
                          <span className="text-sm font-bold text-orange-800 mb-2 block">هزینه ارسال ثابت (تومان)</span>
                          <input
                            type="number"
                            value={shipping.shippingCost}
                            onChange={(e) => handleShippingChange('shippingCost', Number(e.target.value))}
                            className="w-full rounded-xl border border-orange-200 px-4 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                          />
                        </label>
                        <div className="md:col-span-2 grid grid-cols-3 gap-4">
                          <label>
                            <span className="text-sm font-bold text-orange-800 mb-2 block">طول (cm)</span>
                            <input
                              type="number"
                              value={shipping.dimensions.length}
                              onChange={(e) => handleShippingChange('length', Number(e.target.value))}
                              className="w-full rounded-xl border border-orange-200 px-4 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                            />
                          </label>
                          <label>
                            <span className="text-sm font-bold text-orange-800 mb-2 block">عرض (cm)</span>
                            <input
                              type="number"
                              value={shipping.dimensions.width}
                              onChange={(e) => handleShippingChange('width', Number(e.target.value))}
                              className="w-full rounded-xl border border-orange-200 px-4 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                            />
                          </label>
                          <label>
                            <span className="text-sm font-bold text-orange-800 mb-2 block">ارتفاع (cm)</span>
                            <input
                              type="number"
                              value={shipping.dimensions.height}
                              onChange={(e) => handleShippingChange('height', Number(e.target.value))}
                              className="w-full rounded-xl border border-orange-200 px-4 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">تگ‌ها (با کاما)</span>
                <input
                  value={newProduct.tags}
                  onChange={(event) => handleNewProductChange('tags', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="محبوب, جدید, پیشنهاد ویژه"
                />
              </label>

              <div className="md:col-span-2">
                <ImageUpload
                  currentImage={newProduct.coverUrl}
                  onImageUploaded={(url) => handleNewProductChange('coverUrl', url)}
                  label="تصویر کاور محصول"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">توضیحات کامل محصول (Rich Text)</label>
                <RichTextEditor 
                  content={detailedDescription} 
                  onChange={setDetailedDescription} 
                />
                <p className="mt-2 text-xs text-slate-500">می‌توانید از تصاویر، لینک‌ها و فرمت‌های مختلف استفاده کنید</p>
              </div>

              <div className="md:col-span-2">
                <CategorySelector
                  selectedCategories={newProduct.categories}
                  onChange={(categories) => handleNewProductChange('categories', categories as any)}
                />
              </div>
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
                  images={newProduct.gallery}
                  onImagesChange={(images) => {
                    handleNewProductChange('gallery', images as any);
                    // Automatically set first image as cover if cover is empty or was previous first image
                    if (images.length > 0 && (!newProduct.coverUrl || newProduct.coverUrl === newProduct.gallery[0])) {
                      handleNewProductChange('coverUrl', images[0]);
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
                  value={newProduct.rating}
                  onChange={(event) => handleNewProductChange('rating', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="4.5"
                />
              </label>



              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">ویژگی‌ها (با کاما)</span>
                <input
                  value={newProduct.features}
                  onChange={(event) => handleNewProductChange('features', event.target.value)}
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
                  value={newProduct.metaTitle}
                  onChange={(event) => handleNewProductChange('metaTitle', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="عنوانی که در نتایج جستجو نمایش داده می‌شود"
                  maxLength={60}
                />
                <p className="text-xs text-slate-500 mt-1">حداکثر 60 کاراکتر (بهینه: 50-60)</p>
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">توضیحات SEO (Meta Description)</span>
                <textarea
                  value={newProduct.metaDescription}
                  onChange={(event) => handleNewProductChange('metaDescription', event.target.value)}
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
                    checked={newProduct.featured}
                    onChange={(event) => handleNewProductChange('featured', event.target.checked)}
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
                    checked={newProduct.onSale}
                    onChange={(event) => handleNewProductChange('onSale', event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 accent-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-700">در حال فروش</span>
                    <p className="text-xs text-slate-500 mt-1">نمایش برچسب تخفیف</p>
                  </div>
                </label>
              </div>

              {newProduct.onSale && (
                <label>
                  <span className="text-sm font-bold text-slate-700 mb-2 block">قیمت تخفیف (تومان)</span>
                  <input
                    type="number"
                    value={newProduct.salePrice}
                    onChange={(event) => handleNewProductChange('salePrice', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    min="0"
                    placeholder="1200000"
                  />
                  <p className="text-xs text-slate-500 mt-1">قیمت با تخفیف (باید کمتر از قیمت پایه باشد)</p>
                </label>
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

              {newProduct.options.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">هنوز ویژگی‌ای اضافه نشده است</p>
                  <p className="text-xs mt-1">برای ایجاد انواع مختلف محصول، ابتدا ویژگی‌ها را اضافه کنید</p>
                </div>
              )}

              {newProduct.options.map((opt) => (
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
                        value={opt.values.join(', ')}
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

              {newProduct.options.length > 0 && (
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

                  {newProduct.variants.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <p className="text-sm">هنوز نوعی ایجاد نشده است</p>
                      <p className="text-xs mt-1">روی دکمه "تولید خودکار انواع" کلیک کنید</p>
                    </div>
                  )}

                  {newProduct.variants.length > 0 && (
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
                          {newProduct.variants.map((variant) => (
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
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                در حال ثبت...
              </>
            ) : (
              <>
                <Icon name="save" size={20} />
                ثبت محصول جدید
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
