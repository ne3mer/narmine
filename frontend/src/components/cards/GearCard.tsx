import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { formatToman } from '@/lib/format';
import type { ProductCardContent } from '@/data/home';

interface GearCardProps {
  product: ProductCardContent;
}

export function GearCard({ product }: GearCardProps) {
  const isOutOfStock = product.inventory?.status === 'out_of_stock';
  const discountPercent = product.onSale && product.basePrice && (product.salePrice || product.finalPrice)
    ? Math.round(((product.basePrice - (product.salePrice || product.finalPrice)) / product.basePrice) * 100)
    : (product.basePrice > product.finalPrice 
      ? Math.round(((product.basePrice - product.finalPrice) / product.basePrice) * 100)
      : 0);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative block h-full overflow-hidden rounded-2xl bg-slate-900 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20"
    >
      {/* Tech Grid Background Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-800">
        {product.coverUrl ? (
          <Image
            src={product.coverUrl}
            alt={product.title}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon name="cpu" size={48} className="text-slate-700" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isOutOfStock ? (
            <span className="rounded bg-rose-500/90 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              ناموجود
            </span>
          ) : (
            <>
              {discountPercent > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg animate-pulse">
                  <Icon name="zap" size={12} className="fill-white" />
                  <span>{discountPercent}%</span>
                </div>
              )}
              {product.shipping?.freeShipping && (
                <span className="rounded bg-blue-500/90 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                  ارسال رایگان
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative p-4">
        {/* Title & Category */}
        <div className="mb-3">
          <p className="mb-1 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            {product.productType === 'gaming_gear' ? 'تجهیزات گیمینگ' : 'سخت‌افزار'}
          </p>
          <h3 className="line-clamp-2 text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Specs Preview (if available in customFields) */}
        {product.customFields && (
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(product.customFields).slice(0, 2).map(([key, value]) => (
              <span key={key} className="rounded border border-slate-700 bg-slate-800/50 px-2 py-1 text-[10px] text-slate-300">
                {String(value)}
              </span>
            ))}
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-end justify-between border-t border-slate-800 pt-4">
          <div>
            {discountPercent > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 line-through decoration-rose-500/50">
                  {formatToman(product.basePrice)}
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-black ${discountPercent > 0 ? 'text-rose-500' : 'text-white'}`}>
                {formatToman(product.salePrice || product.finalPrice)}
              </span>
              <span className="text-xs font-normal text-slate-400">تومان</span>
            </div>
          </div>
          
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            isOutOfStock 
              ? 'bg-slate-800 text-slate-600' 
              : 'bg-emerald-500 text-white group-hover:bg-emerald-400'
          }`}>
            <Icon name={isOutOfStock ? 'bell' : 'plus'} size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
}
