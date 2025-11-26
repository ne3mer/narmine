import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';
import { ProductCard } from '@/components/cards/ProductCard';
import type { GameCardContent } from '@/data/home';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories/${slug}`, {
      next: { revalidate: 0 }
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    return null;
  }
}

async function getCategoryGames(slug: string, page: number = 1, sort: string = '-createdAt') {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/categories/${slug}/games?page=${page}&limit=20&sort=${sort}`,
      { next: { revalidate: 0 } }
    );
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    return null;
  }
}

const FALLBACK_COVER = 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp';

const mapBackendGameToCard = (game: any): GameCardContent => {
  // Ensure we have valid numbers for prices
  let basePrice = typeof game?.basePrice === 'number' ? game.basePrice : 0;
  let salePrice = typeof game?.salePrice === 'number' ? game.salePrice : undefined;
  
  // Determine if on sale
  let onSale = game?.onSale === true && salePrice !== undefined && salePrice < basePrice;

  // Check variants for better deals and price range
  let minPrice = basePrice;
  let hasMultiplePrices = false;
  const prices = new Set<number>([basePrice]);

  if (Array.isArray(game?.variants)) {
    for (const variant of game.variants) {
      if (typeof variant.price === 'number') {
        prices.add(variant.price);
        if (variant.price < minPrice) {
          minPrice = variant.price;
        }
      }

      if (variant.onSale && typeof variant.salePrice === 'number' && variant.salePrice < variant.price) {
        // If main product is not on sale, or this variant has a lower sale price
        if (!onSale || variant.salePrice < (salePrice || Infinity)) {
          onSale = true;
          salePrice = variant.salePrice;
          basePrice = variant.price;
        }
      }
    }
  }

  hasMultiplePrices = prices.size > 1;

  const fallbackId = game?._id?.toString() ?? game?.id ?? game?.slug ?? `game-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id: fallbackId,
    slug: game?.slug ?? game?._id?.toString() ?? '',
    title: game?.title ?? 'محصول نامشخص',
    platform: game?.platform ?? 'General',
    // Map basePrice to price for components that expect 'price'
    price: basePrice,
    basePrice: basePrice,
    salePrice: salePrice,
    finalPrice: onSale ? salePrice : basePrice,
    onSale: onSale,
    region: game?.region ?? 'Global',
    safe: true,
    monthlyPrice: 0,
    minPrice: minPrice,
    hasMultiplePrices: hasMultiplePrices,
    category: Array.isArray(game?.genre) && game.genre.length > 0
      ? String(game.genre[0]).toLowerCase()
      : 'general',
    rating: typeof game?.rating === 'number' ? game.rating : 0,
    cover: game?.coverUrl || game?.cover || FALLBACK_COVER,
    // Pass shipping info if available
    shipping: game?.shipping
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'دسته‌بندی یافت نشد',
    };
  }

  return {
    title: `${category.name} | خرید ${category.nameEn} از نرمینه خواب`,
    description: category.seoDescription || category.description || `خرید بهترین ${category.name} از نرمینه خواب با کیفیت عالی و ارسال فوری`,
    keywords: category.seoKeywords,
    openGraph: {
      title: category.name,
      description: category.seoDescription,
      images: category.imageUrl ? [category.imageUrl] : [],
      type: 'website',
    }
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page = '1', sort = '-createdAt' } = await searchParams;
  
  const category = await getCategory(slug);
  
  if (!category) {
    notFound();
  }

  const gamesData = await getCategoryGames(slug, parseInt(page), sort);
  const rawGames = gamesData?.games ?? [];
  const mappedGames: GameCardContent[] = rawGames.map(mapBackendGameToCard);
  const pagination = gamesData?.pagination;

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.seoDescription,
    url: `https://narminehkhab.ir/categories/${category.slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'خانه',
          item: 'https://narminehkhab.ir'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'دسته‌بندی‌ها',
          item: 'https://narminehkhab.ir/categories'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: category.name,
          item: `https://narminehkhab.ir/categories/${category.slug}`
        }
      ]
    },
    numberOfItems: rawGames.length,
    itemListElement: rawGames.map((game: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://narminehkhab.ir/products/${game.slug}`,
      name: game.title
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-600">خانه</Link>
          <Icon name="chevron-left" size={16} />
          <Link href="/categories" className="hover:text-emerald-600">دسته‌بندی‌ها</Link>
          <Icon name="chevron-left" size={16} />
          <span className="font-bold text-slate-900">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-right">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-50 text-6xl shadow-inner">
              {category.icon}
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-black text-slate-900 md:text-4xl">
                {category.name}
              </h1>
              <p className="text-lg text-slate-600">
                {category.description}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="rounded-2xl bg-slate-50 px-6 py-4 text-center">
                <div className="text-3xl font-black text-slate-900">{category.productCount}</div>
                <div className="text-sm text-slate-500">محصول موجود</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            نمایش {mappedGames.length} محصول از {pagination?.total || 0}
          </div>
          
          <div className="flex gap-2">
            <Link
              href={`/categories/${slug}?sort=-createdAt`}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                sort === '-createdAt' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              جدیدترین
            </Link>
            <Link
              href={`/categories/${slug}?sort=-productCount`} // Assuming we might sort by popularity later
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                sort === '-productCount' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              محبوب‌ترین
            </Link>
            <Link
              href={`/categories/${slug}?sort=basePrice`}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                sort === 'basePrice' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              ارزان‌ترین
            </Link>
          </div>
        </div>

        {/* Games Grid */}
        {mappedGames.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mappedGames.map((game) => (
              <ProductCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Icon name="package" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">محصولی یافت نشد</h3>
            <p className="mt-2 text-slate-500">در حال حاضر هیچ محصولی در این دسته‌بندی وجود ندارد.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/categories/${slug}?page=${p}&sort=${sort}`}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition ${
                  p === pagination.page
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
