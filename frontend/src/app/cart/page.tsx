'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { formatToman } from '@/lib/format';
import { Icon } from '@/components/icons/Icon';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, totalPrice, shippingCost, finalTotal } = useCart();

  // Calculate total savings
  const totalSavings = cart?.items.reduce((acc, item) => {
    // Check if gameId exists and has basePrice
    if (!item.gameId || !item.gameId.basePrice) return acc;
    
    const basePrice = item.gameId.basePrice;
    const currentPrice = item.priceAtAdd;
    
    if (basePrice > currentPrice) {
      return acc + (basePrice - currentPrice) * item.quantity;
    }
    return acc;
  }, 0) || 0;

  if (loading && !cart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
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
          <h2 className="mb-3 font-serif text-3xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
            سبد خرید شما خالی است
          </h2>
          <p className="mb-8 text-[#4a3f3a]/60">
            هنوز هیچ محصولی به سبد خرید خود اضافه نکرده‌اید.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <Icon name="shopping-bag" size={18} />
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-4xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
            سبد خرید
          </h1>
          <p className="text-[#4a3f3a]/60">{cart.items.length} محصول در سبد شما</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cart.items.filter(item => item.gameId).map((item) => (
              <div
                key={item.gameId.id}
                className="flex flex-col gap-4 rounded-2xl border border-[#c9a896]/20 bg-white p-6 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#f8f5f2]">
                  {item.gameId.coverUrl ? (
                    <Image
                      src={item.gameId.coverUrl}
                      alt={item.gameId.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl text-[#c9a896]/30">
                      🛏️
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <Link 
                    href={`/products/${item.gameId.slug}`} 
                    className="font-semibold text-[#4a3f3a] transition-colors hover:text-[#c9a896]"
                  >
                    {item.gameId.title}
                  </Link>
                  <div className="text-sm text-[#4a3f3a]/60">
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0
                      ? Object.entries(item.selectedOptions)
                          .map(([k, v]) => `${v}`)
                          .join(' | ')
                      : 'استاندارد'}
                  </div>
                  <div className="font-serif text-lg font-bold text-[#4a3f3a]">
                    {formatToman(item.priceAtAdd)} تومان
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center gap-3 rounded-full border border-[#c9a896]/30 bg-[#f8f5f2]/50 px-4 py-2">
                    <button
                      onClick={() => updateQuantity(item.gameId.id, item.quantity - 1)}
                      className="text-[#4a3f3a] transition-colors hover:text-[#c9a896]"
                      disabled={loading}
                    >
                      <Icon name="minus" size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold text-[#4a3f3a]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.gameId.id, item.quantity + 1)}
                      className="text-[#4a3f3a] transition-colors hover:text-[#c9a896]"
                      disabled={loading}
                    >
                      <Icon name="plus" size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.gameId.id)}
                    className="rounded-full bg-red-50 p-2.5 text-red-500 transition-all hover:bg-red-100"
                    disabled={loading}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-2xl border border-[#c9a896]/20 bg-white p-6 shadow-lg">
            <h2 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              خلاصه سفارش
            </h2>
            
            <div className="space-y-4 border-b border-[#c9a896]/20 pb-6">
              <div className="flex justify-between text-[#4a3f3a]/70">
                <span>قیمت کالاها ({cart.items.length})</span>
                <span className="font-semibold text-[#4a3f3a]">{formatToman(totalPrice)} تومان</span>
              </div>
              <div className="flex justify-between text-[#4a3f3a]/70">
                <span>تخفیف</span>
                <span className={`font-semibold ${totalSavings > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                  {totalSavings > 0 ? `${formatToman(totalSavings)} تومان` : '0 تومان'}
                </span>
              </div>
              
              {totalSavings > 0 && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-600 border border-emerald-100 animate-pulse">
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="sparkles" size={16} />
                    <span>سود شما از این خرید: {formatToman(totalSavings)} تومان</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-[#4a3f3a]/70">
                <span>هزینه ارسال</span>
                <span className="font-semibold text-[#4a3f3a]">
                  {shippingCost > 0 ? `${formatToman(shippingCost)} تومان` : 'رایگان'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <span className="font-serif text-xl font-bold text-[#4a3f3a]">مبلغ قابل پرداخت</span>
              <span className="font-serif text-2xl font-bold text-[#4a3f3a]">{formatToman(finalTotal)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] py-4 text-center font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Icon name="arrow-left" size={18} />
              ادامه فرآیند خرید
            </Link>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#4a3f3a]/60">
                <Icon name="shield" size={16} className="text-[#c9a896]" />
                <span>پرداخت امن و مطمئن</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#4a3f3a]/60">
                <Icon name="truck" size={16} className="text-[#c9a896]" />
                <span>ارسال سریع به سراسر کشور</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#4a3f3a]/60">
                <Icon name="refresh" size={16} className="text-[#c9a896]" />
                <span>ضمانت بازگشت کالا</span>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-[#4a3f3a]/50">
              با نهایی کردن خرید، قوانین و مقررات نرمینه خواب را می‌پذیرید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
