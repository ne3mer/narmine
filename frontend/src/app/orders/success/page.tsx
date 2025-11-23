'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { formatToman } from '@/lib/format';
import { Icon } from '@/components/icons/Icon';

type OrderItem = {
  id: string;
  title: string;
  coverUrl?: string;
  quantity: number;
  pricePaid: number;
};

type OrderSummary = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  fulfillmentStatus: 'pending' | 'assigned' | 'delivered' | 'refunded';
  createdAt?: string;
  paymentMethod?: string;
  couponCode?: string;
  discountAmount?: number;
  deliveryInfo?: {
    trackingCode?: string;
    message?: string;
  };
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    shippingAddress?: {
      province?: string;
      city?: string;
      address?: string;
      postalCode?: string;
      recipientName?: string;
      recipientPhone?: string;
    };
  };
  items: OrderItem[];
};

const STORAGE_KEY = 'narmine_last_order';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const hydrateOrder = async () => {
      const cached = getCachedOrder();

      if (orderId) {
        const fetched = await fetchOrder(orderId);
        if (fetched) {
          setOrder(fetched);
          setLoading(false);
          return;
        }
      }

      if (cached) {
        setOrder(cached);
        setLoading(false);
        return;
      }

      setError('سفارش یافت نشد.');
      setLoading(false);
    };

    hydrateOrder();
  }, [orderId]);

  const getCachedOrder = (): OrderSummary | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return normalizeOrder(parsed, 0);
    } catch (err) {
      console.warn('Failed to read cached order', err);
      return null;
    }
  };

  const fetchOrder = async (id: string): Promise<OrderSummary | null> => {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        return null;
      }

      const payload = await response.json();
      return normalizeOrder(payload?.data, 0);
    } catch (err) {
      console.error('Error fetching order summary:', err);
      return null;
    }
  };

  const normalizeOrder = (raw: any, index: number): OrderSummary => {
    const id = raw?.id || raw?._id || raw?.orderNumber || `order-${index}`;
    const items: OrderItem[] = Array.isArray(raw?.items)
      ? raw.items.map((item: any, itemIndex: number) => ({
          id: item?.id || item?._id || `${id}-item-${itemIndex}`,
          title: item?.gameId?.title || item?.gameId?.name || 'محصول',
          coverUrl: item?.gameId?.coverUrl,
          quantity: item?.quantity ?? 1,
          pricePaid: item?.pricePaid ?? 0
        }))
      : [];

    return {
      id,
      orderNumber: raw?.orderNumber || (id ? String(id).slice(-8).toUpperCase() : '---'),
      totalAmount: raw?.totalAmount ?? 0,
      paymentStatus: raw?.paymentStatus ?? 'pending',
      fulfillmentStatus: raw?.fulfillmentStatus ?? 'pending',
      createdAt: raw?.createdAt,
      paymentMethod: raw?.paymentMethod,
      couponCode: raw?.couponCode,
      discountAmount: raw?.discountAmount,
      deliveryInfo: raw?.deliveryInfo,
      customerInfo: raw?.customerInfo,
      items
    };
  };

  const renderShippingInfo = () => {
    const shipping = order?.customerInfo?.shippingAddress;
    if (!shipping) {
      return <p className="text-sm text-slate-500">آدرسی ثبت نشده است.</p>;
    }

    return (
      <div className="space-y-2 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">{shipping.recipientName || order?.customerInfo?.name}</p>
        <p>{shipping.recipientPhone || order?.customerInfo?.phone}</p>
        <p className="leading-6">
          {[shipping.province, shipping.city, shipping.address].filter(Boolean).join('، ') || '---'}
        </p>
        {shipping.postalCode && <p>کد پستی: {shipping.postalCode}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5f2]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f1e7df] border-t-[#c9a896]"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-10 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <Icon name="alert" size={28} />
          </div>
          <h1 className="mb-3 text-2xl font-black text-rose-900">سفارش یافت نشد</h1>
          <p className="text-sm text-rose-600">{error || 'برای مشاهده سفارش‌ها به صفحه حساب کاربری مراجعه کنید.'}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/account" className="rounded-full bg-[#4a3f3a] px-6 py-3 text-sm font-semibold text-white">
              بازگشت به حساب کاربری
            </Link>
            <Link href="/products" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">
              ادامه خرید
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white px-4 py-16 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Icon name="check" size={32} />
          </div>
          <h1 className="mb-2 font-serif text-3xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
            سفارش شما با موفقیت ثبت شد
          </h1>
          <p className="text-sm text-slate-500">
            شماره سفارش: <span className="font-mono font-semibold text-slate-900">{order.orderNumber}</span>
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-slate-900">خلاصه سفارش</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#f8f5f2]">
                    {item.coverUrl ? (
                      <Image src={item.coverUrl} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">🛏️</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">تعداد: {item.quantity}</p>
                  </div>
                  <div className="text-left font-bold text-slate-900">{formatToman(item.pricePaid)} تومان</div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>جمع سفارش</span>
                <span className="font-bold text-slate-900">{formatToman(order.totalAmount + (order.discountAmount || 0))} تومان</span>
              </div>
              {order.discountAmount ? (
                <div className="flex justify-between text-emerald-600">
                  <span>تخفیف {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-{formatToman(order.discountAmount)} تومان</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>وضعیت پرداخت</span>
                <span className="font-bold text-emerald-600">{order.paymentStatus === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت'}</span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span>روش پرداخت</span>
                  <span className="font-semibold text-slate-800">{order.paymentMethod === 'cash' ? 'پرداخت در محل' : 'پرداخت آنلاین'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-slate-900">اطلاعات تحویل</h3>
              {renderShippingInfo()}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-slate-900">پیگیری سفارش</h3>
              <p className="text-sm text-slate-600">
                از صفحه سفارشات می‌توانید وضعیت ارسال را دنبال کنید و در صورت نیاز با پشتیبانی تماس بگیرید.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4a3f3a] px-5 py-3 text-sm font-semibold text-white"
                >
                  مشاهده سفارش
                  <Icon name="arrow-left" size={14} />
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  رفتن به حساب کاربری
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4 rounded-3xl border border-[#c9a896]/30 bg-white p-6 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <Icon name="info" size={18} className="text-[#c9a896]" />
            <span>جزئیات سفارش نیز به ایمیل شما ارسال شده است.</span>
          </div>
          <Link href="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}
