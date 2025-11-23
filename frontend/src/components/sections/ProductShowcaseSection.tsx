import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { ProductCard } from '@/components/cards/ProductCard';
import { GearCard } from '@/components/cards/GearCard';
import { CollectibleCard } from '@/components/cards/CollectibleCard';
import type { ProductCardContent } from '@/data/home';

interface ProductShowcaseSectionProps {
  title: string;
  subtitle?: string;
  products: ProductCardContent[];
  href?: string;
  type?: 'grid' | 'carousel'; // For future expansion
}

export function ProductShowcaseSection({ title, subtitle, products, href }: ProductShowcaseSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl">{title}</h2>
          {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="group flex items-center gap-2 text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
          >
            <span>مشاهده همه</span>
            <Icon name="arrow-left" size={16} className="transition-transform group-hover:-translate-x-1" />
          </Link>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          // Dynamic Component Selection
          if (product.productType === 'gaming_gear') {
            return <GearCard key={product.id} product={product} />;
          }
          if (product.productType === 'action_figure' || product.productType === 'collectible_card') {
            return <CollectibleCard key={product.id} product={product} />;
          }
          // Default fallback
          return <ProductCard key={product.id} game={product} />;
        })}
      </div>
    </section>
  );
}
