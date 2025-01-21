'use client';

import { AnimatePresence } from 'motion/react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import type { ReactNode } from 'react';

// Check if the environment is not development
if (process.env.NODE_ENV !== 'development') {
  posthog.init(`${process.env.NEXT_PUBLIC_POSTHOG_API_KEY}`, {
    autocapture: true,
    capture_pageview: true,
  });
} else {
  // Reset PostHog in development mode
  posthog.reset();
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}

// const theme = {
//   colors: {
//     primary: '#0c0a09', // stone-950
//     background: {
//       light: '##E3D6C3',
//       dark: '#0c0a09',
//     },
//   },
// };
