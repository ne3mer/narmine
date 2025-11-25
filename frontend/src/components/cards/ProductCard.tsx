'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { formatToman } from '@/lib/format';
import { resolveImageUrl } from '@/lib/api';
import type { ProductCardContent } from '@/data/home';
import { Icon } from '@/components/icons/Icon';
import { useProductRating } from '@/hooks/useProductRating';

interface Props {
  game: ProductCardContent;
}

export const ProductCard = ({ game }: Props) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const slug = game.slug ?? game.id;
  const { rating: dynamicRating, reviewCount } = useProductRating(game.id);
  
  const displayRating = dynamicRating !== null && dynamicRating > 0 ? dynamicRating : (game.rating || 0);
  
  const discountPercent = game.onSale && game.basePrice && (game.salePrice || game.price)
    ? Math.round(((game.basePrice - (game.salePrice || game.price)) / game.basePrice) * 100)
    : 0;

  const handleCardClick = () => {
    router.push(`/products/${slug}`);
  };

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      setLoading(true);
      await addToCart(game.id);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('لطفاً برای خرید وارد حساب کاربری شوید');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-[#c9a896]/20 bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#c9a896]/10"
    >
      {/* Image */}
      <div className="relative h-72 w-full overflow-hidden bg-[#f8f5f2]">
        <Image
          src={resolveImageUrl(game.cover)}
          alt={game.title}
          fill
          sizes="(max-width: 768px) 300px, 360px"
          className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          {game.shipping?.freeShipping && (
            <span className="rounded-full border border-white/40 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-[#4a3f3a] shadow-sm">
              ارسال رایگان
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {game.onSale && discountPercent > 0 && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg animate-pulse">
            <Icon name="zap" size={14} className="fill-white" />
            <span>{discountPercent}%</span>
          </div>
        )}

        {/* Rating */}
        {displayRating > 0 && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full border border-white/40 bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
            <Icon name="star" size={14} className="text-amber-500" strokeWidth={0} />
            <span className="text-xs font-bold text-[#4a3f3a]">{displayRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-6">
        {/* Title */}
        <h3 className="mb-2 font-serif text-xl font-bold leading-tight text-[#4a3f3a] line-clamp-2" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
          {game.title}
        </h3>

        {/* Review Count */}
        {reviewCount > 0 && (
          <p className="mb-4 text-xs text-[#4a3f3a]/60">
            {reviewCount} نظر
          </p>
        )}

        {/* Price */}
        <div className="mb-4 mt-auto">
          {game.onSale ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-400 line-through decoration-slate-400/50 decoration-2">
                  {formatToman(game.basePrice)}
                </span>
                <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                  {discountPercent}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold text-rose-600">
                  {formatToman(game.salePrice || game.price)}
                </span>
                <span className="text-sm text-rose-600/80">تومان</span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-[#4a3f3a]">
                {formatToman(game.price)}
              </span>
              <span className="text-sm text-[#4a3f3a]/60">تومان</span>
            </div>
          )}
          {game.monthlyPrice && (
            <p className="mt-1 text-xs text-[#4a3f3a]/60">پرداخت ماهانه: {formatToman(game.monthlyPrice)} تومان</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(e);
            }}
            disabled={loading || (game.inventory?.status === 'out_of_stock')}
            className="flex-1 rounded-full bg-[#4a3f3a] py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#c9a896] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                در حال افزودن...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Icon name="shopping-bag" size={16} className="text-white" />
                {game.inventory?.status === 'out_of_stock' ? 'ناموجود' : 'افزودن'}
              </span>
            )}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/products/${slug}`);
            }}
            className="rounded-full border border-[#c9a896]/40 bg-white px-5 py-3 text-sm font-semibold text-[#4a3f3a] transition-all duration-300 hover:border-[#c9a896] hover:bg-[#f8f5f2]"
          >
            <Icon name="eye" size={16} />
          </button>
        </div>
      </div>

      {/* Hover Border */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-[#c9a896] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </article>
  );
};
