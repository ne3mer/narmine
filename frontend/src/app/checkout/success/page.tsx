'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { formatToman } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';

interface Order {
  _id: string;
  orderNumber?: string;
  customerInfo: {
    name?: string;
    email: string;
    phone: string;
  };
  items: Array<{
    gameId: {
      title: string;
      coverUrl?: string;
    };
    pricePaid: number;
    quantity: number;
    selectedOptions?: Record<string, string>;
  }>;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { refreshCart } = useCart();

  useEffect(() => {
    if (!orderId) {
      setError('شناسه سفارش یافت نشد');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('gc_token');
        const headers: HeadersInit = {};
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
          headers
        });

        if (!response.ok) {
          throw new Error('سفارش یافت نشد');
        }

        const data = await response.json();
        setOrder(data.data);
        refreshCart();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات سفارش');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-rose-100 p-6">
          <svg className="h-12 w-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error || 'سفارش یافت نشد'}</h2>
        <Link
          href="/"
          className="mt-4 rounded-2xl bg-emerald-500 px-8 py-3 font-bold text-white transition hover:bg-emerald-600"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900">سفارش شما با موفقیت ثبت شد!</h1>
          <p className="mt-2 text-slate-600">شماره سفارش: {order.orderNumber ?? order._id.slice(-8).toUpperCase()}</p>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">اطلاعات تماس</h2>
            <div className="space-y-2 text-sm">
              {order.customerInfo.name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">نام:</span>
                  <span className="font-bold text-slate-900">{order.customerInfo.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">ایمیل:</span>
                <span className="font-bold text-slate-900" dir="ltr">{order.customerInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">موبایل:</span>
                <span className="font-bold text-slate-900" dir="ltr">{order.customerInfo.phone}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">محصولات سفارش</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <div className="font-bold text-slate-900">{item.gameId.title}</div>
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="text-xs text-slate-500">
                        {Object.entries(item.selectedOptions).map(([k, v]) => v).join(' | ')}
                      </div>
                    )}
                    <div className="text-sm text-slate-600">تعداد: {item.quantity}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">{formatToman(item.pricePaid * item.quantity)}</div>
                    <div className="text-xs text-slate-500">تومان</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-lg font-black text-slate-900">
              <span>مبلغ کل:</span>
              <span>{formatToman(order.totalAmount)} تومان</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="mb-3 text-lg font-bold text-emerald-900">مراحل بعدی</h2>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex items-start gap-2">
                <svg className="h-5 w-5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>اطلاعات اکانت به ایمیل <strong>{order.customerInfo.email}</strong> ارسال خواهد شد</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="h-5 w-5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>می‌توانید از طریق پنل کاربری خود نیز به اطلاعات اکانت دسترسی داشته باشید</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="h-5 w-5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  در صورت بروز هرگونه مشکل، با پشتیبانی تماس بگیرید و شماره سفارش{' '}
                  <strong>{order.orderNumber ?? order._id}</strong> را اعلام کنید
                </span>
              </li>
            </ul>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://t.me/GameClubSupportBot?start=order-${order.orderNumber ?? order._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-2xl bg-white py-3 text-center text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
              >
                گفتگو با پشتیبانی تلگرام
              </a>
              <a
                href={`mailto:support@gameclub.ir?subject=پیگیری سفارش ${order.orderNumber ?? order._id}`}
                className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 py-3 text-center text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                ارسال ایمیل پشتیبانی
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/orders"
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-center font-bold text-slate-900 transition hover:bg-slate-50"
            >
              مشاهده سفارشات من
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-2xl bg-emerald-500 py-3 text-center font-bold text-white transition hover:bg-emerald-600"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
