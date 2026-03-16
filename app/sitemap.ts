import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://elpueblitonwa.com";

  // Define all static routes (match app routes: page, menu, locations, privacy, contact)
  const staticRoutes = ["", "/menu", "/locations", "/privacy", "/contact"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.9,
    })
  );

  // Define QR tracked routes
  const locations = ["bella-vista", "highfill", "rogers", "centerton"];
  const qrRoutes = locations.flatMap((location) => [
    {
      url: `${baseUrl}/?source=table&location=${location}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/menu?source=bar&location=${location}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]);

  return [...staticRoutes, ...qrRoutes];
}
