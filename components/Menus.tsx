'use client';
import Loading from '@/app/loading';
import { Button } from '@/components/ui/button';
import {} from '@/components/ui/pagination';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useRestaurantHours } from '@/lib/hooks/useRestaurantHours';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { Suspense, useCallback, useEffect, useState } from 'react';
import {} from './ui/card';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from './ui/carousel';

const isDev = process.env.NODE_ENV === 'development';

type MenuItem = {
  name: string;
  mobileName?: string;
  images: string[];
  mobileOnly?: boolean;
};

const menuItems: MenuItem[] = [
  {
    name: 'Starters, Sides & Especialdades',
    mobileName: 'Starters & Sides',
    images: ['/images/menu/1.png'],
  },
  {
    name: 'Especialdades',
    mobileName: 'Especialdades',
    images: ['/images/menu/4.png'],
    mobileOnly: true,
  },
  {
    name: 'Platos',
    mobileName: 'Tacos, Burritos & Fajitas',
    images: ['/images/menu/2.png'],
  },
  {
    name: 'A La Parilla',
    mobileName: 'A La Parilla',
    images: ['/images/menu/3.png'],
    mobileOnly: true,
  },
  {
    name: 'Lunch, Combos & Kids',
    images: ['/images/menu/5.png', '/images/menu/6.png'],
  },
  {
    name: 'Deserts & Drinks',
    images: ['/images/menu/7.png'],
  },
];

// Desktop navigation mapping - single source of truth
const DESKTOP_NAV_MAPPING = {
  STARTERS: 0, // Image 1
  PLATOS: 2, // Images 2,3
  LUNCH: 4, // Images 4,5
  DESSERTS: 6, // Image 6
} as const;

type DesktopNavPosition =
  (typeof DESKTOP_NAV_MAPPING)[keyof typeof DESKTOP_NAV_MAPPING];

const getValidDesktopPosition = (page: number): DesktopNavPosition => {
  const positions = Object.values(DESKTOP_NAV_MAPPING);
  // Find the closest valid position, defaulting to first position if none found
  return positions.find((pos) => pos >= page) ?? positions[0];
};

const DESKTOP_SECTIONS: Record<number, number[]> = {
  0: [0], // Starters
  1: [2, 3], // Platos
  2: [4, 5], // Lunch
  3: [6], // Desserts
};

const getDesktopSection = (currentPage: number) => {
  for (const [section, pages] of Object.entries(DESKTOP_SECTIONS)) {
    if (pages.includes(currentPage)) {
      return Number(section);
    }
  }
  return 0;
};

