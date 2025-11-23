'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, adminHeaders, ADMIN_API_KEY } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';
import { formatToman } from '@/lib/format';

type CouponFormData = {
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: string;
  minPurchaseAmount: string;
  maxDiscountAmount: string;
  applicableTo: 'all' | 'products' | 'categories';
  applicableProductIds: string;
  applicableCategories: string;
  usageLimit: string;
  usageLimitPerUser: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  firstTimeOnly: boolean;
  userSpecific: string;
  excludeProducts: string;
  stackable: boolean;
};

export default function NewCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'restrictions'>('basic');

  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    applicableTo: 'all',
    applicableProductIds: '',
    applicableCategories: '',
    usageLimit: '',
    usageLimitPerUser: '1',
    startDate: '',
    endDate: '',
    isActive: true,
    firstTimeOnly: false,
    userSpecific: '',
    excludeProducts: '',
    stackable: false
  });

  const generateCode = async () => {
    setGeneratingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/generate-code`, {
        headers: adminHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, code: data.data.code }));
      }
    } catch (err) {
      console.error('Error generating code:', err);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleFieldChange = (field: keyof CouponFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_API_KEY) {
      setStatusMessage({ type: 'error', message: 'کلید ادمین تنظیم نشده است.' });
      return;
    }

    if (!formData.code || !formData.name || !formData.value || !formData.startDate || !formData.endDate) {
      setStatusMessage({ type: 'error', message: 'لطفاً تمام فیلدهای الزامی را پر کنید.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const payload: any = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      value: Number(formData.value),
      applicableTo: formData.applicableTo,
      usageLimitPerUser: Number(formData.usageLimitPerUser) || 1,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
      firstTimeOnly: formData.firstTimeOnly,
      stackable: formData.stackable
    };

    if (formData.minPurchaseAmount) {
      payload.minPurchaseAmount = Number(formData.minPurchaseAmount);
    }
    if (formData.maxDiscountAmount) {
      payload.maxDiscountAmount = Number(formData.maxDiscountAmount);
    }
    if (formData.usageLimit) {
      payload.usageLimit = Number(formData.usageLimit);
    }
    if (formData.applicableTo === 'products' && formData.applicableProductIds) {
      payload.applicableProductIds = formData.applicableProductIds.split(',').map((id) => id.trim()).filter(Boolean);
    }
    if (formData.applicableTo === 'categories' && formData.applicableCategories) {
      payload.applicableCategories = formData.applicableCategories.split(',').map((cat) => cat.trim()).filter(Boolean);
    }
    if (formData.userSpecific) {
      payload.userSpecific = formData.userSpecific.split(',').map((id) => id.trim()).filter(Boolean);
    }
    if (formData.excludeProducts) {
      payload.excludeProducts = formData.excludeProducts.split(',').map((id) => id.trim()).filter(Boolean);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'ایجاد کوپن با خطا مواجه شد.');
      }

      setStatusMessage({ type: 'success', message: 'کوپن با موفقیت ایجاد شد.' });
      setTimeout(() => {
        router.push('/admin/coupons');
      }, 1500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        message: err instanceof Error ? err.message : 'خطا در ایجاد کوپن'
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'اطلاعات پایه', icon: 'file' },
    { id: 'advanced', label: 'تنظیمات پیشرفته', icon: 'settings' },
    { id: 'restrictions', label: 'محدودیت‌ها', icon: 'shield' }
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">ایجاد کوپن تخفیف جدید</h1>
          <p className="text-sm text-slate-500 mt-1">ساخت کد تخفیف پیشرفته با قابلیت‌های متنوع</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/coupons')}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Icon name="arrow-right" size={16} />
          بازگشت
        </button>
      </header>

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
              onClick={() => setActiveTab(tab.id as any)}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Tab */}
        {activeTab === 'basic' && (
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">اطلاعات پایه</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">نام کوپن *</span>
                <input
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                  placeholder="مثال: تخفیف ویژه نوروز"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">کد کوپن *</span>
                <div className="flex gap-2">
                  <input
                    value={formData.code}
                    onChange={(e) => handleFieldChange('code', e.target.value.toUpperCase())}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    required
                    placeholder="NEWYEAR2024"
                    pattern="[A-Z0-9-_]+"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    disabled={generatingCode}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-100 transition disabled:opacity-50"
                  >
                    {generatingCode ? '...' : '🎲 تولید'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">فقط حروف بزرگ انگلیسی، اعداد، خط تیره و زیرخط</p>
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">نوع تخفیف *</span>
                <select
                  value={formData.type}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                >
                  <option value="percentage">درصدی (%)</option>
                  <option value="fixed">مقدار ثابت (تومان)</option>
                </select>
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">
                  مقدار تخفیف * {formData.type === 'percentage' ? '(0-100)' : '(تومان)'}
                </span>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleFieldChange('value', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
                  placeholder={formData.type === 'percentage' ? '20' : '50000'}
                />
              </label>

              {formData.type === 'percentage' && (
                <label>
                  <span className="text-sm font-bold text-slate-700 mb-2 block">حداکثر تخفیف (تومان)</span>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => handleFieldChange('maxDiscountAmount', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    min="0"
                    placeholder="100000"
                  />
                  <p className="text-xs text-slate-500 mt-1">محدود کردن حداکثر مبلغ تخفیف</p>
                </label>
              )}

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">حداقل مبلغ خرید (تومان)</span>
                <input
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => handleFieldChange('minPurchaseAmount', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  min="0"
                  placeholder="100000"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">توضیحات</span>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  rows={3}
                  placeholder="توضیحات درباره این کوپن..."
                />
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">تاریخ شروع *</span>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                />
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">تاریخ پایان *</span>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                />
              </label>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">تنظیمات پیشرفته</h2>

            <div className="grid gap-6">
              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">قابل استفاده برای *</span>
                <select
                  value={formData.applicableTo}
                  onChange={(e) => handleFieldChange('applicableTo', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                >
                  <option value="all">همه محصولات</option>
                  <option value="products">محصولات خاص</option>
                  <option value="categories">دسته‌بندی‌های خاص</option>
                </select>
              </label>

              {formData.applicableTo === 'products' && (
                <label>
                  <span className="text-sm font-bold text-slate-700 mb-2 block">شناسه محصولات (با کاما)</span>
                  <input
                    value={formData.applicableProductIds}
                    onChange={(e) => handleFieldChange('applicableProductIds', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    placeholder="id1, id2, id3"
                  />
                </label>
              )}

              {formData.applicableTo === 'categories' && (
                <label>
                  <span className="text-sm font-bold text-slate-700 mb-2 block">دسته‌بندی‌ها (با کاما)</span>
                  <input
                    value={formData.applicableCategories}
                    onChange={(e) => handleFieldChange('applicableCategories', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    placeholder="اکشن, ماجراجویی"
                  />
                </label>
              )}

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">حداکثر استفاده کل</span>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => handleFieldChange('usageLimit', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  min="1"
                  placeholder="100"
                />
                <p className="text-xs text-slate-500 mt-1">خالی بگذارید برای نامحدود</p>
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">حداکثر استفاده برای هر کاربر</span>
                <input
                  type="number"
                  value={formData.usageLimitPerUser}
                  onChange={(e) => handleFieldChange('usageLimitPerUser', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  min="1"
                  required
                />
              </label>

              <div className="grid md:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 accent-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-700">فعال</span>
                    <p className="text-xs text-slate-500 mt-1">کوپن قابل استفاده است</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.stackable}
                    onChange={(e) => handleFieldChange('stackable', e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 accent-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-700">قابل ترکیب</span>
                    <p className="text-xs text-slate-500 mt-1">می‌تواند با کوپن‌های دیگر ترکیب شود</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Restrictions Tab */}
        {activeTab === 'restrictions' && (
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">محدودیت‌ها و قوانین</h2>

            <div className="grid gap-6">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.firstTimeOnly}
                  onChange={(e) => handleFieldChange('firstTimeOnly', e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 accent-emerald-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-700">فقط برای مشتریان جدید</span>
                  <p className="text-xs text-slate-500 mt-1">فقط کاربرانی که قبلاً خرید نکرده‌اند می‌توانند استفاده کنند</p>
                </div>
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">کاربران خاص (شناسه کاربری با کاما)</span>
                <input
                  value={formData.userSpecific}
                  onChange={(e) => handleFieldChange('userSpecific', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="userId1, userId2"
                />
                <p className="text-xs text-slate-500 mt-1">خالی بگذارید برای همه کاربران</p>
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">محصولات مستثنی (شناسه با کاما)</span>
                <input
                  value={formData.excludeProducts}
                  onChange={(e) => handleFieldChange('excludeProducts', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="productId1, productId2"
                />
                <p className="text-xs text-slate-500 mt-1">محصولاتی که این کوپن برای آن‌ها اعمال نمی‌شود</p>
              </label>
            </div>
          </div>
        )}

        {/* Preview Card */}
        <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-4">پیش‌نمایش کوپن</h3>
          <div className="bg-white rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-black text-slate-900">{formData.name || 'نام کوپن'}</h4>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                {formData.isActive ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="font-mono text-2xl font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                {formData.code || 'CODE'}
              </div>
              <div className="text-2xl font-black text-slate-900">
                {formData.type === 'percentage' ? `${formData.value || '0'}%` : formatToman(Number(formData.value) || 0)}
              </div>
            </div>
            {formData.description && (
              <p className="text-sm text-slate-600 mb-4">{formData.description}</p>
            )}
            <div className="flex flex-wrap gap-2 text-xs">
              {formData.minPurchaseAmount && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 font-semibold">
                  حداقل: {formatToman(Number(formData.minPurchaseAmount))}
                </span>
              )}
              {formData.firstTimeOnly && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700 font-semibold">
                  فقط مشتریان جدید
                </span>
              )}
              {formData.stackable && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 font-semibold">
                  قابل ترکیب
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-6 -mb-6 rounded-b-3xl shadow-lg">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                در حال ایجاد...
              </>
            ) : (
              <>
                <Icon name="save" size={20} />
                ایجاد کوپن
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

