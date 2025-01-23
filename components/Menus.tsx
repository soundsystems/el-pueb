'use client';

import { Button } from '@/components/ui/button';
import {} from '@/components/ui/pagination';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {} from './ui/card';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from './ui/carousel';

const isDev = process.env.NODE_ENV === 'development';

const menuItems = [
  {
    name: 'Starters, Sides & Especialdades',
    images: ['/images/menu/1.png', '/images/menu/4.png'],
  },
  { name: 'Plates', images: ['/images/menu/2.png', '/images/menu/3.png'] },
  {
    name: 'Lunch, Combos & Kids',
    images: ['/images/menu/5.png', '/images/menu/6.png'],
  },
  { name: 'Deserts & Drinks', images: ['/images/menu/7.png'] },
] as const;

export default function Component() {
  const [api, setApi] = useState<CarouselApi>();
  const [currentPage, setCurrentPage] = useState(0);
  const [forceLunch, setForceLunch] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (!api) {
      return;
    }
    if (forceLunch) {
      api.scrollTo(4);
    }
  }, [api, forceLunch]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }
    const handleSelect = () => {
      const current = api.selectedScrollSnap();
      setCurrentPage(current);
    };
    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  const handleNavClick = (index: number) => {
    if (!api) {
      return;
    }
    const targetSlide = index * 2;
    api.scrollTo(targetSlide);
  };

  const handlePrevClick = () => {
    if (!api) {
      return;
    }
    const step = isMobile ? 1 : 2;
    api.scrollTo(Math.max(0, currentPage - step));
  };

  const handleNextClick = () => {
    if (!api) {
      return;
    }
    const step = isMobile ? 1 : 2;
    const maxPage =
      menuItems.flatMap((item) => item.images).length - (isMobile ? 1 : 2);
    api.scrollTo(Math.min(maxPage, currentPage + step));
  };

  const handleDotClick = (index: number) => {
    if (!api) {
      return;
    }
    const targetPage = isMobile ? index : index * 2;
    api.scrollTo(targetPage);
  };

  // Calculate which nav item should be active
  const getActiveNavIndex = (currentPage: number) => {
    const totalImages = menuItems.flatMap((item) => item.images);
    // Check if the last image is visible (either directly or as part of a pair)
    if (!isMobile && currentPage >= totalImages.length - 2) {
      return menuItems.length - 1;
    }
    if (isMobile && currentPage === totalImages.length - 1) {
      return menuItems.length - 1;
    }

    let imageCount = 0;
    for (let i = 0; i < menuItems.length; i++) {
      if (
        currentPage >= imageCount &&
        currentPage < imageCount + menuItems[i].images.length
      ) {
        return i;
      }
      imageCount += menuItems[i].images.length;
    }
    return 0;
  };

  // Helper to determine which pagination dot should be active
  const getActiveDotIndex = (currentPage: number) => {
    if (isMobile) {
      return currentPage;
    }

    const totalImages = menuItems.flatMap((item) => item.images);
    // Check if the last image is visible
    if (currentPage >= totalImages.length - 2) {
      return Math.ceil(totalImages.length / 2) - 1;
    }
    return Math.floor(currentPage / 2);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={isMobile ? 'mobile' : 'desktop'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {forceLunch && (
            <div className="relative text-center">
              <motion.div
                className="font-bold text-3xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.span
                  initial={{ color: '#03502D' }}
                  animate={{
                    color: [
                      '#03502D',
                      '#FFD700',
                      '#03502D',
                      '#FFD700',
                      '#03502D',
                    ],
                  }}
                  transition={{
                    duration: 1.3,
                    ease: 'easeInOut',
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }}
                  className="italic"
                >
                  ¡Echar Lonche! 🌮
                </motion.span>
              </motion.div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={isMobile ? 'mobile-nav' : 'desktop-nav'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobile ? (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="my-4 grid grid-cols-2 gap-2"
                >
                  {menuItems.map((item, index) => {
                    const isActive = getActiveNavIndex(currentPage) === index;
                    const isLunchTab =
                      forceLunch && item.name === 'Lunch, Combos & Kids';

                    let buttonStyle =
                      'hover:bg-[#03502D]/10 hover:text-[#03502D] transition-colors';
                    if (isLunchTab) {
                      buttonStyle =
                        'bg-yellow-500 text-black hover:bg-yellow-500/90 transition-colors';
                    } else if (isActive) {
                      buttonStyle =
                        'bg-[#03502D] text-white hover:bg-[#03502D]/90 transition-colors';
                    }

                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="w-full"
                      >
                        <Button
                          onClick={() => handleNavClick(index)}
                          variant={isActive ? 'default' : 'ghost'}
                          className={cn(
                            'w-full whitespace-nowrap text-center text-xs',
                            buttonStyle
                          )}
                        >
                          {item.name}
                        </Button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="my-4 flex justify-center gap-2"
                >
                  {menuItems.map((item, index) => {
                    const isActive = getActiveNavIndex(currentPage) === index;
                    const isLunchTab =
                      forceLunch && item.name === 'Lunch, Combos & Kids';

                    let buttonStyle =
                      'hover:bg-[#03502D]/10 hover:text-[#03502D] transition-colors';
                    if (isLunchTab) {
                      buttonStyle =
                        'bg-yellow-500 text-black hover:bg-yellow-500/90 transition-colors';
                    } else if (isActive) {
                      buttonStyle =
                        'bg-[#03502D] text-white hover:bg-[#03502D]/90 transition-colors';
                    }

                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Button
                          onClick={() => handleNavClick(index)}
                          variant={isActive ? 'default' : 'ghost'}
                          className={cn(
                            'whitespace-nowrap text-sm',
                            buttonStyle
                          )}
                        >
                          {item.name}
                        </Button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          <motion.div layout>
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: 'start',
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {menuItems.flatMap((item, groupIndex) =>
                  item.images.map((image, imageIndex) => (
                    <CarouselItem
                      key={`${item.name}-${imageIndex}`}
                      className="pl-2 md:basis-1/2 md:pl-4"
                    >
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-[75vh] w-full md:h-[85vh]"
                      >
                        <div className="absolute inset-0 rounded-3xl bg-adobe">
                          <Image
                            src={image}
                            alt={`${item.name} Menu ${imageIndex + 1}`}
                            fill
                            priority={groupIndex === 0 && imageIndex === 0}
                            className="rounded-3xl object-contain p-2"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            loading={
                              groupIndex === 0 && imageIndex === 0
                                ? 'eager'
                                : 'lazy'
                            }
                          />
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))
                )}
              </CarouselContent>
            </Carousel>
          </motion.div>

          <motion.div layout>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PaginationPrevious
                        className="h-8 w-8 cursor-pointer p-0 hover:bg-[#03502D]/10 hover:text-[#03502D]"
                        onClick={handlePrevClick}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </PaginationPrevious>
                    </motion.div>
                  </PaginationItem>

                  {Array.from({
                    length: isMobile
                      ? menuItems.flatMap((item) => item.images).length
                      : Math.ceil(
                          menuItems.flatMap((item) => item.images).length / 2
                        ),
                  }).map((_, i) => {
                    const isLunchPage =
                      forceLunch && (isMobile ? i === 4 || i === 5 : i === 2);

                    return (
                      <PaginationItem key={i}>
                        <button
                          type="button"
                          className={cn(
                            'h-2 w-2 rounded-full transition-all hover:opacity-80',
                            {
                              'bg-[#03502D]':
                                getActiveDotIndex(currentPage) === i &&
                                !isLunchPage,
                              'bg-[#03502D]/20':
                                !isLunchPage &&
                                getActiveDotIndex(currentPage) !== i,
                              'bg-yellow-500':
                                forceLunch &&
                                ((isMobile && (i === 4 || i === 5)) ||
                                  (!isMobile && i === 2)),
                            }
                          )}
                          onClick={() => handleDotClick(i)}
                          aria-label={`Go to page ${i + 1}`}
                        />
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PaginationNext
                        className="h-8 w-8 cursor-pointer p-0 hover:bg-[#03502D]/10 hover:text-[#03502D]"
                        onClick={handleNextClick}
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </PaginationNext>
                    </motion.div>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {isDev && (
        <button
          type="button"
          className="fixed right-4 bottom-4 z-50 rounded-full bg-[#03502D] px-4 py-2 text-sm text-white shadow-lg hover:opacity-90"
          onClick={() => setForceLunch(!forceLunch)}
        >
          {forceLunch ? 'Disable' : 'Enable'} Lunch Hours
        </button>
      )}
    </div>
  );
}
