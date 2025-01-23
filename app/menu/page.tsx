'use client';
import Menus from '@/components/Menus';
import { AnimatePresence, motion } from 'motion/react';

export default function HomePage() {
  return (
    <AnimatePresence mode="wait">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.section
          id="menu"
          className="flex h-full flex-col items-center pb-2 lg:pb-6"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Menus />
        </motion.section>
      </motion.main>
    </AnimatePresence>
  );
}
