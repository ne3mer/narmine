'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';
import { MinimalProductCard } from '@/components/products/MinimalProductCard';
import { ProductFilters, type FilterState } from '@/components/products/ProductFilters';

type BackendGame = {
  id: string;
  slug: string;
  title: string;
  description: string;
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;
  salePrice?: number;
  onSale?: boolean;
  coverUrl?: string;
  productType?: string;
  rating?: number;
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
  price: game.onSale && game.salePrice ? game.salePrice : game.basePrice,
  cover: game.coverUrl || '',
  rating: game.rating || 4.5,
});

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useSearchParams();
  const router = useRouter();

  const fetchProducts = useCallback(async (filters: FilterState) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.category) searchParams.set('genre', filters.category); // Assuming genre maps to category slug
      if (filters.sort) searchParams.set('sort', filters.sort);
      
      // Note: Backend might need updates to support min/max price and onSale filters if not already present
      // For now, we'll handle what we can via existing API params or add them if supported
      
      const queryString = searchParams.toString();
      const url = queryString 
        ? `${API_BASE_URL}/api/games?${queryString}`
        : `${API_BASE_URL}/api/games`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load products');
      const payload = await response.json();
      let backendGames: BackendGame[] = payload?.data ?? [];

      // Client-side filtering for features not yet in API (optional, but good for immediate feedback)
      if (filters.onSale) {
        backendGames = backendGames.filter(g => g.onSale);
      }
      if (filters.minPrice > 0 || filters.maxPrice < 50000000) {
        backendGames = backendGames.filter(g => {
          const price = g.onSale && g.salePrice ? g.salePrice : g.basePrice;
          return price >= filters.minPrice && price <= filters.maxPrice;
        });
      }

      setProducts(backendGames.map(mapGame));
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load based on URL params
  useEffect(() => {
    const initialFilters: FilterState = {
      search: params?.get('q') || '',
      category: params?.get('category') || '',
      minPrice: 0,
      maxPrice: 50000000,
      sort: '-createdAt',
      onSale: false
    };
    fetchProducts(initialFilters);
  }, [params, fetchProducts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white">
      {/* Hero Section */}
      <div className="bg-white px-6 pt-16 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="mb-3 font-serif text-5xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              محصولات نرمینه خواب
            </h1>
            <p className="text-lg text-[#4a3f3a]/60">
              بهترین کالاهای خواب با کیفیت برتر
            </p>
          </div>

          {/* New Creative Filters */}
          <ProductFilters 
            initialFilters={{
              search: params?.get('q') || '',
              category: params?.get('category') || ''
            }}
            onFilterChange={fetchProducts}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-6 pb-16">
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
                  router.push('/products');
                  // Reset filters logic would go here if we lifted state up further
                }}
                className="rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                مشاهده همه محصولات
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between px-2">
                <p className="text-[#4a3f3a]/60 font-medium">
                  {products.length} محصول یافت شد
                </p>
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
