/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              connect-src 'self' https://app.posthog.com https://t.posthog.com https://us.i.posthog.com https://us-assets.i.posthog.com https://vitals.vercel-insights.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.googleapis.com https://*.vercel-scripts.com https://*.vis.gl;
              img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com https://*.googleapis.com https://*.gstatic.com https://maps.googleapis.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.posthog.com https://us-assets.i.posthog.com https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://*.vercel-scripts.com https://*.googletagmanager.com https://*.vis.gl;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://*.vis.gl;
              font-src 'self' https://fonts.gstatic.com;
              worker-src 'self' blob:;
              frame-src 'self' https://maps.google.com https://*.googleapis.com https://*.vis.gl;
              child-src 'self' blob:;
            `
              .replace(/\s+/g, ' ')
              .trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
