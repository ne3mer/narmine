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
};

export const MinimalProductCard = ({ id, title, cover, price, slug, rating: staticRating }: MinimalProductCardProps) => {
  const { rating: dynamicRating } = useProductRating(id);
  const displayRating = dynamicRating !== null && dynamicRating > 0 ? dynamicRating : (staticRating || 0);
  const productSlug = slug ?? id;
  const imageSrc = cover && cover.trim() !== '' ? resolveImageUrl(cover) : '/placeholder-product.jpg';

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
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-[#c9a896]/30">
            🛏️
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
          <span className="font-serif text-lg font-bold text-[#4a3f3a]">{formatToman(price)}</span>
          <span className="text-xs text-[#4a3f3a]/60">تومان</span>
        </div>
      </div>
    </Link>
  );
};
