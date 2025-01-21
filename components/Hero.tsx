'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const carouselImages = [
  'DSC00811.jpg',
  'DSC01058.jpg',
  'DSC01260.jpg',
  'DSC01261.jpg',
  'DSC01270.jpg',
  'DSC01312.jpg',
  'DSC01810.jpg',
  'DSC01814.jpg',
  'DSC01824.jpg',
  'DSC01825.jpg',
  'DSC01831.jpg',
  'DSC01838.jpg',
  'DSC01845.jpg',
  'DSC01851.jpg',
  'DSC01853.jpg',
  'DSC01854.jpg',
  'DSC01855.jpg',
  'DSC01858.jpg',
  'DSC01879.jpg',
].map((filename) => ({
  src: `/images/hero/resized/${filename}`,
  alt: 'Pueblito Mexican Restaurant Gallery Image',
}));

const Hero = () => {
  const [shuffledImages, setShuffledImages] = useState(carouselImages);

  useEffect(() => {
    const shuffleArray = (array: typeof carouselImages) => {
      const [firstImage, ...restImages] = [...array];
      const shuffledRest = [...restImages];

      for (let i = shuffledRest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledRest[i], shuffledRest[j]] = [shuffledRest[j], shuffledRest[i]];
      }

      return [firstImage, ...shuffledRest];
    };

    setShuffledImages(shuffleArray(carouselImages));
  }, []);

  return (
    <motion.div className="w-full space-y-2">
      <div className="w-full bg-stone-50/60 py-4 backdrop-blur-sm">
        <div className="container mx-auto px-2">
          <h2 className="text-pretty text-center font-semibold text-sm text-stone-800 xl:text-base">
            A cherished part of the Northwest Arkansas community,{' '}
            <br className="tablet:block hidden lg:hidden" />
            we proudly serve authentic family recipes passed down through
            generations.
          </h2>
        </div>
      </div>

      <div className="flex w-full justify-center px-4">
        <div className="w-full max-w-[1600px]">
          <Carousel
            opts={{
              loop: true,
              align: 'center',
              skipSnaps: false,
              duration: 25,
              dragFree: true,
              inViewThreshold: 0.7,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
                rootNode: (emblaRoot) => emblaRoot.parentElement,
                playOnInit: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {shuffledImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[500px] w-full overflow-hidden rounded-xl shadow-lg transition-transform duration-300 md:h-[690px]">
                    <div className="absolute inset-0 z-10 bg-black/10" />
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      priority={index === 0 || index === 1}
                      loading={index <= 2 ? 'eager' : 'lazy'}
                      className="object-cover"
                      sizes="(max-width: 768px) 95vw, (max-width: 1600px) 85vw, 75vw"
                      placeholder="blur"
                      quality={100}
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHSIeHx8dIigjJCUmJSQkIiYoLC0sJiEoLSwvLzExLy8yMjIyMjIyMjIyMjL/2wBDARUXFyAeIB4gHiAeIiIgIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 z-20" />
            <CarouselNext className="right-4 z-20" />
          </Carousel>
        </div>
      </div>

      <div className="w-full bg-stone-50/60 py-4 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-2 md:px-8">
          <h3 className="text-pretty text-center font-light text-sm text-stone-700 md:text-base">
            Experience vibrant flavors, handcrafted beverages,
            <br className="md:hidden" /> and celebrate Mexican-American culture.
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

export default Hero;
