'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  totalDiscountGiven: number;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
};

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons`, {
        headers: adminHeaders()
      });
      if (!response.ok) {
        throw new Error('خطا در دریافت لیست کوپن‌ها');
      }
      const json = await response.json();
      setCoupons(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'دریافت اطلاعات با مشکل مواجه شد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const deleteCoupon = async (id: string) => {
    if (!ADMIN_API_KEY) {
      setStatusMessage({ type: 'error', message: 'کلید ادمین تعریف نشده است.' });
      return;
    }

    if (!confirm('آیا از حذف این کوپن اطمینان دارید؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: adminHeaders()
      });
      if (!response.ok) {
        throw new Error('حذف کوپن انجام نشد');
      }
      setStatusMessage({ type: 'success', message: 'کوپن حذف شد.' });
      await fetchCoupons();
    } catch (err) {
      setStatusMessage({ type: 'error', message: err instanceof Error ? err.message : 'خطا در حذف کوپن' });
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    if (!ADMIN_API_KEY) {
      setStatusMessage({ type: 'error', message: 'کلید ادمین تعریف نشده است.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/${id}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (!response.ok) {
        throw new Error('تغییر وضعیت کوپن انجام نشد');
      }
      setStatusMessage({ type: 'success', message: `کوپن ${!currentStatus ? 'فعال' : 'غیرفعال'} شد.` });
      await fetchCoupons();
    } catch (err) {
      setStatusMessage({ type: 'error', message: err instanceof Error ? err.message : 'خطا در تغییر وضعیت' });
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) {
      return { label: 'غیرفعال', color: 'bg-slate-100 text-slate-600' };
    }
    if (now < startDate) {
      return { label: 'در انتظار', color: 'bg-blue-100 text-blue-600' };
    }
    if (now > endDate) {
      return { label: 'منقضی شده', color: 'bg-rose-100 text-rose-600' };
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { label: 'تمام شده', color: 'bg-amber-100 text-amber-600' };
    }
    return { label: 'فعال', color: 'bg-emerald-100 text-emerald-600' };
  };

  const getUsagePercentage = (coupon: Coupon) => {
    if (!coupon.usageLimit) return null;
    return Math.round((coupon.usedCount / coupon.usageLimit) * 100);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">مدیریت کوپن‌های تخفیف</h1>
          <p className="text-sm text-slate-500 mt-1">ایجاد و مدیریت کدهای تخفیف پیشرفته</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/coupons/new')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105"
          >
            <Icon name="plus" size={16} />
            ایجاد کوپن جدید
          </button>
          <button
            onClick={fetchCoupons}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Icon name="refresh" size={16} />
            بروزرسانی
          </button>
        </div>
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

      {error && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">هنوز کوپنی ایجاد نشده است</h3>
              <p className="text-sm text-slate-500 mb-6">برای شروع، اولین کوپن تخفیف را ایجاد کنید</p>
              <button
                onClick={() => router.push('/admin/coupons/new')}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition"
              >
                <Icon name="plus" size={16} />
                ایجاد کوپن جدید
              </button>
            </div>
          ) : (
            coupons.map((coupon) => {
              const status = getStatusBadge(coupon);
              const usagePercent = getUsagePercentage(coupon);

              return (
                <div
                  key={coupon.id}
                  className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-emerald-200"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-slate-900">{coupon.name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.color}`}>
                          {status.label}
                        </span>
                        {coupon.stackable && (
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-600">
                            قابل ترکیب
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-2xl font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                            {coupon.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {coupon.type === 'percentage' ? (
                            <span className="text-2xl font-black text-slate-900">{coupon.value}%</span>
                          ) : (
                            <span className="text-2xl font-black text-slate-900">{formatToman(coupon.value)}</span>
                          )}
                          <span className="text-sm text-slate-500">تخفیف</span>
                        </div>
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-slate-600 mb-3">{coupon.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          coupon.isActive
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {coupon.isActive ? 'غیرفعال' : 'فعال'}
                      </button>
                      <button
                        onClick={() => router.push(`/admin/coupons/${coupon.id}/edit`)}
                        className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition"
                      >
                        <Icon name="edit" size={14} />
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">استفاده شده</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">
                          {coupon.usedCount}
                        </span>
                        {coupon.usageLimit && (
                          <>
                            <span className="text-slate-400">/</span>
                            <span className="text-sm text-slate-600">{coupon.usageLimit}</span>
                          </>
                        )}
                      </div>
                      {usagePercent !== null && (
                        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              usagePercent >= 90 ? 'bg-rose-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">تخفیف داده شده</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatToman(coupon.totalDiscountGiven)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {coupon.totalOrders} سفارش
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">اعتبار</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(coupon.startDate).toLocaleDateString('fa-IR')}
                      </p>
                      <p className="text-xs text-slate-500">
                        تا {new Date(coupon.endDate).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2 text-xs">
                      {coupon.minPurchaseAmount && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 font-semibold">
                          حداقل خرید: {formatToman(coupon.minPurchaseAmount)}
                        </span>
                      )}
                      {coupon.firstTimeOnly && (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700 font-semibold">
                          فقط مشتریان جدید
                        </span>
                      )}
                      {coupon.applicableTo === 'products' && (
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 font-semibold">
                          محصولات خاص
                        </span>
                      )}
                      {coupon.userSpecific && coupon.userSpecific.length > 0 && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 font-semibold">
                          کاربران خاص ({coupon.userSpecific.length})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

