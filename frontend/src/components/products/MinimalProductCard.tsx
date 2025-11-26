'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatToman } from '@/lib/format';
import { resolveImageUrl } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';
import { useProductRating } from '@/hooks/useProductRating';

type MinimalProductCardProps = {
  id: string;
  title: string;
  cover: string;
  price: number;
  slug?: string;
  rating?: number;
  onSale?: boolean;
  salePrice?: number;
  basePrice?: number;
  minPrice?: number;
  hasMultiplePrices?: boolean;
};

export const MinimalProductCard = ({ 
  id, 
  title, 
  cover, 
  price, 
  slug, 
  rating: staticRating,
  onSale,
  salePrice,
  basePrice,
  minPrice,
  hasMultiplePrices
}: MinimalProductCardProps) => {
  const { rating: dynamicRating } = useProductRating(id);
  const displayRating = dynamicRating !== null && dynamicRating > 0 ? dynamicRating : (staticRating || 0);
  const productSlug = slug ?? id;
  const imageSrc = cover && cover.trim() !== '' ? resolveImageUrl(cover) : '/placeholder-product.jpg';

  const discountPercent = onSale && basePrice && (salePrice || price)
    ? Math.round(((basePrice - (salePrice || price)) / basePrice) * 100)
    : 0;

  return (
    <Link
      href={`/products/${productSlug}`}
      className="group block overflow-hidden rounded-2xl border border-[#c9a896]/20 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#c9a896]/10"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#f8f5f2]">
        {imageSrc !== '/placeholder-product.jpg' ? (
          <Image
            src={imageSrc}
            alt={title || 'محصول'}
            fill
            sizes="(max-width: 768px) 200px, 250px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-[#c9a896]/30">
            🛏️
          </div>
        )}
        
        {/* Discount Badge */}
        {onSale && discountPercent > 0 && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white shadow-md animate-pulse">
            <Icon name="zap" size={10} className="fill-white" />
            <span>{discountPercent}%</span>
          </div>
        )}

        {displayRating > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full border border-white/40 bg-white/90 backdrop-blur-sm px-2 py-1 shadow-sm">
            <Icon name="star" size={12} className="text-amber-500" strokeWidth={0} />
            <span className="text-xs font-bold text-[#4a3f3a]">{displayRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 text-sm font-semibold text-[#4a3f3a] line-clamp-2 leading-snug">
          {title || 'بدون عنوان'}
        </h3>
        <div className="flex items-baseline gap-1">
          {onSale ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] text-slate-400 line-through decoration-slate-400/50">
                  {basePrice ? formatToman(basePrice) : ''}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                {hasMultiplePrices && (
                  <span className="text-[10px] text-rose-600/80">از</span>
                )}
                <span className="font-serif text-lg font-bold text-rose-600">
                  {formatToman(salePrice || price)}
                </span>
                <span className="text-xs text-rose-600/80">تومان</span>
              </div>
            </div>
          ) : (
            <>
              {hasMultiplePrices && (
                <span className="text-[10px] text-[#4a3f3a]/60">از</span>
              )}
              <span className="font-serif text-lg font-bold text-[#4a3f3a]">{formatToman(minPrice || price)}</span>
              <span className="text-xs text-[#4a3f3a]/60">تومان</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};
