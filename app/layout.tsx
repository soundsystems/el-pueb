import '../styles/globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistSans } from 'geist/font/sans';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense } from 'react';
import { SpinnerInfinity } from 'spinners-react';

export const metadata = {
  title: {
    default: 'El Pueblito',
    template: '%s | El Pueblito',
  },
  description:
    'Authentic Mexican Cuisine made fresh in the heart of Northwest Arkansas',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
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
      <body
        className={'h-screen w-screen bg-[#E4D5C3] pr-safe-right pl-safe-left'}
      >
        <Suspense fallback={<SpinnerInfinity />}>
          <Header />
          <main>
            <NuqsAdapter>{children}</NuqsAdapter>
          </main>
          <Footer />
        </Suspense>
        <Analytics />
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}
