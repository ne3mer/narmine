'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import type { UserInsights } from '@/types/admin';

const formatNumber = (value?: number) => {
  if (!value) return '0';
  return value.toLocaleString('fa-IR');
};

const formatDate = (value?: string) => {
  if (!value) return '---';
  try {
    return new Date(value).toLocaleString('fa-IR');
  } catch {
    return value;
  }
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', telegram: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageChannel, setMessageChannel] = useState<'email' | 'telegram' | 'both'>('email');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [inlineSuccess, setInlineSuccess] = useState('');

  useEffect(() => {
    if (!userId) return;

    const fetchInsights = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/insights`, {
          headers: adminHeaders()
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || 'خطا در دریافت اطلاعات کاربر');
        }

        const payload = await response.json();
        setInsights(payload?.data ?? null);
        if (payload?.data?.user) {
          setProfileForm({
            name: payload.data.user.name || '',
            phone: payload.data.user.phone || '',
            telegram: payload.data.user.telegram || ''
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری جزئیات کاربر');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userId]);

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    setInlineSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(profileForm)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'خطا در ذخیره اطلاعات');
      }

      setInlineSuccess('اطلاعات با موفقیت ذخیره شد');
      setTimeout(() => setInlineSuccess(''), 3000);
      setInsights((prev) => (prev ? { ...prev, user: { ...prev.user, ...profileForm } } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره اطلاعات');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendDirectMessage = async () => {
    if (!userId) return;
    if (!messageSubject.trim() || !messageBody.trim()) {
      setError('موضوع و متن پیام الزامی است');
      return;
    }
    setSendingMessage(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/messages`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          subject: messageSubject.trim(),
          message: messageBody.trim(),
          channel: messageChannel,
          userIds: [userId]
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'ارسال پیام با خطا مواجه شد');
      }

      setInlineSuccess('پیام ارسال شد');
      setMessageSubject('');
      setMessageBody('');
      setTimeout(() => setInlineSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ارسال پیام');
    } finally {
      setSendingMessage(false);
    }
  };

  if (!userId) {
    return (
      <div className="p-6 text-center text-rose-600">
        شناسه کاربر معتبر نیست.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          <p className="mt-3 text-sm text-slate-500">در حال دریافت اطلاعات کاربر...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          بازگشت
        </button>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  const { user, orders, purchases, analytics, alerts } = insights;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">جزئیات کاربر</p>
          <h1 className="text-3xl font-black text-slate-900">{user.name || user.email}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            بازگشت
          </button>
          <Link
            href="/admin/users"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-100"
          >
            لیست کاربران
          </Link>
        </div>
      </div>

      {inlineSuccess && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {inlineSuccess}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">کل سفارشات</p>
          <p className="text-2xl font-black text-slate-900">{formatNumber(orders.totalOrders)}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">جمع خرید</p>
          <p className="text-2xl font-black text-emerald-600">{formatNumber(orders.totalSpent)} تومان</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">میانگین هر سفارش</p>
          <p className="text-2xl font-black text-blue-600">{formatNumber(orders.averageOrderValue)} تومان</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">بازدیدها</p>
          <p className="text-2xl font-black text-purple-600">{formatNumber(analytics.pageViews)}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">اطلاعات کاربر</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-600">
              نام و نام خانوادگی
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </label>
            <label className="text-sm font-semibold text-slate-600">
              شماره تماس
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </label>
            <label className="text-sm font-semibold text-slate-600">
              آیدی تلگرام
              <input
                type="text"
                value={profileForm.telegram}
                onChange={(e) => handleProfileChange('telegram', e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </label>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">وضعیت کاربر</p>
              <p className="mt-1">نقش: {user.role === 'admin' ? 'مدیر' : 'کاربر'}</p>
              <p>عضویت: {formatDate(user.createdAt)}</p>
              <p>آخرین فعالیت: {formatDate(analytics.lastVisitAt as string)}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {savingProfile ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">ارسال پیام مستقیم</h2>
          <input
            type="text"
            value={messageSubject}
            onChange={(e) => setMessageSubject(e.target.value)}
            placeholder="موضوع پیام"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
          <textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            placeholder="متن پیام..."
          />
          <select
            value={messageChannel}
            onChange={(e) => setMessageChannel(e.target.value as typeof messageChannel)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
          >
            <option value="email">ایمیل + اعلان</option>
            <option value="telegram">تلگرام</option>
            <option value="both">هردو</option>
          </select>
          <button
            onClick={handleSendDirectMessage}
            disabled={sendingMessage}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {sendingMessage ? 'در حال ارسال...' : 'ارسال پیام'}
          </button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">دسته‌بندی‌های محبوب</h3>
            <span className="text-xs text-slate-400">بر اساس سفارشات</span>
          </div>
          <div className="mt-4 space-y-3">
            {purchases.topCategories.length === 0 ? (
              <p className="text-sm text-slate-500">هنوز دسته‌بندی ثبت نشده است</p>
            ) : (
              purchases.topCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{category.name}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{category.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">صفحات بازدید شده</h3>
            <span className="text-xs text-slate-400">top 5</span>
          </div>
          <div className="mt-4 space-y-3">
            {analytics.topPages.length === 0 ? (
              <p className="text-sm text-slate-500">داده‌ای موجود نیست</p>
            ) : (
              analytics.topPages.map((page) => (
                <div key={page.path} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{page.path || '/'}</p>
                  <span className="text-sm font-bold text-blue-600">{page.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">سفارشات اخیر</h3>
          <span className="text-xs text-slate-400">آخرین ۱۰ سفارش</span>
        </div>
        <div className="mt-4 overflow-x-auto">
          {orders.history.length === 0 ? (
            <p className="text-sm text-slate-500">سفارشی ثبت نشده است</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-right text-xs text-slate-500">
                  <th className="px-4 py-2 font-semibold">شماره سفارش</th>
                  <th className="px-4 py-2 font-semibold">مبلغ</th>
                  <th className="px-4 py-2 font-semibold">پرداخت</th>
                  <th className="px-4 py-2 font-semibold">تحویل</th>
                  <th className="px-4 py-2 font-semibold">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.history.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold">{formatNumber(order.totalAmount)} تومان</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-600'
                          : order.paymentStatus === 'pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{order.fulfillmentStatus}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">هشدارهای قیمت فعال</p>
          <p className="text-2xl font-black text-slate-900">{alerts.priceAlerts}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">اعلان‌های خوانده نشده</p>
          <p className="text-2xl font-black text-rose-600">{alerts.unreadNotifications}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">آخرین بازدید</p>
          <p className="text-base font-bold text-slate-900">{formatDate(analytics.lastVisitAt as string)}</p>
        </div>
      </section>

      {!ADMIN_API_KEY && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          برای مدیریت کاربران باید کلید ادمین در محیط کاربری تنظیم شده باشد.
        </div>
      )}
    </div>
  );
}
