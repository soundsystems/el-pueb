import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false, // Enforce type checks during builds
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              connect-src 'self' https://app.posthog.com https://t.posthog.com https://us.i.posthog.com https://vitals.vercel-insights.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.googleapis.com https://*.vercel-scripts.com;
              img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://*.googleapis.com https://*.gstatic.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.posthog.com https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://*.vercel-scripts.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              worker-src 'self' blob:;
              frame-src 'self' https://maps.google.com https://*.googleapis.com;
            `
              .replace(/\s+/g, ' ')
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
