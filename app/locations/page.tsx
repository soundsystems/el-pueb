'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

const locations = [
  {
    name: 'Bella Vista',
    address: 'Highway 279 and Lancashire, Bella Vista, AR 72715',
    phone: '+1-479-855-2324',
    slug: 'bella-vista',
  },
  {
    name: 'Highfill',
    address: '708 NW Highfill St Gentry, AR 72734',
    phone: '+1-479-525-6034',
    slug: 'highfill',
  },
  {
    name: 'Prairie Creek',
    address: '14340 AR-12, Rogers, AR 72756',
    phone: '+1-479-372-6275',
    slug: 'prairie-creek',
  },
  {
    name: 'Centerton',
    address: '300 E Centerton Blvd, Centerton, AR 72719',
    phone: '+1-479-224-4820',
    slug: 'centerton',
  },
];

export default function LocationsPage() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <motion.h1
        className="mb-6 text-center font-black text-2xl text-zinc-900 md:mb-8 md:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        Our Locations
      </motion.h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLargeScreen ? 'desktop-grid' : 'mobile-grid'}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid gap-4 md:gap-8 lg:grid-cols-2"
        >
          {locations.map((location, index) => (
            <motion.div
              key={location.slug}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                layout: springTransition,
                opacity: { duration: 0.2 },
              }}
              className="mx-auto w-full max-w-[800px]"
            >
              <Link
                href={`/locations/${location.slug}`}
                className="group block h-[160px] md:h-[200px]"
              >
                <motion.div
                  layout
                  transition={{ layout: springTransition }}
                  className="relative flex h-full w-full overflow-hidden rounded-xl bg-zinc-50/70 shadow-lg shadow-zinc-950/75 backdrop-blur-sm transition-all duration-300 hover:shadow-xl group-hover:bg-zinc-950/90"
                >
                  <motion.div
                    layout
                    transition={{ layout: springTransition }}
                    className="relative flex h-full w-[140px] flex-shrink-0 items-center justify-center p-4 md:w-[200px]"
                  >
                    <div className="relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full bg-[#D8C4A1] p-2 md:h-[140px] md:w-[140px]">
                      <Image
                        src="/logo.png"
                        alt={`${location.name} location`}
                        width={120}
                        height={120}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    layout
                    transition={{ layout: springTransition }}
                    className="flex flex-1 flex-col justify-between p-4 md:p-6"
                  >
                    <div>
                      <motion.h2
                        layout
                        transition={{ layout: springTransition }}
                        className="mb-1 font-black text-xl text-zinc-900 transition-colors duration-300 group-hover:text-orange-50 md:mb-2 md:text-2xl"
                      >
                        {location.name}
                      </motion.h2>
                      <motion.div
                        layout
                        transition={{ layout: springTransition }}
                        className="flex items-start gap-1 text-zinc-600 transition-colors duration-300 group-hover:text-zinc-300 md:gap-2"
                      >
                        <MapPin className="mt-1 h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
                        <p className="text-xs md:text-sm">{location.address}</p>
                      </motion.div>
                      <motion.p
                        layout
                        transition={{ layout: springTransition }}
                        className="mt-1 font-bold text-xs text-zinc-900 transition-colors duration-300 group-hover:text-orange-50 md:text-sm"
                      >
                        {location.phone}
                      </motion.p>
                    </div>
                    <motion.div
                      layout
                      transition={{ layout: springTransition }}
                      className="mt-2 md:mt-4"
                    >
                      <span className="font-medium text-xs text-zinc-900 transition-colors duration-300 group-hover:text-orange-50 md:text-sm">
                        View Details →
                      </span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
