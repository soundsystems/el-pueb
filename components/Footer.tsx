'use client';

import { CONFETTI_COLORS } from '@/lib/constants/colors';
import { Facebook, Instagram, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import Subscribe from './Subscribe';

const Footer = () => {
  // Get 3 unique random colors from our confetti colors array
  // Since we shuffle first and then slice, we're guaranteed to get different colors
  const socialIconColors = useMemo(() => {
    return [...CONFETTI_COLORS].sort(() => Math.random() - 0.5).slice(0, 3);
  }, []);

  return (
    <footer className="sticky mt-6 pb-6">
      <div className="mx-auto flex flex-col items-center">
        <div className="-mb-4 w-fit text-pretty rounded-xl bg-stone-950 p-2 text-center text-stone-50 text-xs lg:text-sm">
          Subscribe below ⬇️ to stay in the loop 🌮
        </div>
        <Subscribe />
      </div>
      <div className="flex justify-center px-6 pb-safe-area-inset-bottom md:px-20">
        <motion.div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <a
              href="https://www.facebook.com/profile.php?id=100063517664462"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-50/70 backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-stone-950/90"
            >
              <Facebook
                className="h-6 w-6 stroke-stone-950 text-stone-950 transition-colors duration-200 ease-in-out group-hover:stroke-current"
                style={{ fill: 'currentColor' }}
                fill="currentColor"
              />
              <style>{`
                .group:hover .group-hover\\:stroke-current:first-child {
                  fill: ${socialIconColors[0]} !important;
                  stroke: ${socialIconColors[0]} !important;
                }
              `}</style>
            </a>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <a
              href="https://www.instagram.com/elpueblitomexicanrestaurant"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-50/70 backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-stone-950/90"
            >
              <Instagram className="h-6 w-6 stroke-stone-950 text-stone-950 transition-colors duration-200 ease-in-out group-hover:fill-stone-950-ig" />
              <style>{`
                .group:hover .group-hover\\:fill-stone-950-ig {
                  fill: #0c0a09 !important;
                  stroke: ${socialIconColors[1]} !important;
                }
              `}</style>
            </a>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <a
              href="mailto:hola@elpueblitonwa.com"
              className="group flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-50/70 backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-stone-950/90"
            >
              <Mail className="h-6 w-6 stroke-stone-950 text-stone-950 transition-colors duration-200 ease-in-out group-hover:fill-stone-950-mail" />
              <style>{`
                .group:hover .group-hover\\:fill-stone-950-mail {
                  fill: #0c0a09 !important;
                  stroke: ${socialIconColors[2]} !important;
                }
              `}</style>
            </a>
          </motion.div>
        </motion.div>
      </div>
      <p className="pt-4 text-center text-xs">
        © {new Date().getFullYear()} El Pueblito
      </p>
    </footer>
  );
};

export default Footer;
