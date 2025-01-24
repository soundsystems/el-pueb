"use client";

import { Button } from "@/components/ui/button";
import {} from "@/components/ui/pagination";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRestaurantHours } from "@/lib/hooks/useRestaurantHours";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import {} from "./ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";

const isDev = process.env.NODE_ENV === "development";

type MenuItem = {
  name: string;
  mobileName?: string;
  images: string[];
  mobileOnly?: boolean;
};

const menuItems: MenuItem[] = [
  {
    name: "Starters, Sides & Especialdades",
    mobileName: "Starters & Sides",
    images: ["/images/menu/1.png"],
  },
  {
    name: "Especialdades",
    mobileName: "Especialdades",
    images: ["/images/menu/4.png"],
    mobileOnly: true,
  },
  {
    name: "Platos",
    mobileName: "Tacos, Burritos & Fajitas",
    images: ["/images/menu/2.png"],
  },
  {
    name: "A La Parilla",
    mobileName: "A La Parilla",
    images: ["/images/menu/3.png"],
    mobileOnly: true,
  },
  {
    name: "Lunch, Combos & Kids",
    images: ["/images/menu/5.png", "/images/menu/6.png"],
  },
  {
    name: "Deserts & Drinks",
    images: ["/images/menu/7.png"],
  },
];

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
    const interval = setInterval(checkLunchHours, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isOpen]);

  // Sync current page with lunch mode
  useEffect(() => {
    if (forceLunch && api) {
      const lunchIndex = menuItems.findIndex(
        (item) => item.name === "Lunch, Combos & Kids"
      );
      let imageIndex = 0;
      for (let i = 0; i < lunchIndex; i++) {
        imageIndex += menuItems[i].images.length;
      }
      setCurrentPage(imageIndex);
    }
  }, [forceLunch, api]);

  useEffect(() => {
    if (!api) return;
    if (forceLunch) {
      const lunchIndex = menuItems.findIndex(
        (item) => item.name === "Lunch, Combos & Kids"
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
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!api) return;
    const handleSelect = () => {
      const current = api.selectedScrollSnap();
      setCurrentPage(current);
    };
    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  /**
   * Wrap your prev/next click handlers in useCallback
   * to keep them stable across re-renders.
   */
  const handlePrevClick = useCallback(() => {
    if (!api) return;

    if (isMobile) {
      api.scrollTo(Math.max(0, currentPage - 1));
    } else {
      // Always move 2 at a time in desktop view
      const allImages = menuItems.flatMap((item) => item.images);
      let newPage = currentPage - 2;
      // Ensure we land on even numbered pages
      if (newPage > 0 && newPage % 2 !== 0) {
        newPage--;
      }
      api.scrollTo(Math.max(0, newPage));
    }
  }, [api, isMobile, currentPage]);

  const handleNextClick = useCallback(() => {
    if (!api) return;

    if (isMobile) {
      const maxPage = menuItems.flatMap((item) => item.images).length - 1;
      api.scrollTo(Math.min(maxPage, currentPage + 1));
    } else {
      // Always move 2 at a time in desktop view
      const allImages = menuItems.flatMap((item) => item.images);
      let newPage = currentPage + 2;
      // Ensure we land on even numbered pages
      if (newPage < allImages.length && newPage % 2 !== 0) {
        newPage--;
      }
      api.scrollTo(Math.min(allImages.length - 2, newPage));
    }
  }, [api, isMobile, currentPage]);

  /**
   * Because handlePrevClick and handleNextClick are wrapped in useCallback,
   * this effect will always have the latest references to them.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!api) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isMobile) {
          api.scrollTo(Math.max(0, currentPage - 1));
        } else {
          // Desktop view - fixed pairs for navigation
          const pairs: Record<number, number[]> = {
            0: [0], // Starters
            1: [2, 3], // Platos
            2: [4, 5], // Lunch
            3: [6], // Desserts
          };
          // Find current section
          let currentSection = 0;
          for (const [section, pages] of Object.entries(pairs)) {
            if (pages.includes(currentPage)) {
              currentSection = Number(section);
              break;
            }
          }
          // Go to previous section's first page
          const prevSection = Math.max(0, currentSection - 1);
          api.scrollTo(pairs[prevSection][0]);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isMobile) {
          const maxPage = menuItems.flatMap((item) => item.images).length - 1;
          api.scrollTo(Math.min(maxPage, currentPage + 1));
        } else {
          // Desktop view - fixed pairs for navigation
          const pairs: Record<number, number[]> = {
            0: [0], // Starters
            1: [2, 3], // Platos
            2: [4, 5], // Lunch
            3: [6], // Desserts
          };
          // Find current section
          let currentSection = 0;
          for (const [section, pages] of Object.entries(pairs)) {
            if (pages.includes(currentPage)) {
              currentSection = Number(section);
              break;
            }
          }
          // Go to next section's first page
          const nextSection = Math.min(3, currentSection + 1);
          api.scrollTo(pairs[nextSection][0]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [api, isMobile, currentPage]);

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
      // On desktop, we need to map the non-mobile indices to the correct image pairs
      const desktopIndices: Record<number, number> = {
        0: 0, // Starters -> image 1
        1: 2, // Platos -> images 3,4
        2: 4, // Lunch -> images 5,6
        3: 6, // Desserts -> image 7
      };
      api.scrollTo(desktopIndices[index] || 0);
    }
  };

  const handleDotClick = (index: number) => {
    if (!api) {
      return;
    }
    if (isMobile) {
      api.scrollTo(index);
    } else {
      // Ensure we always land on even numbered pages in desktop
      api.scrollTo(index * 2);
    }
  };

  // Calculate which nav item should be active
  const getActiveNavIndex = (currentPage: number) => {
    if (isMobile) {
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
    }

    // Desktop view - map image pairs back to nav indices
    const imageToNavIndex: Record<number, number> = {
      0: 0, // Image 1 -> Starters
      2: 1, // Images 3,4 -> Platos
      4: 2, // Images 5,6 -> Lunch
      6: 3, // Image 7 -> Desserts
    };

    const allImages = menuItems.flatMap((item) => item.images);
    const lastPairStart = allImages.length - 2;

    if (currentPage >= lastPairStart) {
      return 3; // Always highlight "Desserts & Drinks" for the last pair
    }

    const pairStartIndex = Math.floor(currentPage / 2) * 2;
    return imageToNavIndex[pairStartIndex] || 0;
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={isMobile ? "mobile" : "desktop"}
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
                  initial={{ color: "#03502D" }}
                  animate={{
                    color: [
                      "#03502D",
                      "#FFD700",
                      "#03502D",
                      "#FFD700",
                      "#03502D",
                    ],
                  }}
                  transition={{
                    duration: 1.3,
                    ease: "easeInOut",
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
              key={isMobile ? "mobile" : "desktop"}
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
                      forceLunch && item.name === "Lunch, Combos & Kids";

                    let buttonStyle =
                      "hover:bg-[#03502D]/10 hover:text-[#03502D] transition-all duration-300 ease-in-out px-2";
                    if (isLunchTab) {
                      buttonStyle = isActive
                        ? "bg-yellow-500 text-black hover:bg-yellow-500 transition-all duration-300 ease-in-out px-2"
                        : "bg-yellow-500/50 text-black hover:bg-yellow-500/70 active:bg-yellow-500/90 transition-all duration-300 ease-in-out px-2 rounded-md";
                    } else if (isActive) {
                      buttonStyle =
                        "bg-[#03502D] text-stone-50 hover:bg-[#03502D]/90 transition-all duration-300 ease-in-out px-2";
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
                                  { transform: "translateX(-2px)" },
                                  { transform: "translateX(2px)" },
                                  { transform: "translateX(-2px)" },
                                  { transform: "translateX(0)" },
                                ],
                                {
                                  duration: 200,
                                  easing: "ease-in-out",
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
                          variant={
                            isLunchTab
                              ? undefined
                              : isActive
                              ? "default"
                              : "ghost"
                          }
                          className={cn(
                            "w-full whitespace-nowrap px-2 text-center text-xs md:text-sm",
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
                        forceLunch && item.name === "Lunch, Combos & Kids";

                      let buttonStyle =
                        "hover:bg-[#03502D]/10 hover:text-[#03502D] transition-all duration-300 ease-in-out px-2";
                      if (isLunchTab) {
                        buttonStyle = isActive
                          ? "bg-yellow-500 text-black hover:bg-yellow-500 transition-all duration-300 ease-in-out px-2"
                          : "bg-yellow-500/50 text-black hover:bg-yellow-500/70 active:bg-yellow-500/90 transition-all duration-300 ease-in-out px-2 rounded-md";
                      } else if (isActive) {
                        buttonStyle =
                          "bg-[#03502D] text-stone-50 hover:bg-[#03502D]/90 transition-all duration-300 ease-in-out px-2";
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
                                    { transform: "translateX(-2px)" },
                                    { transform: "translateX(2px)" },
                                    { transform: "translateX(-2px)" },
                                    { transform: "translateX(0)" },
                                  ],
                                  {
                                    duration: 200,
                                    easing: "ease-in-out",
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
                            variant={
                              isLunchTab
                                ? undefined
                                : isActive
                                ? "default"
                                : "ghost"
                            }
                            className={cn(
                              "whitespace-nowrap text-sm",
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
                align: "start",
                ...(isMobile
                  ? {}
                  : {
                      skipSnaps: true,
                      dragFree: true,
                    }),
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
                            priority={
                              (groupIndex === 0 && imageIndex === 0) ||
                              (isMobile
                                ? currentPage + 1 ===
                                  groupIndex * item.images.length + imageIndex
                                : Math.floor((currentPage + 1) / 2) ===
                                  groupIndex)
                            }
                            className="rounded-3xl object-contain p-2"
                            sizes="(max-width: 768px) 100vw, 50vw"
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
                      forceLunch &&
                      (isMobile ? i === 4 || i === 5 : i === 2);

                    return (
                      <PaginationItem key={i}>
                        <button
                          type="button"
                          className={cn(
                            "h-2 w-2 rounded-full transition-all hover:opacity-80",
                            {
                              "bg-[#03502D]":
                                getActiveDotIndex(currentPage) === i &&
                                !isLunchPage,
                              "bg-[#03502D]/20":
                                !isLunchPage &&
                                getActiveDotIndex(currentPage) !== i,
                              "bg-yellow-500":
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
          {forceLunch ? "Disable" : "Enable"} Lunch Hours
        </button>
      )}
    </div>
  );
}