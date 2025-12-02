'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, resolveImageUrl } from '@/lib/api';
import { formatToman } from '@/lib/format';
import { Icon } from '@/components/icons/Icon';

interface SaleProduct {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  basePrice: number;
  salePrice?: number;
  onSale?: boolean;
  coverUrl?: string;
  gallery?: string[];
  updatedAt?: string;
  variants?: {
    price: number;
    salePrice?: number;
    onSale?: boolean;
  }[];
}

const DEFAULT_IMAGE = 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp';

const getDiscountSnapshot = (product: SaleProduct) => {
  let base = product.basePrice || 0;
  let finalPrice = product.onSale && product.salePrice ? product.salePrice : product.basePrice;
  
  // Check variants for better deals and price range
  let minPrice = base;
  let hasMultiplePrices = false;
  const prices = new Set<number>([base]);

  if (Array.isArray(product.variants)) {
    for (const variant of product.variants) {
      if (typeof variant.price === 'number') {
        prices.add(variant.price);
        if (variant.price < minPrice) {
          minPrice = variant.price;
        }
      }

      if (variant.onSale && typeof variant.salePrice === 'number' && variant.salePrice < variant.price) {
        // If this variant has a lower sale price than current finalPrice
        if (variant.salePrice < finalPrice) {
          finalPrice = variant.salePrice;
          base = variant.price;
        }
      }
    }
  }

  hasMultiplePrices = prices.size > 1;

  const percent = base > 0 && finalPrice < base ? Math.round(((base - finalPrice) / base) * 100) : 0;
  const savings = base > finalPrice ? base - finalPrice : 0;
  return { base, finalPrice, percent, savings, minPrice, hasMultiplePrices };
};

export const SaleShowcaseSection = () => {
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/games?onSale=true&sort=-updatedAt&limit=4`, {
          cache: 'no-store'
        });
        if (!response.ok) {
          throw new Error('خطا در دریافت محصولات دارای تخفیف');
        }
        const payload = await response.json();
        const items: SaleProduct[] = Array.isArray(payload?.data) ? payload.data : [];
        setProducts(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'امکان دریافت لیست تخفیف وجود ندارد');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  const spotlightProduct = useMemo(() => products[0], [products]);
  const secondaryProducts = useMemo(() => products.slice(1), [products]);

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 h-[420px] rounded-[32px] bg-slate-800/80 animate-pulse" />
        <div className="lg:col-span-5 space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="h-40 rounded-3xl bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-6 py-8 text-center text-rose-100">
        {error}
      </div>
    );
  }

  if (!spotlightProduct) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center text-white/70">
        <p>در حال حاضر محصول تخفیف‌داری نداریم، به زودی افزوده می‌شود.</p>
      </div>
    );
  }

  const spotlightDiscount = getDiscountSnapshot(spotlightProduct);
  const spotlightImage = resolveImageUrl(spotlightProduct.coverUrl || spotlightProduct.gallery?.[0] || '');

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2 text-white">
        <p className="text-sm font-semibold tracking-[0.4em] text-rose-200 uppercase">منطقه حراج بزرگ</p>
        <h2 className="text-3xl md:text-4xl font-black">حراج ویژه نرمینه خواب</h2>
        <p className="text-white/70 max-w-2xl">
          محصولات منتخب با تخفیف‌های هیجان‌انگیز و محدود. قیمت قبل و بعد از تخفیف را واضح ببینید و خرید هوشمندانه‌تری داشته باشید.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Spotlight card */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#f472b6]/20 via-transparent to-[#c084fc]/20 p-1 lg:col-span-7">
          <div className="relative rounded-[30px] bg-[#0f172a] p-8 text-white shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]">flash deal</div>
                <h3 className="text-3xl font-black leading-tight" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                  {spotlightProduct.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                  {spotlightProduct.description || 'زمان محدودی برای خرید این محصول با قیمت شگفت‌انگیز باقی مانده است.'}
                </p>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="text-xs text-white/60">قیمت قبل</div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/60 line-through decoration-2 decoration-white/40">{formatToman(spotlightDiscount.base)}</span>
                    {spotlightDiscount.percent > 0 && (
                      <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-200">
                        {spotlightDiscount.percent}%
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/60">بعد از تخفیف</div>
                  <div className="text-4xl font-black text-white">{formatToman(spotlightDiscount.finalPrice)}
                    <span className="text-base font-medium text-white/60 mr-2">تومان</span>
                  </div>
                  {spotlightDiscount.savings > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                      <Icon name="sparkles" size={16} />
                      صرفه‌جویی شما: {formatToman(spotlightDiscount.savings)} تومان
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/products/${spotlightProduct.slug || spotlightProduct.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-[#0f172a] transition hover:bg-rose-100"
                  >
                    مشاهده محصول
                    <Icon name="arrow-left" size={18} />
                  </Link>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm text-white/80">
                    <Icon name="clock" size={16} />
                    تخفیف تا اطلاع ثانوی
                  </div>
                </div>
              </div>

              <div className="relative h-[320px] w-full">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/0 via-white/10 to-white/0 animate-pulse" />
                <Image
                  src={spotlightImage || DEFAULT_IMAGE}
                  alt={spotlightProduct.title}
                  fill
                  className="object-cover rounded-3xl"
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary deals */}
        <div className="space-y-4 lg:col-span-5">
          {secondaryProducts.slice(0, 3).map((product) => {
            const stats = getDiscountSnapshot(product);
            const img = resolveImageUrl(product.coverUrl || product.gallery?.[0] || '');
            return (
              <Link
                href={`/products/${product.slug || product.id}`}
                key={product.id}
                className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-white/80 transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-white/10">
                  <Image src={img || DEFAULT_IMAGE} alt={product.title} fill className="object-cover" sizes="96px" />
                  {stats.percent > 0 && (
                    <span className="absolute top-2 right-2 rounded-full bg-rose-500/80 px-2 py-0.5 text-xs font-bold text-white">
                      {stats.percent}%
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white">{product.title}</h3>
                    {product.updatedAt && (
                      <span className="text-xs text-white/50">
                        {new Date(product.updatedAt).toLocaleDateString('fa-IR')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2">
                    {product.description || 'تخفیف ویژه برای مدت محدود'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    {stats.hasMultiplePrices && (
                      <span className="text-xs text-white/60">از</span>
                    )}
                    <span className="text-lg font-black text-white">{formatToman(stats.finalPrice)}</span>
                    <span className="text-xs text-white/60">تومان</span>
                    <span className="text-[10px] text-white/50 line-through">{formatToman(stats.base)}</span>
                  </div>
                </div>
                <Icon name="arrow-left" size={18} className="text-white/40 transition group-hover:text-white" />
              </Link>
            );
          })}

          {secondaryProducts.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-center text-white/70">
              تنها یک محصول دارای تخفیف فعال است.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
