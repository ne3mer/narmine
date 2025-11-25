import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import GameDetailClient, { BackendGame } from './GameDetailClient';
import { API_BASE_URL } from '@/lib/api';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getGame(slug: string): Promise<BackendGame | null> {
  try {
    const decodedSlug = decodeURIComponent(slug);
    const response = await fetch(`${API_BASE_URL}/api/games/${decodedSlug}`, {
      next: { revalidate: 0 }, // Disable caching for immediate updates
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching game:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    return {
      title: 'محصول پیدا نشد | نرمینه خواب',
      description: 'متاسفانه محصول مورد نظر شما یافت نشد.',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const coverUrl = game.coverUrl || 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp';

  return {
    title: `${game.title} | فروشگاه کالای خواب نرمینه`,
    description: game.description.substring(0, 160),
    keywords: [...game.tags, game.platform, 'خرید کالای خواب', 'روتختی', 'بالش', 'پتو', game.title],
    openGraph: {
      title: `${game.title} | نرمینه خواب`,
      description: game.description,
      url: `https://narmineh.local/products/${slug}`,
      siteName: 'Narmineh Khab',
      images: [
        {
          url: coverUrl,
          width: 800,
          height: 600,
          alt: game.title,
        },
        ...previousImages,
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: game.title,
      description: game.description,
      images: [coverUrl],
    },
    alternates: {
      canonical: `https://narmineh.local/products/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    notFound();
  }

  // JSON-LD Structured Data for Product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: game.title,
    image: game.coverUrl ? [game.coverUrl] : [],
    description: game.description,
    sku: game.id,
    brand: {
      '@type': 'Brand',
      name: game.publisher || 'Narmineh',
    },
    offers: {
      '@type': 'Offer',
      url: `https://narmineh.local/products/${slug}`,
      priceCurrency: 'IRT',
      price: game.onSale && game.salePrice ? game.salePrice : game.basePrice,
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: game.rating ? {
      '@type': 'AggregateRating',
      ratingValue: game.rating,
      reviewCount: 10, // Placeholder if actual count is not available in initial fetch
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GameDetailClient game={game} />
    </>
  );
}
