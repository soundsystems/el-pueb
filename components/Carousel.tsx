'use client';

import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ImageCarouselProps {
  images: {
    src: string;
    alt: string;
  }[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl shadow-lg">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl"
        >
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            fill
            priority
            className="rounded-xl object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 rounded-xl bg-black/20" />
      <Button
        variant="ghost"
        size="icon"
        className="-translate-y-1/2 absolute top-1/2 left-4 text-white"
        onClick={() =>
          setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
        }
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="-translate-y-1/2 absolute top-1/2 right-4 text-white"
        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </div>
  );
}
