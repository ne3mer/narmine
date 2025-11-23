'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatToman } from '@/lib/format';
import { API_BASE_URL } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';
import { getAuthToken } from '@/lib/auth';

type OrderPayloadItem = {
  gameId: string;
  variantId?: string;
  selectedOptions?: Record<string, string>;
  pricePaid: number;
  quantity: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, loading: cartLoading, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; name?: string; discount: number } | null>(null);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('online');

  const cartProductIds = useMemo(() => {
    if (!cart?.items) return [] as string[];
    return cart.items
      .map((item) => {
        if (typeof item.gameId === 'string') return item.gameId;
        return item.gameId?.id || (item.gameId as any)?._id || '';
      })
      .filter((id): id is string => Boolean(id));
  }, [cart]);

  const discountAmount = appliedCoupon?.discount || 0;
  const shippingCost = totalPrice > 500000 ? 0 : 50000;
  const finalTotal = Math.max(totalPrice - discountAmount + shippingCost, 0);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [profileRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/profile`, { headers }),
          fetch(`${API_BASE_URL}/api/orders`, { headers })
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          const user = data.data;
          if (user) {
            setCustomerInfo(prev => ({
              ...prev,
              name: user.name || prev.name,
              email: user.email || prev.email,
              phone: user.phone || prev.phone
            }));
          }
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          const orders = Array.isArray(data?.data) ? data.data : [];
          const latestOrder = orders[0];
          const shipping = latestOrder?.customerInfo?.shippingAddress;

          if (shipping) {
            setCustomerInfo(prev => ({
              ...prev,
              city: shipping.city || prev.city,
              postalCode: shipping.postalCode || prev.postalCode,
              address: shipping.address || prev.address,
              name: shipping.recipientName || latestOrder.customerInfo?.name || prev.name,
              phone: shipping.recipientPhone || latestOrder.customerInfo?.phone || prev.phone,
              email: latestOrder.customerInfo?.email || prev.email
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching checkout defaults:', err);
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/login?redirect=/checkout');
        setLoading(false);
        return;
      }

      const orderItems = (cart?.items || [])
        .map((item) => {
          const productId = typeof item.gameId === 'string' ? item.gameId : item.gameId?.id;
          if (!productId) return null;

          return {
            gameId: productId,
            variantId: item.variantId,
            selectedOptions: item.selectedOptions,
            pricePaid: item.priceAtAdd,
            quantity: item.quantity
          };
        })
        .filter((item): item is OrderPayloadItem => Boolean(item));

      if (orderItems.length === 0) {
        setError('سبد خرید شما خالی است');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          customerInfo,
          paymentMethod,
          items: orderItems,
          totalAmount: finalTotal,
          couponCode: appliedCoupon?.code,
          discountAmount: discountAmount > 0 ? discountAmount : undefined
        })
      });

      if (!response.ok) throw new Error('خطا در ثبت سفارش');

      const data = await response.json();
      const orderData = data?.data;
      
      if (orderData?.paymentUrl) {
        window.location.href = orderData.paymentUrl;
      } else {
        if (typeof window !== 'undefined' && orderData) {
          try {
            sessionStorage.setItem('narmine_last_order', JSON.stringify(orderData));
          } catch (err) {
            console.warn('Failed to cache order summary', err);
          }
        }
        await clearCart();
        if (orderData?.id || orderData?._id) {
          const id = orderData.id || orderData._id;
          router.push(`/orders/success?orderId=${id}`);
        } else {
          router.push('/orders');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت سفارش');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponStatus({ type: 'error', message: 'کد تخفیف را وارد کنید' });
      return;
    }

    if (!cart || cart.items.length === 0) {
      setCouponStatus({ type: 'error', message: 'سبد خرید شما خالی است' });
      return;
    }

    setCouponLoading(true);
    setCouponStatus(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          cartTotal: totalPrice,
          productIds: cartProductIds
        })
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        const message = result?.data?.error || result?.message || 'کد تخفیف معتبر نیست';
        throw new Error(message);
      }

      const coupon = result.data?.coupon;
      if (!coupon || !result.data.valid) {
        throw new Error(result.data?.error || 'کد تخفیف معتبر نیست');
      }

      setAppliedCoupon({ code: coupon.code, name: coupon.name, discount: coupon.discount });
      setCouponStatus({ type: 'success', message: `کد ${coupon.code} اعمال شد - ${formatToman(coupon.discount)} تومان تخفیف` });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponStatus({ type: 'error', message: err instanceof Error ? err.message : 'امکان اعمال کد تخفیف وجود ندارد' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponStatus(null);
  };

  if (cartLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f8f5f2] border-t-[#c9a896]"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f8f5f2]">
            <Icon name="shopping-bag" size={40} className="text-[#c9a896]" />
          </div>
          <h2 className="mb-3 font-serif text-3xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-playfair)' }}>
            سبد خرید شما خالی است
          </h2>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-8 py-4 font-semibold text-white shadow-lg"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-4xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-playfair)' }}>
            تکمیل خرید
          </h1>
          <p className="text-[#4a3f3a]/60">لطفاً اطلاعات خود را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          {/* Customer Info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-[#c9a896]/20 bg-white p-6 shadow-sm">
              <h2 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]">اطلاعات تماس</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">شماره تماس</label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">ایمیل</label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#c9a896]/20 bg-white p-6 shadow-sm">
              <h2 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]">آدرس تحویل</h2>
              
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">شهر</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                      className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">کد پستی</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.postalCode}
                      onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
                      className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">آدرس کامل</label>
                  <textarea
                    required
                    rows={3}
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#c9a896]/20 bg-white p-6 shadow-sm">
              <h2 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]">روش پرداخت</h2>
              
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-[#c9a896]/30 p-4 transition-all hover:border-[#c9a896] has-[:checked]:border-[#c9a896] has-[:checked]:bg-[#f8f5f2]/50">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-[#c9a896]"
                  />
                  <Icon name="credit-card" size={20} className="text-[#c9a896]" />
                  <span className="font-medium text-[#4a3f3a]">پرداخت آنلاین</span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-[#c9a896]/30 p-4 transition-all hover:border-[#c9a896] has-[:checked]:border-[#c9a896] has-[:checked]:bg-[#f8f5f2]/50">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-[#c9a896]"
                  />
                  <Icon name="dollar-sign" size={20} className="text-[#c9a896]" />
                  <span className="font-medium text-[#4a3f3a]">پرداخت در محل</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[#c9a896]/20 bg-white p-6 shadow-lg">
              <h2 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]">خلاصه سفارش</h2>
              
              <div className="mb-6 space-y-4">
                {cart.items.map((item, index) => {
                  const product = item.gameId ?? null;
                  const productId = product?.id ?? `${item.id || 'item'}-${index}`;
                  const productTitle = product?.title ?? 'محصول نامشخص';
                  const coverUrl = product?.coverUrl;

                  return (
                    <div key={productId} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#f8f5f2]">
                        {coverUrl ? (
                          <Image src={coverUrl} alt={productTitle} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl">🛏️</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#4a3f3a] line-clamp-1">{productTitle}</p>
                        <p className="text-xs text-[#4a3f3a]/60">تعداد: {item.quantity}</p>
                        <p className="text-sm font-bold text-[#4a3f3a]">{formatToman(item.priceAtAdd)} تومان</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mb-6 rounded-2xl border border-dashed border-[#c9a896]/50 bg-[#fdf9f5] p-4">
                {appliedCoupon ? (
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#4a3f3a]">کد {appliedCoupon.code}</p>
                        <p className="text-xs text-[#4a3f3a]/70">{appliedCoupon.name || 'تخفیف فعال'} – {formatToman(appliedCoupon.discount)} تومان</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                      >
                        حذف کد
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                      <Icon name="check" size={14} />
                      تخفیف با موفقیت اعمال شد
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[#4a3f3a]/80">کد تخفیف دارید؟</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponStatus(null);
                        }}
                        placeholder="مثال: SLEEP20"
                        className="flex-1 rounded-2xl border border-[#c9a896]/40 px-4 py-3 text-sm uppercase tracking-wide focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="rounded-2xl bg-[#4a3f3a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3a332f] disabled:opacity-50"
                      >
                        {couponLoading ? 'در حال بررسی...' : 'اعمال'}
                      </button>
                    </div>
                    {couponStatus && (
                      <p className={`text-xs ${couponStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {couponStatus.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-[#c9a896]/20 pt-4">
                <div className="flex justify-between text-[#4a3f3a]/70">
                  <span>جمع کل</span>
                  <span className="font-semibold text-[#4a3f3a]">{formatToman(totalPrice)} تومان</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 text-sm">
                    <span>تخفیف</span>
                    <span>-{formatToman(discountAmount)} تومان</span>
                  </div>
                )}
                <div className="flex justify-between text-[#4a3f3a]/70">
                  <span>هزینه ارسال</span>
                  <span className="font-semibold text-[#4a3f3a]">
                    {shippingCost > 0 ? `${formatToman(shippingCost)} تومان` : 'رایگان'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-[#c9a896]/20 pt-4">
                <span className="font-serif text-xl font-bold text-[#4a3f3a]">مبلغ نهایی</span>
                <span className="font-serif text-2xl font-bold text-[#4a3f3a]">{formatToman(finalTotal)}</span>
              </div>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    در حال پردازش...
                  </span>
                ) : (
                  'تکمیل خرید'
                )}
              </button>

              <p className="mt-4 text-center text-xs text-[#4a3f3a]/50">
                با تکمیل خرید، قوانین و مقررات نرمینه خواب را می‌پذیرید.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
