/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    // Enable faster refresh
    optimizePackageImports: [
      "@heroicons/react",
      "lucide-react",
      "framer-motion",
    ],
    // Faster builds
    webVitalsAttribution: ["CLS", "LCP"],
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization
  images: {
    // Enable modern image formats
    formats: ["image/webp", "image/avif"],
    // Optimize image loading
    minimumCacheTTL: 60,
    // Enable image optimization
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Build optimizations (swcMinify is now default and deprecated)

  // External packages configuration - exclude prettier since we use biome
  serverExternalPackages: [],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              connect-src 'self' https://app.posthog.com https://t.posthog.com https://us.i.posthog.com https://us-assets.i.posthog.com https://vitals.vercel-insights.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.vercel-scripts.com https://*.vis.gl;
              img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com https://*.googleapis.com https://*.gstatic.com https://maps.googleapis.com https://images.unsplash.com https://*.cdninstagram.com https://*.fbcdn.net;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.posthog.com https://us-assets.i.posthog.com https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://*.vercel-scripts.com https://*.googletagmanager.com https://*.vis.gl;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://*.vis.gl;
              font-src 'self' https://fonts.gstatic.com;
              worker-src 'self' blob:;
              frame-src 'self' https://maps.google.com https://*.googleapis.com https://*.vis.gl;
              child-src 'self' blob:;
            `
              .replace(/\s+/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
