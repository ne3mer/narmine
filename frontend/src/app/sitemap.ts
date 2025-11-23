import { MetadataRoute } from 'next';
import { API_BASE_URL } from '@/lib/api';

type BackendGame = {
  slug: string;
  updatedAt: string;
};

async function getGames(): Promise<BackendGame[]> {
  try {
    // Fetch all games, assuming pagination allows fetching a large number or we fetch first 100
    const response = await fetch(`${API_BASE_URL}/api/games?limit=1000`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching games for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const games = await getGames();
  const baseUrl = 'https://narminehkhab.com';

  const gameUrls = games.map((game) => ({
    url: `${baseUrl}/products/${game.slug}`,
    lastModified: new Date(game.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...gameUrls,
  ];
}
