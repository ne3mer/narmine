'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatToman } from '@/lib/format';
import { Icon } from '@/components/icons/Icon';
import type { CompactProduct } from '@/types/admin';

type CompactProductCardProps = {
  product: CompactProduct;
};

export const CompactProductCard = ({ product }: CompactProductCardProps) => {
  const productSlug = product.slug ?? product.id ?? product._id;

  return (
    <Link
      href={`/products/${productSlug}`}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-[#c9a896]/20 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#c9a896]/10"
    >
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#f8f5f2]">
        <Image
          src={product.coverUrl || '/images/placeholder.jpg'}
          alt={product.title}
          fill
          sizes="96px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="mb-1 text-sm font-semibold text-[#4a3f3a] line-clamp-2 leading-snug">
            {product.title}
          </h3>
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#4a3f3a]/60">
              <Icon name="star" size={12} className="text-amber-500" strokeWidth={0} />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-base font-bold text-[#4a3f3a]">
            {formatToman(product.salePrice || product.basePrice)}
          </span>
          <span className="text-xs text-[#4a3f3a]/60">تومان</span>
        </div>
      </div>
    </Link>
  );
};
