'use client';

import { AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