const MenuCarouselItem = ({
  item,
  image,
  groupIndex,
  imageIndex,
  absoluteIndex,
  isMobile,
  forceLunch,
}: {
  item: MenuItem;
  image: string;
  groupIndex: number;
  imageIndex: number;
  absoluteIndex: number;
  currentPage: number;
  isMobile: boolean;
  forceLunch: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const isFirstImage = groupIndex === 0 && imageIndex === 0;
  const isLunchSection = item.name === 'Lunch, Combos & Kids';
  const shouldPrioritize =
    (isFirstImage && !forceLunch) || // First image when not in lunch mode
    (forceLunch && isLunchSection) || // Lunch images when in lunch mode
    (isMobile
      ? absoluteIndex === 0 // Only first image on mobile
      : absoluteIndex === 0 || absoluteIndex === 1); // First two images on desktop

  // Use useEffect to update client state after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <CarouselItem
      key={`${item.name}-${imageIndex}`}
      className={cn('basis-full', !isMobile && 'md:basis-1/2')}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="relative h-[75vh] w-full md:h-[85vh]"
      >
        <div className="absolute inset-0">
          {isClient && isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loading />
            </div>
          )}
          <Image
            src={image}
            alt={`${item.name} Menu ${imageIndex + 1}`}
            fill
            priority={shouldPrioritize}
            className={cn(
              'object-contain p-2',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </motion.div>
    </CarouselItem>
  );
};

export default function Component() {
  const [api, setApi] = useState<CarouselApi>();
  const [currentPage, setCurrentPage] = useState(0);
  const [forceLunch, setForceLunch] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const { isOpen } = useRestaurantHours();

  useEffect(() => {
    const checkLunchHours = () => {
      const now = new Date();
      const hour = now.getHours();
      const isLunchTime = hour >= 11 && hour < 15; // 11 AM to 3 PM
      setForceLunch(isOpen && isLunchTime);
    };

    checkLunchHours();
    const interval = setInterval(checkLunchHours, 60000); // Check every minute to see if it's lunch time yet

    return () => clearInterval(interval);
  }, [isOpen]);

  // Sync current page with lunch mode
  useEffect(() => {
    if (forceLunch && api) {
      const lunchIndex = menuItems.findIndex(
        (item) => item.name === 'Lunch, Combos & Kids'
      );
      let imageIndex = 0;
      for (let i = 0; i < lunchIndex; i++) {
        imageIndex += menuItems[i].images.length;
      }
      setCurrentPage(imageIndex);
    }
  }, [forceLunch, api]);

  useEffect(() => {
    if (!api) {
      return;
    }
    if (forceLunch) {
      const lunchIndex = menuItems.findIndex(
        (item) => item.name === 'Lunch, Combos & Kids'
      );
      let imageIndex = 0;
      for (let i = 0; i < lunchIndex; i++) {
        imageIndex += menuItems[i].images.length;
      }
      api.scrollTo(imageIndex);
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

  /**
   * Wrap prev/next click handlers in useCallback
   * to keep them stable across re-renders.
   */
  const handlePrevClick = useCallback(() => {
    if (!api) {
      return;
    }

    if (isMobile) {
      api.scrollTo(Math.max(0, currentPage - 1));
    } else {
      // Always move 2 at a time in desktop view
      const allImages = menuItems.flatMap((item) => item.images);
      const newPage = currentPage - 2;
      // Get the closest valid position
      const validPosition = getValidDesktopPosition(newPage);
      api.scrollTo(Math.min(Math.max(0, validPosition), allImages.length - 1));
    }
  }, [api, isMobile, currentPage]);

  const handleNextClick = useCallback(() => {
    if (!api) {
      return;
    }

    if (isMobile) {
      const maxPage = menuItems.flatMap((item) => item.images).length - 1;
      api.scrollTo(Math.min(maxPage, currentPage + 1));
    } else {
      // Always move 2 at a time in desktop view
      const allImages = menuItems.flatMap((item) => item.images);
      const newPage = currentPage + 2;
      // Get the closest valid position
      const validPosition = getValidDesktopPosition(newPage);
      api.scrollTo(Math.min(validPosition, allImages.length - 1));
    }
  }, [api, isMobile, currentPage]);

  // Desktop navigation helpers
  const handleDesktopArrowNav = useCallback(
    (direction: 'left' | 'right') => {
      if (!api) {
        return;
      }
      const currentSection = getDesktopSection(currentPage);
      const newSection =
        direction === 'left'
          ? Math.max(0, currentSection - 1)
          : Math.min(3, currentSection + 1);
      api.scrollTo(DESKTOP_SECTIONS[newSection][0]);
    },
    [api, currentPage]
  );

  const handleMobileArrowNav = useCallback(
    (direction: 'left' | 'right') => {
      if (!api) {
        return;
      }
      const maxPage = menuItems.flatMap((item) => item.images).length - 1;
      const newPage =
        direction === 'left'
          ? Math.max(0, currentPage - 1)
          : Math.min(maxPage, currentPage + 1);
      api.scrollTo(newPage);
    },
    [api, currentPage]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!api) {
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const direction = e.key === 'ArrowLeft' ? 'left' : 'right';
        isMobile
          ? handleMobileArrowNav(direction)
          : handleDesktopArrowNav(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [api, isMobile, handleMobileArrowNav, handleDesktopArrowNav]);

  const handleNavClick = (index: number) => {
    if (!api) {
      return;
    }

    if (isMobile) {
      // On mobile, count all items up to the index
      let imageIndex = 0;
      for (let i = 0; i < index; i++) {
        imageIndex += menuItems[i].images.length;
      }
      api.scrollTo(imageIndex);
    } else {
      // Map nav index to corresponding desktop position
      const positions = Object.values(
        DESKTOP_NAV_MAPPING
      ) as DesktopNavPosition[];
      api.scrollTo(positions[index] || positions[0]);
    }
  };

  const handleDotClick = (index: number) => {
    if (!api) {
      return;
    }
    if (isMobile) {
      api.scrollTo(index);
    } else {
      // On desktop, map dots to valid navigation points
      const positions = Object.values(
        DESKTOP_NAV_MAPPING
      ) as DesktopNavPosition[];
      const targetPage = positions[index] || positions[0];
      const allImages = menuItems.flatMap((item) => item.images);
      api.scrollTo(Math.min(targetPage, allImages.length - 1));
    }
  };

  // Calculate which nav item should be active
  const getMobileActiveNavIndex = (currentPage: number) => {
    const totalImages = menuItems.flatMap((item) => item.images);
    // Check if the last image is visible
    if (currentPage === totalImages.length - 1) {
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

  const getDesktopActiveNavIndex = (currentPage: number) => {
    const positions = Object.values(
      DESKTOP_NAV_MAPPING
    ) as DesktopNavPosition[];
    const allImages = menuItems.flatMap((item) => item.images);
    const lastPairStart = allImages.length - 2;

    // Always highlight Desserts & Drinks for the last pair
    if (currentPage >= lastPairStart) {
      return positions.length - 1;
    }

    // Find the current section based on page number
    const pairStartIndex = Math.floor(currentPage / 2) * 2;
    const index = positions.findIndex((pos) => pos === pairStartIndex);
    return index === -1 ? 0 : index;
  };

  const getActiveNavIndex = (currentPage: number) => {
    return isMobile
      ? getMobileActiveNavIndex(currentPage)
      : getDesktopActiveNavIndex(currentPage);
  };

  // Which pagination dot should be active
  const getActiveDotIndex = (currentPage: number) => {
    if (isMobile) {
      return currentPage;
    }

    const allImages = menuItems.flatMap((item) => item.images);
    const totalImages = allImages.length;
    const lastPairStart = totalImages - 2;

    if (currentPage >= lastPairStart) {
      return Math.ceil(totalImages / 2) - 1;
    }

    return Math.floor(currentPage / 2);
  };

  // Function to preload images
  const preloadImages = useCallback((indices: number[]) => {
    const allImages = menuItems.flatMap((item) => item.images);
    for (const index of indices) {
      if (index >= 0 && index < allImages.length) {
        const img = document.createElement('img');
        img.src = allImages[index];
      }
    }
  }, []);

  // Preload adjacent images when current page changes
  useEffect(() => {
    const allImages = menuItems.flatMap((item) => item.images);
    const preloadCount = isMobile ? 2 : 4; // Preload more images on desktop

    let indicesToPreload: number[];
    if (isMobile) {
      indicesToPreload = Array.from(
        { length: preloadCount },
        (_, i) => currentPage + i + 1
      );
    } else {
      // In desktop mode, preload the next two pairs
      const currentPair = Math.floor(currentPage / 2) * 2;
      indicesToPreload = [
        currentPair,
        currentPair + 1,
        currentPair + 2,
        currentPair + 3,
      ];
    }

    preloadImages(indicesToPreload.filter((i) => i < allImages.length));
  }, [currentPage, isMobile, preloadImages]);

  // Preload lunch images when in lunch mode
  useEffect(() => {
    if (forceLunch) {
      const lunchIndex = menuItems.findIndex(
        (item) => item.name === 'Lunch, Combos & Kids'
      );
      if (lunchIndex !== -1) {
        let imageIndex = 0;
        for (let i = 0; i < lunchIndex; i++) {
          imageIndex += menuItems[i].images.length;
        }
        const lunchImages = menuItems[lunchIndex].images;
        preloadImages(lunchImages.map((_, i) => imageIndex + i));
      }
    }
  }, [forceLunch, preloadImages]);

  const getButtonVariant = (isLunchTab: boolean, isActive: boolean) => {
    if (isLunchTab) {
      return undefined;
    }
    return isActive ? 'default' : 'ghost';
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
                  🌯 ¡Echar Lonche! 🌮
                </motion.span>
              </motion.div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={isMobile ? 'mobile' : 'desktop'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
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
                      'hover:bg-[#03502D]/10 hover:text-[#03502D] transition-all duration-300 ease-in-out px-2';
                    if (isLunchTab) {
                      buttonStyle = isActive
                        ? 'bg-yellow-500 text-black hover:bg-yellow-500 transition-all duration-300 ease-in-out px-2'
                        : 'bg-yellow-500/50 text-black hover:bg-yellow-500/70 active:bg-yellow-500/90 transition-all duration-300 ease-in-out px-2 rounded-md';
                    } else if (isActive) {
                      buttonStyle =
                        'bg-[#03502D] text-stone-50 hover:bg-[#03502D]/90 transition-all duration-300 ease-in-out px-2';
                    }

                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="w-full"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          if (getActiveNavIndex(currentPage) === index) {
                            // Shake animation if already selected
                            const element = document.getElementById(
                              `menu-btn-${index}`
                            );
                            if (element) {
                              element.animate(
                                [
                                  { transform: 'translateX(-2px)' },
                                  { transform: 'translateX(2px)' },
                                  { transform: 'translateX(-2px)' },
                                  { transform: 'translateX(0)' },
                                ],
                                {
                                  duration: 200,
                                  easing: 'ease-in-out',
                                }
                              );
                            }
                          } else {
                            handleNavClick(index);
                          }
                        }}
                      >
                        <Button
                          id={`menu-btn-${index}`}
                          variant={getButtonVariant(isLunchTab, isActive)}
                          className={cn(
                            'w-full whitespace-nowrap px-2 text-center text-xs md:text-sm',
                            buttonStyle
                          )}
                        >
                          {item.mobileName || item.name}
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
                  className="my-4 flex flex-wrap justify-center gap-2"
                >
                  {menuItems
                    .filter((item) => !item.mobileOnly)
                    .map((item, index) => {
                      const isActive = getActiveNavIndex(currentPage) === index;
                      const isLunchTab =
                        forceLunch && item.name === 'Lunch, Combos & Kids';

                      let buttonStyle =
                        'hover:bg-[#03502D]/10 hover:text-[#03502D] transition-all duration-300 ease-in-out px-2';
                      if (isLunchTab) {
                        buttonStyle = isActive
                          ? 'bg-yellow-500 text-black hover:bg-yellow-500 transition-all duration-300 ease-in-out px-2'
                          : 'bg-yellow-500/50 text-black hover:bg-yellow-500/70 active:bg-yellow-500/90 transition-all duration-300 ease-in-out px-2 rounded-md';
                      } else if (isActive) {
                        buttonStyle =
                          'bg-[#03502D] text-stone-50 hover:bg-[#03502D]/90 transition-all duration-300 ease-in-out px-2';
                      }

                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            if (getActiveNavIndex(currentPage) === index) {
                              // Shake animation if already selected
                              const element = document.getElementById(
                                `menu-btn-desktop-${index}`
                              );
                              if (element) {
                                element.animate(
                                  [
                                    { transform: 'translateX(-2px)' },
                                    { transform: 'translateX(2px)' },
                                    { transform: 'translateX(-2px)' },
                                    { transform: 'translateX(0)' },
                                  ],
                                  {
                                    duration: 200,
                                    easing: 'ease-in-out',
                                  }
                                );
                              }
                            } else {
                              handleNavClick(index);
                            }
                          }}
                        >
                          <Button
                            id={`menu-btn-desktop-${index}`}
                            variant={getButtonVariant(isLunchTab, isActive)}
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
                ...(isMobile
                  ? {
                      dragFree: false,
                    }
                  : {
                      dragFree: false,
                      skipSnaps: false,
                      containScroll: 'trimSnaps',
                    }),
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                <Suspense
                  fallback={
                    <div className="flex h-[85vh] w-full items-center justify-center">
                      <Loading />
                    </div>
                  }
                >
                  {menuItems.flatMap((item, groupIndex) =>
                    item.images.map((image, imageIndex) => {
                      const absoluteIndex =
                        menuItems
                          .slice(0, groupIndex)
                          .reduce((acc, curr) => acc + curr.images.length, 0) +
                        imageIndex;

                      return (
                        <MenuCarouselItem
                          key={`${item.name}-${imageIndex}`}
                          item={item}
                          image={image}
                          groupIndex={groupIndex}
                          imageIndex={imageIndex}
                          absoluteIndex={absoluteIndex}
                          currentPage={currentPage}
                          isMobile={isMobile}
                          forceLunch={forceLunch}
                        />
                      );
                    })
                  )}
                </Suspense>
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
          className="fixed right-4 bottom-4 z-50 rounded-full bg-[#03502D] px-4 py-2 text-sm text-stone-50 shadow-lg hover:opacity-90"
          onClick={() => setForceLunch(!forceLunch)}
        >
          {forceLunch ? 'Disable' : 'Enable'} Lunch Hours
        </button>
      )}
    </div>
  );
}
