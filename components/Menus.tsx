'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useQueryState } from 'nuqs';
import { Suspense, useEffect, useState } from 'react';
import { SpinnerInfinity } from 'spinners-react';
import { Card, CardContent } from './ui/card';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from './ui/carousel';

const menuItems = [
  { name: 'Lunch', image: '/brunch-menu.jpeg' },
  { name: 'Dinner', image: '/menu.jpeg' },
] as const;

function getCurrentMenu() {
  const now = new Date();
  const hours = now.getHours();

  if (hours >= 11 && hours < 16) {
    return 'brunch';
  }
  if (hours >= 16 && hours < 21) {
    return 'lunch';
  }
  return 'lunch';
}

function MenuImage({ item }: { item: (typeof menuItems)[number] }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <SpinnerInfinity
            size={50}
            thickness={148}
            speed={140}
            color="rgba(172, 148, 123, 1)"
            secondaryColor="rgba(57, 31, 17, 1)"
          />
        </div>
      }
    >
      <motion.div
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        <Image
          src={item.image}
          alt={`${item.name} Menu`}
          fill
          sizes="(max-width: 773px) 100vw, 50vw"
          className="rounded-md bg-adobe object-contain"
          priority
        />
      </motion.div>
    </Suspense>
  );
}

export default function Component() {
  const [api, setApi] = useState<CarouselApi>();
  const [tab, setTab] = useQueryState('tab', {
    defaultValue: getCurrentMenu(),
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!api) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        api.scrollPrev();
      } else if (e.key === 'ArrowRight') {
        api.scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [api]);

  useEffect((): (() => void) => {
    if (!api) {
      return () => undefined;
    }

    const currentItem =
      menuItems.find((item) => item.name.toLowerCase() === tab.toLowerCase()) ??
      menuItems[1];

    const index = menuItems.indexOf(currentItem);
    api.scrollTo(index);

    const onSelect = () => {
      const selectedItem = menuItems[api.selectedScrollSnap()];
      setTab(selectedItem.name.toLowerCase());
    };

    api.on('select', onSelect);
    return () => api.off('select', onSelect);
  }, [api, tab, setTab]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="relative mb-4">
        <div className="relative flex justify-center space-x-2">
          {menuItems.map((item, index) => {
            const itemTab = item.name.toLowerCase();
            const isActive = tab.toLowerCase() === itemTab;

            return (
              <button
                type="button"
                key={item.name}
                className={cn(
                  'relative z-10 rounded-full px-4 py-2 font-medium text-xs transition-all duration-300 ease-in-out md:text-sm',
                  isActive
                    ? 'bg-[#03502D] text-white'
                    : 'text-[#03502D] hover:bg-[#03502D]/10'
                )}
                onClick={() => {
                  setTab(itemTab);
                  api?.scrollTo(index);
                }}
              >
                <motion.span
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-20"
                >
                  {item.name}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {menuItems.map((item) => (
            <CarouselItem key={item.name}>
              <Card>
                <CardContent className="flex aspect-[3/4] items-center justify-center p-2">
                  <MenuImage item={item} />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
