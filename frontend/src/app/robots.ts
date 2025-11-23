import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://narminehkhab.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
