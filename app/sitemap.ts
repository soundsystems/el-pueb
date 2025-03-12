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

  // Define QR tracked routes
  const locations = ['bella-vista', 'highfill', 'prairie-creek', 'centerton'];
  const sources = ['bar', 'table'];
  const qrRoutes = locations.flatMap((location) =>
    sources.map((source) => ({
      url: `${baseUrl}/locations/${location}?source=${source}&amp;location=${location}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  return [...staticRoutes, ...qrRoutes];
}
