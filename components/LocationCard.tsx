import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

type Location = {
  name: string;
  address: string;
  phone: string;
  slug: string;
  hours: {
    weekdays: string;
    weekend: string;
  };
};

const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

export const LocationCard = ({
  location,
  selectedLocation,
  setSelectedLocation,
  markerColor,
}: {
  location: Location;
  selectedLocation: string | null;
  setSelectedLocation: (slug: string | null) => void;
  markerColor: string;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{
      layout: springTransition,
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    }}
    className="mx-auto w-full max-w-[800px]"
  >
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        layout: springTransition,
        scale: { type: 'spring', stiffness: 300, damping: 25 },
      }}
      className={`relative flex h-full w-full cursor-pointer overflow-hidden rounded-xl bg-stone-50/70 shadow-lg shadow-stone-950/75 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${selectedLocation === location.slug ? 'bg-stone-950/90' : ''}`}
      onClick={() =>
        setSelectedLocation(
          selectedLocation === location.slug ? null : location.slug
        )
      }
      style={{ '--marker-color': markerColor } as React.CSSProperties}
    >
      <motion.div
        layout
        transition={{ layout: springTransition }}
        className="flex flex-1 flex-col justify-between p-4 md:p-6"
      >
        <div>
          <motion.h2
            layout
            transition={{ layout: springTransition }}
            className={`mb-1 font-black text-xl md:mb-2 md:text-2xl ${selectedLocation === location.slug ? 'text-stone-50' : 'text-stone-900'}`}
          >
            {location.name}
          </motion.h2>
          <motion.div
            layout
            transition={{ layout: springTransition }}
            className={`flex items-start gap-1 md:gap-2 ${
              selectedLocation === location.slug
                ? 'text-stone-300'
                : 'text-stone-600'
            }`}
          >
            <MapPin className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `El Pueblito ${location.name} ${location.address}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold text-xs transition-all duration-300 md:text-sm xl:text-md ${
                selectedLocation === location.slug
                  ? 'text-[color:var(--marker-color)] hover:brightness-75 md:text-stone-50 md:hover:text-[color:var(--marker-color)] md:hover:brightness-100'
                  : 'text-stone-600 hover:text-[color:var(--marker-color)]'
              }`}
            >
              {location.address}
            </Link>
          </motion.div>
          <motion.div
            layout
            transition={{ layout: springTransition }}
            className="mt-2 flex flex-col gap-0.5 text-[11px] md:text-xs"
            style={{
              color: selectedLocation === location.slug ? '#FFFFFF' : '#000000',
              transition: 'color 0.3s ease',
            }}
          >
            <div>• {location.hours.weekdays}</div>
            <div>• {location.hours.weekend}</div>
          </motion.div>
        </div>
        <motion.div
          layout
          transition={{ layout: springTransition }}
          className="mt-auto"
        >
          <Link href={`tel:${location.phone}`}>
            <motion.p
              layout
              transition={{ layout: springTransition }}
              className={`mt-1 font-bold text-xs decoration-[2px] transition-all duration-300 md:text-sm ${
                selectedLocation === location.slug
                  ? 'text-stone-50 underline'
                  : 'text-stone-900 no-underline hover:underline'
              } hover:text-[color:var(--marker-color)]`}
              style={{ textDecorationColor: markerColor }}
            >
              {location.phone}
            </motion.p>
          </Link>
        </motion.div>
      </motion.div>
      <motion.div
        layout
        transition={{ layout: springTransition }}
        className="relative flex h-full w-[140px] flex-shrink-0 items-center justify-center p-4 md:w-[280px]"
      >
        <div className="relative h-[120px] w-full overflow-hidden rounded-xl md:h-[180px]">
          <Image
            src={`/images/locations/${location.slug}.jpg`}
            alt={`${location.name} location`}
            width={1600}
            height={900}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </motion.div>
    </motion.div>
  </motion.div>
);
