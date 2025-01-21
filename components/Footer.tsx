'use client';

import { Facebook, Instagram, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import Subscribe from './Subscribe';

const Footer = () => {
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
                className="h-6 w-6 text-stone-950 transition-colors duration-200 ease-in-out group-hover:fill-[#F4EFE9] group-hover:text-[#F4EFE9]"
                fill="currentColor"
              />
            </a>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <a
              href="https://www.instagram.com/elpueblitomexicanrestaurant"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-50/70 backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-stone-950/90"
            >
              <Instagram className="h-6 w-6 text-stone-950 transition-colors duration-200 ease-in-out group-hover:text-[#F4EFE9]" />
            </a>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <a
              href="mailto:hola@elpueblitonwa.com"
              className="group flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-50/70 backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-stone-950/90"
            >
              <Mail className="h-6 w-6 text-stone-950 transition-colors duration-200 ease-in-out group-hover:text-[#F4EFE9]" />
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
