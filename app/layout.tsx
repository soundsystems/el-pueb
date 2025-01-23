import '../styles/globals.css';
import Banner from '@/components/Banner';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import SelectionColorInitializer from '@/components/SelectionColorInitializer';
import { cn } from '@/lib/utils';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { CSPostHogProvider } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'El Pueblito',
    template: '%s | El Pueblito',
  },
  description:
    'Authentic Mexican Cuisine made fresh in the heart of Northwest Arkansas',
  robots: {
    index: true, // Allow this page to be indexed by search engines
    follow: true, // Allow crawlers to follow links on this page
    nocache: false, // Allow Google to cache the page (helps with faster loading)
    googleBot: {
      index: true, // Specifically tell Googlebot to index the page
      follow: true, // Allow Googlebot to follow links
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
  verification: {
    google: '',
    /*   yandex: 'yandex',
  yahoo: 'yahoo',
  other: {
    me: ['my-email', 'my-link'],
  }, */
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <head />
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
            <NuqsAdapter>{children}</NuqsAdapter>
          </main>
          <Footer />
          <SpeedInsights />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
