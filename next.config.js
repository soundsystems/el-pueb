/** @type {import('next').NextConfig} */
const nextConfig = {
  headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.posthog.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' https://app.posthog.com https://*.posthog.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
