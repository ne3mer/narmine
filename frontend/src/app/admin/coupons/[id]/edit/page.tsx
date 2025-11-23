'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL, adminHeaders, ADMIN_API_KEY } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';
import { formatToman } from '@/lib/format';

type Coupon = {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  applicableTo: 'all' | 'products' | 'categories';
  applicableProductIds?: string[];
  applicableCategories?: string[];
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  firstTimeOnly: boolean;
  userSpecific?: string[];
  excludeProducts?: string[];
  stackable: boolean;
};

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

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!couponId) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/coupons/${couponId}`, {
          headers: adminHeaders()
        });
        if (!response.ok) {
          throw new Error('خطا در دریافت اطلاعات کوپن');
        }
        const json = await response.json();
        const coupon: Coupon = json.data;

        // Format dates for datetime-local input
        const startDate = new Date(coupon.startDate);
        const endDate = new Date(coupon.endDate);
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setFormData({
          code: coupon.code,
          name: coupon.name,
          description: coupon.description || '',
          type: coupon.type,
          value: String(coupon.value),
          minPurchaseAmount: coupon.minPurchaseAmount ? String(coupon.minPurchaseAmount) : '',
          maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : '',
          applicableTo: coupon.applicableTo,
          applicableProductIds: coupon.applicableProductIds?.join(', ') || '',
          applicableCategories: coupon.applicableCategories?.join(', ') || '',
          usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
          usageLimitPerUser: String(coupon.usageLimitPerUser || 1),
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          isActive: coupon.isActive,
          firstTimeOnly: coupon.firstTimeOnly,
          userSpecific: coupon.userSpecific?.join(', ') || '',
          excludeProducts: coupon.excludeProducts?.join(', ') || '',
          stackable: coupon.stackable
        });
      } catch (err) {
        setStatusMessage({
          type: 'error',
          message: err instanceof Error ? err.message : 'خطا در بارگذاری کوپن'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [couponId]);

  const handleFieldChange = (field: keyof CouponFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_API_KEY) {
      setStatusMessage({ type: 'error', message: 'کلید ادمین تنظیم نشده است.' });
      return;
    }

    setSaving(true);
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
      const response = await fetch(`${API_BASE_URL}/api/coupons/${couponId}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'به‌روزرسانی کوپن با خطا مواجه شد.');
      }

      setStatusMessage({ type: 'success', message: 'کوپن با موفقیت به‌روزرسانی شد.' });
      setTimeout(() => {
        router.push('/admin/coupons');
      }, 1500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        message: err instanceof Error ? err.message : 'خطا در به‌روزرسانی کوپن'
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'اطلاعات پایه', icon: 'file' },
    { id: 'advanced', label: 'تنظیمات پیشرفته', icon: 'settings' },
    { id: 'restrictions', label: 'محدودیت‌ها', icon: 'shield' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">در حال بارگذاری اطلاعات کوپن...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">ویرایش کوپن</h1>
          <p className="text-sm text-slate-500 mt-1">{formData.name || 'کوپن'}</p>
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
        {/* Same form structure as new page - reuse the same components */}
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
                />
              </label>
              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">کد کوپن *</span>
                <input
                  value={formData.code}
                  onChange={(e) => handleFieldChange('code', e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                  pattern="[A-Z0-9-_]+"
                />
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
                <span className="text-sm font-bold text-slate-700 mb-2 block">مقدار تخفیف *</span>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleFieldChange('value', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
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
                  />
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
                />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 mb-2 block">توضیحات</span>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  rows={3}
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
                />
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
              </label>
              <label>
                <span className="text-sm font-bold text-slate-700 mb-2 block">محصولات مستثنی (شناسه با کاما)</span>
                <input
                  value={formData.excludeProducts}
                  onChange={(e) => handleFieldChange('excludeProducts', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="productId1, productId2"
                />
              </label>
            </div>
          </div>
        )}

        {/* Submit Button */}
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
                ذخیره تغییرات
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

