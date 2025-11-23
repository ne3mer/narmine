'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CompactProductCard, type CompactProduct } from '@/components/cards/CompactProductCard';
import { API_BASE_URL } from '@/lib/api';
import type { GameCardContent } from '@/data/home';

type BackendGame = {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;
  safeAccountAvailable: boolean;
  coverUrl?: string;
  tags: string[];
  productType?: string;
};

const mapBackendGameToCard = (game: BackendGame): GameCardContent => ({
  id: game.id,
  slug: game.slug,
  title: game.title,
  platform: game.platform || 'PC', // Default to PC if undefined
  price: game.basePrice, // Keeping 'price' for compatibility if GameCardContent still expects it
  basePrice: game.basePrice,
  finalPrice: game.basePrice,
  monthlyPrice: Math.round(game.basePrice * 0.3),
  region: game.regionOptions?.[0] ?? 'Global',
  safe: game.safeAccountAvailable,
  category: game.genre?.[0] ?? 'general',
  rating: 4.5, // Changed from 0 to 4.5 as per instruction
  cover: game.coverUrl || '', // Changed default cover as per instruction
  coverUrl: game.coverUrl || '', // Added coverUrl as per instruction
  description: game.description, // Added description as per instruction
  productType: game.productType as any
});

export const PopularProductsSection = () => {
  const [games, setGames] = useState<GameCardContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/games`);
        if (!response.ok) throw new Error('خطا در دریافت محصولات');
        
        const data = await response.json();
        const backendGames: BackendGame[] = data.data || [];
        const mappedGames = backendGames.map(mapBackendGameToCard);
        setGames(mappedGames);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری محصولات');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#0a84ff]">پرفروش‌های این هفته</p>
          <h2 className="text-2xl font-black text-slate-900">محصولات محبوب نرمینه خواب</h2>
        </div>
        <LinkButton href="/products?sort=popular">مشاهده همه</LinkButton>
      </div>
      
      {loading && (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] h-96 rounded-3xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      )}
      
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center">
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      )}
      
      {!loading && !error && games.length === 0 && (
        <div className="rounded-2xl bg-slate-100 border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-600">هنوز محصولی اضافه نشده است.</p>
          <p className="text-xs text-slate-500 mt-2">از پنل ادمین محصولات جدید اضافه کنید.</p>
        </div>
      )}
      
      {!loading && !error && games.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {games.slice(0, 4).map((game) => (
            <CompactProductCard
              key={game.id}
              product={{
                id: game.id,
                slug: game.slug || game.id,
                cover: game.cover,
                price: game.price,
                platform: game.platform || 'PC',
                title: game.title,
                tag: 'Popular',
                productType: game.productType
              } satisfies CompactProduct}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const LinkButton = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="inline-flex items-center gap-2 rounded-2xl border border-[#d1d1d6] px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#0a84ff]/40 hover:text-[#0a84ff]"
  >
    {children}
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </Link>
);
