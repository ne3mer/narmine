import Link from 'next/link';
import Image from 'next/image';

export type CategoryHighlight = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  productCount?: number;
  showOnHome?: boolean;
};

type Props = {
  categories: CategoryHighlight[];
};

export const CategoriesSection = ({ categories }: Props) => {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 w-fit">
          <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider text-pink-700">دسته‌بندی‌ها</p>
        </div>
        <h2 className="text-3xl font-black text-slate-900">محصول مورد علاقه خود را پیدا کنید</h2>
        <p className="text-slate-600">دسته‌بندی و پیشنهادهای سریع برای هر سلیقه</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category, index) => {
          const href = category.slug ? `/categories/${category.slug}` : '/categories';
          const accents = [
            { gradient: 'from-pink-500/5 to-rose-500/5', border: 'border-pink-100', hover: 'hover:border-pink-300', iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
            { gradient: 'from-purple-500/5 to-indigo-500/5', border: 'border-purple-100', hover: 'hover:border-purple-300', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
            { gradient: 'from-amber-500/5 to-orange-500/5', border: 'border-amber-100', hover: 'hover:border-amber-300', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
            { gradient: 'from-teal-500/5 to-emerald-500/5', border: 'border-teal-100', hover: 'hover:border-teal-300', iconBg: 'bg-teal-50', iconColor: 'text-teal-600' }
          ];
          const accent = accents[index % accents.length];
          return (
          <article
            key={category.id}
            className={`group flex flex-col justify-between rounded-[2rem] border ${accent.border} bg-white/60 backdrop-blur-sm p-6 shadow-lg shadow-slate-200/50 transition-all ${accent.hover} hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.iconBg} ${accent.iconColor} text-2xl shadow-sm transition-transform group-hover:scale-110`}>
                  {category.icon || '🛏️'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{category.name}</h3>
                  {typeof category.productCount === 'number' && (
                    <p className="text-xs font-medium text-slate-500">{category.productCount} محصول</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{category.description || 'انتخاب‌های منتخب برای این دسته.'}</p>
              {category.imageUrl && (
                <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-white/50 bg-white/50 shadow-inner">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                </div>
              )}
            </div>
            <div className="mt-6">
              <Link
                href={href}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-pink-200 hover:text-pink-600 hover:shadow-md"
              >
                مشاهده محصولات
                <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        );
        })}
      </div>
    </section>
  );
};
