import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://elpueblitonwa.com';

  // Define all static routes
  const staticRoutes = ['', '/menu', '/about', '/contact', '/locations'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    })
  );

  // Define location pages
  const locationRoutes = [
    '/locations/bentonville',
    '/locations/bella-vista',
    '/locations/highfill',
    '/locations/prairie-creek',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...locationRoutes];
}
