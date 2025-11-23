'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';
import { MinimalProductCard } from '@/components/products/MinimalProductCard';

type BackendGame = {
  id: string;
  slug: string;
  title: string;
  description: string;
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;
  safeAccountAvailable: boolean;
  coverUrl?: string;
  productType?: string;
};

type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
  cover: string;
  rating?: number;
};

const mapGame = (game: BackendGame): Product => ({
  id: game.id,
  slug: game.slug,
  title: game.title,
  price: game.basePrice,
  cover: game.coverUrl || '',
  rating: 4.5,
});

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams();
        const search = params?.get('q');
        if (search) searchParams.set('search', search);
        
        const queryString = searchParams.toString();
        const url = queryString 
          ? `${API_BASE_URL}/api/games?${queryString}`
          : `${API_BASE_URL}/api/games`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load products');
        const payload = await response.json();
        const backendGames: BackendGame[] = payload?.data ?? [];
        setProducts(backendGames.map(mapGame));
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [params]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white">
      {/* Hero Section */}
      <div className="border-b border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="mb-3 font-serif text-5xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              محصولات نرمینه خواب
            </h1>
            <p className="text-lg text-[#4a3f3a]/60">
              بهترین کالاهای خواب با کیفیت برتر
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی محصولات..."
                className="w-full rounded-full border border-[#c9a896]/30 bg-white px-6 py-4 pr-14 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a896]"
              >
                <Icon name="search" size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f8f5f2] border-t-[#c9a896]"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f8f5f2]">
                <Icon name="search" size={40} className="text-[#c9a896]" />
              </div>
              <h2 className="mb-3 font-serif text-2xl font-bold text-[#4a3f3a]">
                محصولی یافت نشد
              </h2>
              <p className="mb-6 text-[#4a3f3a]/60">
                متأسفانه محصولی با این مشخصات پیدا نشد.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  router.push('/products');
                }}
                className="rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                مشاهده همه محصولات
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <p className="text-[#4a3f3a]/60">
                  {products.length} محصول یافت شد
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#4a3f3a]/60">مرتب‌سازی:</span>
                  <select className="rounded-full border border-[#c9a896]/30 bg-white px-4 py-2 text-sm text-[#4a3f3a] focus:border-[#c9a896] focus:outline-none">
                    <option>جدیدترین</option>
                    <option>ارزان‌ترین</option>
                    <option>گران‌ترین</option>
                    <option>محبوب‌ترین</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <MinimalProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    cover={product.cover}
                    price={product.price}
                    slug={product.slug}
                    rating={product.rating}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f8f5f2] border-t-[#c9a896]"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
