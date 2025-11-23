'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { formatToman } from '@/lib/format';

export const CartIcon = () => {
  const { cart, itemCount, totalPrice } = useCart();

  return (
    <div className="group relative z-50">
      <Link
        href="/cart"
        className="relative flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>سبد خرید</span>
        {itemCount > 0 && (
          <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </Link>

      {/* Dropdown */}
      <div className="invisible absolute left-0 top-full mt-4 w-80 opacity-0 transition-all duration-200 group-hover:visible group-hover:mt-2 group-hover:opacity-100">
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">سبد خرید شما</h3>
              <span className="text-xs text-slate-500">{itemCount} کالا</span>
            </div>

            {!cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="mb-2 rounded-full bg-slate-50 p-3">
                  <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">سبد خرید خالی است</p>
              </div>
            ) : (
              <>
                <div className="max-h-60 space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {cart.items.filter(item => item.gameId).map((item, index) => {
                    const itemKey = `${item.gameId.id}-${item.variantId ?? 'default'}-${item.addedAt ?? index}`;
                    return (
                    <div key={itemKey} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {item.gameId.coverUrl ? (
                          <Image
                            src={item.gameId.coverUrl}
                            alt={item.gameId.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-slate-400">تصویر ندارد</div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <h4 className="line-clamp-1 text-sm font-bold text-slate-900">{item.gameId.title}</h4>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-[10px] text-slate-500">
                            {Object.entries(item.selectedOptions)
                              .map(([, v]) => `${v}`)
                              .join(' | ')}
                          </p>
                        )}
                        <div className="mt-1 flex items-center justify-between text-xs">
                          <span className="text-slate-500">{item.quantity} عدد</span>
                          <span className="font-semibold text-emerald-600">{formatToman(item.priceAtAdd * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="mb-4 flex items-center justify-between font-bold text-slate-900">
                    <span>مبلغ قابل پرداخت</span>
                    <span>{formatToman(totalPrice)} تومان</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/cart"
                      className="rounded-xl border border-slate-200 py-2 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      مشاهده سبد
                    </Link>
                    <Link
                      href="/checkout"
                      className="rounded-xl bg-emerald-500 py-2 text-center text-sm font-bold text-white transition hover:bg-emerald-600"
                    >
                      تسویه حساب
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
