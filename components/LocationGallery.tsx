'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { motion } from 'motion/react';
import Image from 'next/image';

interface LocationGalleryProps {
  locationName: string;
  description: string;
  address: string;
  mapUrl: string;
}

const PLACEHOLDER_IMAGES = Array(6).fill('/logo.png');

export default function LocationGallery({
  locationName,
  description,
  address,
  mapUrl,
}: LocationGalleryProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <motion.h1
        className="mb-6 text-center font-bold text-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {locationName}
      </motion.h1>

      <motion.p
        className="mb-8 text-center text-gray-700 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {description}
      </motion.p>

      <div className="relative px-8">
        <Carousel opts={{ loop: true }} className="mb-8 w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {PLACEHOLDER_IMAGES.map((image, index) => (
              <CarouselItem
                key={index}
                className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3"
              >
                <Card className="border-none">
                  <CardContent className="p-2">
                    <motion.div
                      className="relative aspect-square overflow-hidden rounded-xl bg-white"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Image
                        src={image}
                        alt={`${locationName} gallery image ${index + 1}`}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </motion.div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="-left-4 -translate-y-1/2 absolute top-1/2">
            <CarouselPrevious className="bg-white" />
          </div>
          <div className="-right-4 -translate-y-1/2 absolute top-1/2">
            <CarouselNext className="bg-white" />
          </div>
        </Carousel>
      </div>

      <motion.div
        className="overflow-hidden rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <iframe
          src={mapUrl}
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
          title={`Map showing location of ${locationName}`}
        />
      </motion.div>

      <motion.p
        className="mt-4 text-center text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {address}
      </motion.p>
    </div>
  );
}
