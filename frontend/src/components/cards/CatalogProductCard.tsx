import Image from 'next/image';
import Link from 'next/link';
import { formatToman } from '@/lib/format';
import { resolveImageUrl } from '@/lib/api';
import type { GameCardContent } from '@/data/home';
import { Icon } from '@/components/icons/Icon';

interface Props {
  game: GameCardContent;
}

const InfoChip = ({ icon, label }: { icon: string; label: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e5ea] bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
    {icon}
    {label}
  </span>
);

export function CatalogProductCard({ game }: { game: GameCardContent }) {
  const tags =
    (game.tags && game.tags.length > 0
      ? game.tags
      : [`ریجن ${game.region || 'Global'}`, game.platform || 'PC']).slice(0, 3);

  const discountPercent = game.onSale && game.basePrice && (game.salePrice || game.price)
    ? Math.round(((game.basePrice - (game.salePrice || game.price)) / game.basePrice) * 100)
    : 0;

  return (
    <article className="group flex h-full w-full flex-col rounded-[32px] border border-[#e5e5ea] bg-white/95 p-5 shadow-[0_15px_50px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-1 hover:border-[#0a84ff]/20 hover:shadow-[0_30px_90px_rgba(15,23,42,0.15)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px]">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent z-10" />
        <Image
          src={resolveImageUrl(game.cover)}
          alt={game.title}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute left-4 top-4 z-20 flex gap-2 text-xs font-bold">
          <InfoChip icon="🎮" label={game.platform || 'PC'} />
          <InfoChip icon="🌍" label={game.region || 'Global'} />
        </div>
        {game.safe && (
          <span className="absolute right-4 top-4 z-20 rounded-full bg-gradient-to-r from-[#34c759] to-[#30d158] px-4 py-1 text-xs font-black text-white shadow-lg">
            SAFE
          </span>
        )}
        
        {/* Discount Badge */}
        {game.onSale && discountPercent > 0 && (
          <div className="absolute right-4 top-12 z-20 flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
            <Icon name="zap" size={14} className="fill-white" />
            <span>{discountPercent}%</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ژانر: {game.category}</span>
            {game.rating > 0 && (
              <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                <Icon name="star" size={12} className="text-amber-400" strokeWidth={0} />
                {game.rating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-slate-900 line-clamp-2">{game.title}</h3>
          {game.description && (
            <p className="text-sm text-slate-500 line-clamp-2">{game.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[#e5e5ea] bg-[#f5f5f7] px-3 py-1 font-semibold">
              {tag}
            </span>
          ))}
        </div>

        <div className="rounded-2xl border border-[#e5e5ea] bg-[#f7f8fb] p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500">شروع قیمت</p>
          <div className="flex items-baseline gap-1">
            {game.onSale ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400 line-through decoration-slate-400/50 decoration-2">
                    {formatToman(game.basePrice)}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-rose-600">
                    {formatToman(game.salePrice || game.price)}
                  </span>
                  <span className="text-sm font-medium text-rose-600/80">تومان</span>
                </div>
              </div>
            ) : (
              <>
                <span className="text-3xl font-black text-slate-900">{formatToman(game.price)}</span>
                <span className="text-sm font-medium text-slate-500">تومان</span>
              </>
            )}
          </div>
          {game.monthlyPrice && game.monthlyPrice > 0 && (
            <p className="text-xs text-slate-500">
              \u067e\u0631\u062f\u0627\u062e\u062a \u0645\u0627\u0647\u0627\u0646\u0647: {formatToman(game.monthlyPrice)} \u062a\u0648\u0645\u0627\u0646تومان
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href={`/products/${game.slug ?? game.id}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#0a84ff] py-3 text-sm font-black text-white transition hover:bg-[#0071e3]"
          >
            مشاهده و خرید
            <Icon name="arrow-left" size={16} className="text-white" />
          </Link>
          <button
            type="button"
            className="rounded-2xl border border-[#d1d1d6] bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-[#0a84ff]/40 hover:text-[#0a84ff]"
          >
            افزودن به مقایسه
          </button>
        </div>
      </div>
    </article>
  );
};
