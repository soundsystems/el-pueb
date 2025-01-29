import '../styles/globals.css';
import Banner from '@/components/Banner';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import SelectionColorInitializer from '@/components/SelectionColorInitializer';
import { LoadingSpinner } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense } from 'react';
import type { Organization, Restaurant, WithContext } from 'schema-dts';
import { CSPostHogProvider } from './providers';

type MultiLocationOrganization = Organization & {
  '@graph': Restaurant[];
};

const jsonLd: WithContext<MultiLocationOrganization> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'El Pueblito Mexican Restaurant',
  description:
    'Authentic Mexican Cuisine made fresh in the heart of Northwest Arkansas',
  url: 'https://elpueblitonwa.com',
  logo: 'https://elpueblitonwa.com/images/hero/resized/DSC00811.jpg',
  '@graph': [
    {
      '@type': 'Restaurant',
      name: 'El Pueblito Mexican Restaurant - Bella Vista',
      description:
        'Authentic Mexican Cuisine made fresh in the heart of Northwest Arkansas',
      image: 'https://elpueblitonwa.com/images/hero/resized/DSC00811.jpg',
      servesCuisine: 'Mexican',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1707 Forest Hills Blvd',
        addressLocality: 'Bella Vista',
        addressRegion: 'AR',
        postalCode: '72715',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 36.4659829,
        longitude: -94.2997737,
      },
      telephone: '+1-479-855-2324',
      url: 'https://elpueblitonwa.com/locations/bella-vista',
      openingHours: [
        'Mo-Th 11:00-21:00',
        'Fr-Sa 11:00-22:00',
        'Su 11:00-21:00',
      ],
    },
    {
      '@type': 'Restaurant',
      name: 'El Pueblito Mexican Restaurant - Highfill',
      description:
        'Authentic Mexican Cuisine made fresh in the heart of Northwest Arkansas',
      image: 'https://elpueblitonwa.com/images/hero/resized/DSC00811.jpg',
      servesCuisine: 'Mexican',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '708 NW Highfill St',
        addressLocality: 'Gentry',
        addressRegion: 'AR',
        postalCode: '72734',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 36.2619322,
        longitude: -94.3498537,
      },
      telephone: '+1-479-525-6034',
      url: 'https://elpueblitonwa.com/locations/highfill',
      openingHours: [
        'Mo-Th 11:00-21:00',
        'Fr-Sa 11:00-22:00',
        'Su 11:00-21:00',
      ],
    },
    {
      '@type': 'Restaurant',
      name: 'El Pueblito Mexican Restaurant - Prairie Creek',
      description:
        'Authentic Mexican Cuisine made fresh in the heart of Northwest Arkansas',
      image: 'https://elpueblitonwa.com/images/hero/resized/DSC00811.jpg',
      servesCuisine: 'Mexican',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '14340 AR-12',
        addressLocality: 'Rogers',
        addressRegion: 'AR',
        postalCode: '72756',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 36.3404949,
        longitude: -94.0650799,
      },
      telephone: '+1-479-372-6275',
      url: 'https://elpueblitonwa.com/locations/prairie-creek',
      openingHours: [
        'Mo-Th 11:00-21:00',
        'Fr-Sa 11:00-22:00',
        'Su 11:00-21:00',
      ],
    },
    {
      '@type': 'Restaurant',
      name: 'El Pueblito Mexican Restaurant - Centerton',
      description:
        'Authentic Mexican Cuisine made fresh in the heart of Northwest Arkansas',
      image: 'https://elpueblitonwa.com/images/hero/resized/DSC00811.jpg',
      servesCuisine: 'Mexican',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '300 E Centerton Blvd',
        addressLocality: 'Centerton',
        addressRegion: 'AR',
        postalCode: '72719',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 36.3592987,
        longitude: -94.2822265,
      },
      telephone: '+1-479-224-4820',
      url: 'https://elpueblitonwa.com/locations/centerton',
      openingHours: [
        'Mo-Th 11:00-21:00',
        'Fr-Sa 11:00-22:00',
        'Su 11:00-21:00',
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'El Pueblito',
    template: '%s | El Pueblito',
  },
  description:
    'Authentic Mexican Cuisine made fresh in the heart of Northwest Arkansas',
  metadataBase: new URL('https://elpueblitonwa.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://elpueblitonwa.com',
    title: 'El Pueblito',
    description:
      'Authentic Mexican Cuisine made fresh in the heart of Northwest Arkansas',
    siteName: 'El Pueblito',
    images: [
      {
        url: '/images/hero/resized/DSC00811.jpg',
        width: 1600,
        height: 900,
        alt: 'El Pueblito Mexican Restaurant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Pueblito',
    description:
      'Authentic Mexican Cuisine made fresh in the heart of Northwest Arkansas',
    images: ['/images/hero/resized/DSC00811.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png' }],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: This is the recommended approach in Next.js docs for JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <CSPostHogProvider>
        <body
          className={cn(
            'min-h-screen w-full bg-[#E4D5C3] pr-safe-right pl-safe-left font-sans antialiased',
            GeistSans.variable
          )}
        >
          <SelectionColorInitializer />
          <Banner />
          <Header />
          <main>
            <Suspense
              fallback={
                <div className="flex min-h-[500px] w-full items-center justify-center md:min-h-[690px]">
                  <LoadingSpinner size={80} />
                </div>
              }
            >
              <NuqsAdapter>{children}</NuqsAdapter>
            </Suspense>
          </main>
          <Footer />
          <SpeedInsights />
          <GoogleAnalytics gaId="G-JKSWQ70B8Z" />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
