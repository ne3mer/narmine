import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { formatToman, toPersianDigits } from '@/lib/format';
import type { ProductCardContent } from '@/data/home';

interface CollectibleCardProps {
  product: ProductCardContent;
}

export function CollectibleCard({ product }: CollectibleCardProps) {
  const isOutOfStock = product.inventory?.status === 'out_of_stock';
  const discountPercent = product.onSale && product.basePrice && (product.salePrice || product.finalPrice)
    ? Math.round(((product.basePrice - (product.salePrice || product.finalPrice)) / product.basePrice) * 100)
    : (product.basePrice > product.finalPrice 
      ? Math.round(((product.basePrice - product.finalPrice) / product.basePrice) * 100)
      : 0);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative block h-full overflow-hidden rounded-[32px] bg-white transition-all hover:shadow-2xl hover:shadow-purple-500/10"
    >
      {/* Image Area - Large & Clean */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-50">
        {product.coverUrl ? (
          <Image
            src={product.coverUrl}
            alt={product.title}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon name="image" size={48} className="text-slate-300" />
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

        {/* Top Badges */}
        <div className="absolute left-4 top-4 flex gap-2">
          {product.productType === 'action_figure' && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 backdrop-blur-md">
              Action Figure
            </span>
          )}
          {discountPercent > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
              <Icon name="zap" size={14} className="fill-white" />
              <span>{toPersianDigits(discountPercent)}%</span>
            </div>
          )}
          {product.inventory?.status === 'low_stock' && (
            <span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-900 backdrop-blur-md">
              موجودی محدود
            </span>
          )}
        </div>

        {/* Bottom Content - Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="mb-2 text-xl font-black leading-tight drop-shadow-md">
            {product.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {discountPercent > 0 && (
                <span className="text-sm text-white/70 line-through decoration-rose-500/80 decoration-2">
                  {formatToman(product.basePrice)}
                </span>
              )}
              <span className={`text-2xl font-black drop-shadow-md ${discountPercent > 0 ? 'text-rose-400' : 'text-white'}`}>
                {formatToman(product.salePrice || product.finalPrice)}
                <span className="mr-1 text-sm font-normal text-white/80">تومان</span>
              </span>
            </div>

            <div className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md transition-all ${
              isOutOfStock 
                ? 'bg-slate-800/80 text-slate-400' 
                : 'bg-white/20 text-white hover:bg-white hover:text-purple-600'
            }`}>
              <Icon name={isOutOfStock ? 'bell' : 'shopping-bag'} size={20} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
