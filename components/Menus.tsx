"use client";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m as motion,
  useReducedMotion,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useSyncExternalStore,
} from "react";
import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { useRestaurantHours } from "@/lib/hooks/useRestaurantHours";
import { cn } from "@/lib/utils";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";

const isDev = process.env.NODE_ENV === "development";

interface MenuItem {
  name: string;
  mobileName?: string;
  images: string[];
  mobileOnly?: boolean;
}

interface MenuButtonState {
  isActive: boolean;
  isDotmTab: boolean;
  isLunchTab: boolean;
  isMargaritasTab: boolean;
}

interface MenusState {
  currentPage: number;
  forceLunch: boolean;
  hasNavigatedToLunch: boolean;
  highlightTarget: boolean;
}

type MenusAction =
  | { type: "mark_navigated" }
  | { type: "set_current_page"; page: number }
  | { type: "set_force_lunch"; value: boolean }
  | { type: "set_highlight_target"; value: boolean }
  | { type: "sync_force_lunch_navigation"; page: number };

const DOTM_CURRENT_IMAGE = "/images/menu/DOTM-Feb.png";
const DOTM_SPECIALS_IMAGE = "/images/menu/drink-specials.png";

const menuItems: MenuItem[] = [
  {
    name: "DOTM & Happy Hour",
    mobileName: "DOTM",
    images: [DOTM_CURRENT_IMAGE, DOTM_SPECIALS_IMAGE],
  },
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
  {
    name: "Margaritas & More",
    mobileName: "Margaritas",
    images: [
      "/images/menu/drinks-menu3.png",
      "/images/menu/drinks-menu4.png",
      "/images/menu/drinks-menu5.png",
      "/images/menu/drinks-menu6.png",
    ],
  },
];

const DESKTOP_NAV_POSITIONS = [0, 2, 4, 6, 8, 9] as const;
const DESKTOP_DOT_POSITIONS = [0, 2, 4, 6, 8, 9, 11] as const;
const DESKTOP_MARGARITAS_START = 9;
const DESKTOP_MARGARITAS_END = 12;

function subscribeToViewport(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getViewportSnapshot() {
  return window.innerWidth < 1024;
}

function getMenuButtonStyle({
  isActive,
  isDotmTab,
  isLunchTab,
  isMargaritasTab,
}: MenuButtonState) {
  if (isLunchTab) {
    return isActive
      ? "bg-yellow-500 px-2 text-black transition-colors duration-300 ease-in-out hover:bg-yellow-500"
      : "rounded-md bg-yellow-500/50 px-2 text-black transition-colors duration-300 ease-in-out hover:bg-yellow-500/70 active:bg-yellow-500/90";
  }

  if (isMargaritasTab || isDotmTab) {
    return isActive
      ? "bg-[#1DB2B2] px-2 text-white transition-colors duration-300 ease-in-out hover:bg-[#1DB2B2]/90"
      : "px-2 transition-colors duration-300 ease-in-out hover:bg-[#1DB2B2]/10 hover:text-[#1DB2B2]";
  }

  if (isActive) {
    return "bg-[#03502D] px-2 text-stone-50 transition-colors duration-300 ease-in-out hover:bg-[#03502D]/90";
  }

  return "px-2 transition-colors duration-300 ease-in-out hover:bg-[#03502D]/10 hover:text-[#03502D]";
}

function getHighlightScale({
  isMobile,
  shouldHighlight,
  shouldReduceMotion,
}: {
  isMobile: boolean;
  shouldHighlight: boolean;
  shouldReduceMotion: boolean;
}) {
  if (shouldReduceMotion) {
    return 1;
  }

  return shouldHighlight && !isMobile ? 1.02 : 1;
}

function getDesktopActiveSection(currentPage: number) {
  if (
    currentPage >= DESKTOP_MARGARITAS_START &&
    currentPage <= DESKTOP_MARGARITAS_END
  ) {
    return DESKTOP_NAV_POSITIONS.length - 1;
  }

  if (currentPage <= 1) {
    return 0;
  }

  if (currentPage <= 3) {
    return 1;
  }

  if (currentPage <= 5) {
    return 2;
  }

  if (currentPage <= 7) {
    return 3;
  }

  if (currentPage === 8) {
    return 4;
  }

  return 0;
}

function menusReducer(state: MenusState, action: MenusAction): MenusState {
  switch (action.type) {
    case "mark_navigated":
      return state.hasNavigatedToLunch
        ? state
        : { ...state, hasNavigatedToLunch: true };
    case "set_current_page":
      return state.currentPage === action.page
        ? state
        : { ...state, currentPage: action.page };
    case "set_force_lunch":
      return state.forceLunch === action.value
        ? state
        : { ...state, forceLunch: action.value };
    case "set_highlight_target":
      return state.highlightTarget === action.value
        ? state
        : { ...state, highlightTarget: action.value };
    case "sync_force_lunch_navigation":
      return {
        ...state,
        currentPage: action.page,
        hasNavigatedToLunch: true,
      };
    default:
      return state;
  }
}

const MenuCarouselItem = ({
  item,
  image,
  groupIndex,
  imageIndex,
  absoluteIndex,
  isMobile,
  forceLunch,
  targetPage,
  highlightTarget,
}: {
  item: MenuItem;
  image: string;
  groupIndex: number;
  imageIndex: number;
  absoluteIndex: number;
  isMobile: boolean;
  forceLunch: boolean;
  targetPage?: number;
  highlightTarget?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const isFirstImage = groupIndex === 0 && imageIndex === 0;
  const isLunchSection = item.name === "Lunch, Combos & Kids";
  const shouldPrioritize =
    (isFirstImage && !forceLunch) || // First image when not in lunch mode
    (forceLunch && isLunchSection) || // Lunch images when in lunch mode
    (isMobile
      ? absoluteIndex === 0 // Only first image on mobile
      : absoluteIndex === 0 || absoluteIndex === 1); // First two images on desktop

  // Check if this page should be highlighted
  const shouldHighlight = highlightTarget && targetPage === absoluteIndex;
  const highlightScale = getHighlightScale({
    isMobile,
    shouldHighlight: Boolean(shouldHighlight),
    shouldReduceMotion: Boolean(shouldReduceMotion),
  });

  return (
    <CarouselItem
      className={cn(
        "basis-full",
        !isMobile && "md:basis-1/2",
        shouldHighlight &&
          !isMobile &&
          "animate-pulse ring-4 ring-yellow-400 ring-opacity-75"
      )}
      key={image}
    >
      <motion.div
        animate={{
          opacity: 1,
          scale: highlightScale,
          boxShadow:
            shouldHighlight && !isMobile
              ? "0 0 20px rgba(251, 191, 36, 0.5)"
              : "none",
        }}
        className={cn(
          "relative h-[75vh] w-full transition-[box-shadow,transform] duration-500 md:h-[85vh]",
          shouldHighlight && !isMobile && "overflow-hidden rounded-lg"
        )}
        exit={
          shouldReduceMotion
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.95 }
        }
        initial={
          shouldReduceMotion
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.95 }
        }
        layout
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
      >
        <div className="absolute inset-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loading />
            </div>
          )}
          <Image
            alt={`${item.name} Menu ${imageIndex + 1}`}
            className={cn(
              "object-contain p-2",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            fill
            loading={shouldPrioritize ? "eager" : "lazy"}
            onLoad={() => setIsLoading(false)}
            priority={shouldPrioritize}
            quality={75}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 960px"
            src={image}
          />
        </div>
      </motion.div>
    </CarouselItem>
  );
};

export default function Component({
  initialTab,
  targetPage,
}: {
  initialTab?: number | null;
  targetPage?: number;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [state, dispatch] = useReducer(menusReducer, {
    currentPage: 0,
    forceLunch: false,
    hasNavigatedToLunch: false,
    highlightTarget: false,
  });
  const { currentPage, forceLunch, hasNavigatedToLunch, highlightTarget } =
    state;
  const shouldReduceMotion = useReducedMotion();
  const { isOpen } = useRestaurantHours();
  const isMobile = useSyncExternalStore(
    subscribeToViewport,
    getViewportSnapshot,
    () => true
  );
  const allImages = useMemo(() => {
    return menuItems.flatMap((item) => item.images);
  }, []);
  const imageStartOffsets = useMemo(() => {
    let currentOffset = 0;
    return menuItems.map((item) => {
      const startOffset = currentOffset;
      currentOffset += item.images.length;
      return startOffset;
    });
  }, []);
  const getNearestDesktopDotIndex = useCallback((page: number): number => {
    for (let i = DESKTOP_DOT_POSITIONS.length - 1; i >= 0; i--) {
      if (page >= DESKTOP_DOT_POSITIONS[i]) {
        return i;
      }
    }
    return 0;
  }, []);

  const scrollToPage = useCallback(
    (page: number, instant = false) => {
      if (!api) {
        return;
      }

      api.scrollTo(page, instant);
      dispatch({ type: "mark_navigated" });
    },
    [api]
  );

  const getLunchStartPage = useCallback(() => {
    const lunchIndex = menuItems.findIndex(
      (item) => item.name === "Lunch, Combos & Kids"
    );

    return lunchIndex === -1 ? 0 : (imageStartOffsets[lunchIndex] ?? 0);
  }, [imageStartOffsets]);

  useEffect(() => {
    const checkLunchHours = () => {
      const now = new Date();
      const hour = now.getHours();
      const isLunchTime = hour >= 11 && hour < 15; // 11 AM to 3 PM
      dispatch({ type: "set_force_lunch", value: isOpen && isLunchTime });
    };

    checkLunchHours();
    const interval = setInterval(checkLunchHours, 60_000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle initial tab navigation from URL parameter
  useEffect(() => {
    if (initialTab !== null && initialTab !== undefined && api) {
      const targetImageIndex = imageStartOffsets[initialTab] ?? 0;

      if (api.selectedScrollSnap() === targetImageIndex) {
        return;
      }

      // Navigate to the first image of the target tab
      // Use a small delay to ensure carousel is ready
      const timer = setTimeout(() => {
        scrollToPage(targetImageIndex, true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [initialTab, api, imageStartOffsets, scrollToPage]);

  // Handle target page highlighting
  useEffect(() => {
    if (targetPage !== undefined && !isMobile) {
      dispatch({ type: "set_highlight_target", value: true });
      // Auto-hide highlight after 4 seconds
      const timer = setTimeout(() => {
        dispatch({ type: "set_highlight_target", value: false });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [targetPage, isMobile]);

  // Only force lunch navigation on initial load when no specific tab is requested
  useEffect(() => {
    if (forceLunch && api && !hasNavigatedToLunch && initialTab === null) {
      const imageIndex = getLunchStartPage();
      // Only scroll if we're not already at the correct position
      if (api.selectedScrollSnap() !== imageIndex) {
        api.scrollTo(imageIndex);
        dispatch({ type: "sync_force_lunch_navigation", page: imageIndex });
        return;
      }
      dispatch({ type: "mark_navigated" });
    }
  }, [api, forceLunch, hasNavigatedToLunch, initialTab, getLunchStartPage]);

  useEffect(() => {
    if (!api) {
      return;
    }
    // Keep state in sync when carousel instance changes (e.g. mobile<->desktop remount).
    dispatch({ type: "set_current_page", page: api.selectedScrollSnap() });

    const handleSelect = () => {
      const current = api.selectedScrollSnap();
      dispatch({ type: "set_current_page", page: current });
    };
    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
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
      const maxPage = allImages.length - 1;
      const newPage = currentPage - 1;
      // Loop to end if going backwards from first page
      api.scrollTo(newPage < 0 ? maxPage : newPage);
    } else {
      const currentDesktopDotIndex = getNearestDesktopDotIndex(currentPage);
      const prevDesktopDotIndex =
        currentDesktopDotIndex <= 0
          ? DESKTOP_DOT_POSITIONS.length - 1
          : currentDesktopDotIndex - 1;
      api.scrollTo(DESKTOP_DOT_POSITIONS[prevDesktopDotIndex]);
    }
    dispatch({ type: "mark_navigated" });
  }, [api, isMobile, currentPage, getNearestDesktopDotIndex, allImages.length]);

  const handleNextClick = useCallback(() => {
    if (!api) {
      return;
    }

    if (isMobile) {
      const maxPage = allImages.length - 1;
      const newPage = currentPage + 1;
      // Loop to beginning if going forward from last page
      api.scrollTo(newPage > maxPage ? 0 : newPage);
    } else {
      const currentDesktopDotIndex = getNearestDesktopDotIndex(currentPage);
      const nextDesktopDotIndex =
        currentDesktopDotIndex >= DESKTOP_DOT_POSITIONS.length - 1
          ? 0
          : currentDesktopDotIndex + 1;
      api.scrollTo(DESKTOP_DOT_POSITIONS[nextDesktopDotIndex]);
    }
    dispatch({ type: "mark_navigated" });
  }, [api, isMobile, currentPage, getNearestDesktopDotIndex, allImages.length]);

  // Desktop navigation helpers
  const handleDesktopArrowNav = useCallback(
    (direction: "left" | "right") => {
      if (!api) {
        return;
      }
      const currentSection = getDesktopActiveSection(currentPage);
      const maxSection = DESKTOP_NAV_POSITIONS.length - 1;
      let newSection: number;
      if (direction === "left") {
        // Loop to last section if going backwards from first section
        newSection = currentSection <= 0 ? maxSection : currentSection - 1;
      } else {
        // Loop to first section if going forward from last section
        newSection = currentSection >= maxSection ? 0 : currentSection + 1;
      }
      api.scrollTo(
        DESKTOP_NAV_POSITIONS[newSection] ?? DESKTOP_NAV_POSITIONS[0]
      );
      dispatch({ type: "mark_navigated" });
    },
    [api, currentPage]
  );

  const handleMobileArrowNav = useCallback(
    (direction: "left" | "right") => {
      if (!api) {
        return;
      }
      const maxPage = allImages.length - 1;
      let newPage: number;
      if (direction === "left") {
        // Loop to last page if going backwards from first page
        newPage = currentPage <= 0 ? maxPage : currentPage - 1;
      } else {
        // Loop to first page if going forward from last page
        newPage = currentPage >= maxPage ? 0 : currentPage + 1;
      }
      api.scrollTo(newPage);
      dispatch({ type: "mark_navigated" });
    },
    [api, currentPage, allImages.length]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!api) {
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const direction = e.key === "ArrowLeft" ? "left" : "right";
        isMobile
          ? handleMobileArrowNav(direction)
          : handleDesktopArrowNav(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [api, isMobile, handleMobileArrowNav, handleDesktopArrowNav]);

  const handleNavClick = (index: number) => {
    if (!api) {
      return;
    }

    if (isMobile) {
      const imageIndex = imageStartOffsets[index] ?? 0;
      api.scrollTo(imageIndex);
    } else {
      api.scrollTo(DESKTOP_NAV_POSITIONS[index] ?? DESKTOP_NAV_POSITIONS[0]);
    }
    dispatch({ type: "mark_navigated" });
  };

  const handleDotClick = (index: number) => {
    if (!api) {
      return;
    }
    if (isMobile) {
      api.scrollTo(index);
    } else {
      api.scrollTo(
        DESKTOP_DOT_POSITIONS[index] ?? DESKTOP_DOT_POSITIONS[0],
        true
      );
    }
    dispatch({ type: "mark_navigated" });
  };

  const handleMenuButtonInteraction = (index: number, elementId: string) => {
    if (getActiveNavIndex(currentPage) === index) {
      if (shouldReduceMotion) {
        return;
      }
      const element = document.getElementById(elementId);
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
      return;
    }

    handleNavClick(index);
  };

  // Calculate which nav item should be active
  const getMobileActiveNavIndex = (currentPage: number) => {
    // Check if the last image is visible
    if (currentPage === allImages.length - 1) {
      return menuItems.length - 1;
    }

    for (let i = 0; i < menuItems.length; i++) {
      const imageCount = imageStartOffsets[i] ?? 0;
      if (
        currentPage >= imageCount &&
        currentPage < imageCount + menuItems[i].images.length
      ) {
        return i;
      }
    }
    return 0;
  };

  const getDesktopActiveNavIndex = (currentPage: number) => {
    if (
      currentPage >= DESKTOP_MARGARITAS_START &&
      currentPage <= DESKTOP_MARGARITAS_END
    ) {
      return DESKTOP_NAV_POSITIONS.length - 1; // Margaritas
    }

    if (currentPage >= 0 && currentPage <= 1) {
      return 0; // DOTM
    }
    if (currentPage >= 2 && currentPage <= 3) {
      return 1; // Starters
    }
    if (currentPage >= 4 && currentPage <= 5) {
      return 2; // Platos
    }
    if (currentPage >= 6 && currentPage <= 7) {
      return 3; // Lunch
    }
    if (currentPage === 8) {
      return 4; // Desserts
    }

    return 0;
  };

  const getActiveNavIndex = (currentPage: number) =>
    isMobile
      ? getMobileActiveNavIndex(currentPage)
      : getDesktopActiveNavIndex(currentPage);

  // Which pagination dot should be active
  const getActiveDotIndex = (currentPage: number) => {
    if (isMobile) {
      return currentPage;
    }

    return getNearestDesktopDotIndex(currentPage);
  };

  // Function to preload images
  const preloadImages = useCallback(
    (indices: number[]) => {
      for (const index of indices) {
        if (index >= 0 && index < allImages.length) {
          const img = document.createElement("img");
          img.src = allImages[index];
        }
      }
    },
    [allImages]
  );

  // Only preload the next image
  useEffect(() => {
    const nextIndex = currentPage + 1;

    if (nextIndex < allImages.length) {
      const img = new window.Image();
      img.src = allImages[nextIndex];
    }
  }, [currentPage, allImages]);

  const lunchPreloadIndices = useMemo(() => {
    if (!forceLunch) {
      return [];
    }

    const lunchIndex = menuItems.findIndex(
      (item) => item.name === "Lunch, Combos & Kids"
    );

    if (lunchIndex === -1) {
      return [];
    }

    const imageIndex = imageStartOffsets[lunchIndex] ?? 0;
    return menuItems[lunchIndex].images.map((_, imageOffset) => {
      return imageIndex + imageOffset;
    });
  }, [forceLunch, imageStartOffsets]);

  useEffect(() => {
    if (lunchPreloadIndices.length === 0) {
      return;
    }

    preloadImages(lunchPreloadIndices);
  }, [lunchPreloadIndices, preloadImages]);

  const getButtonVariant = (isLunchTab: boolean, isActive: boolean) => {
    if (isLunchTab) {
      return;
    }
    return isActive ? "default" : "ghost";
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="mx-auto w-full max-w-6xl px-4">
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={isMobile ? "mobile" : "desktop"}
            transition={{ duration: 0.3 }}
          >
            {forceLunch && (
              <div className="relative text-center">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="font-bold text-3xl"
                  initial={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {(() => {
                    return (
                      <motion.button
                        animate={
                          shouldReduceMotion
                            ? { color: "#03502D" }
                            : {
                                color: [
                                  "#03502D",
                                  "#FFD700",
                                  "#03502D",
                                  "#FFD700",
                                  "#03502D",
                                ],
                              }
                        }
                        aria-label="Go to lunch menu section"
                        className={cn(
                          "rounded-lg px-2 py-1 italic transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#03502D] focus-visible:ring-offset-2"
                        )}
                        initial={{ color: "#03502D" }}
                        onClick={() => {
                          // Navigate to lunch section
                          if (api) {
                            const imageIndex = getLunchStartPage();
                            api.scrollTo(imageIndex);
                            dispatch({
                              type: "sync_force_lunch_navigation",
                              page: imageIndex,
                            });
                          }
                        }}
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : {
                                duration: 1.3,
                                ease: "easeInOut",
                                times: [0, 0.25, 0.5, 0.75, 1],
                              }
                        }
                        type="button"
                      >
                        🌯 ¡Echar Lonche! 🌮
                      </motion.button>
                    );
                  })()}
                </motion.div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key={isMobile ? "mobile" : "desktop"}
                transition={{ duration: 0.3 }}
              >
                {isMobile ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="my-4 grid grid-cols-2 gap-2 lg:inline-block lg:space-x-4 lg:text-center"
                    initial={{ opacity: 0, y: -10 }}
                    layout
                    transition={{ duration: 0.3 }}
                  >
                    {menuItems.map((item, index) => {
                      // Skip mobileOnly items in desktop view
                      if (!isMobile && item.mobileOnly) {
                        return null;
                      }

                      const isActive = getActiveNavIndex(currentPage) === index;
                      const isLunchTab =
                        forceLunch && item.name === "Lunch, Combos & Kids";
                      const isMargaritasTab = item.name === "Margaritas & More";
                      const isDotmTab = item.name.startsWith("DOTM");

                      const buttonStyle = getMenuButtonStyle({
                        isActive,
                        isDotmTab,
                        isLunchTab,
                        isMargaritasTab,
                      });

                      return (
                        <motion.div
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-center lg:inline-block"
                          initial={{ opacity: 0, y: -10 }}
                          key={item.name}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={
                            shouldReduceMotion ? undefined : { scale: 1.02 }
                          }
                          whileTap={
                            shouldReduceMotion ? undefined : { scale: 0.95 }
                          }
                        >
                          <Button
                            className={cn(
                              "whitespace-nowrap px-2 text-center font-semibold text-sm md:text-sm",
                              isActive ? "scale-105 font-black" : "scale-100",
                              "transition-transform duration-150 ease-in-out",
                              buttonStyle,
                              !isMobile && "lg:last:hidden"
                            )}
                            id={`menu-btn-${index}`}
                            onClick={() =>
                              handleMenuButtonInteraction(
                                index,
                                `menu-btn-${index}`
                              )
                            }
                            type="button"
                            variant={getButtonVariant(isLunchTab, isActive)}
                          >
                            {item.mobileName || item.name}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="my-4 grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:justify-center lg:space-x-6 lg:text-center"
                    initial={{ opacity: 0, y: -10 }}
                    layout
                    transition={{ duration: 0.3 }}
                  >
                    {menuItems
                      .filter((item) => !item.mobileOnly)
                      .map((item, index) => {
                        const isActive =
                          getActiveNavIndex(currentPage) === index;
                        const isLunchTab =
                          forceLunch && item.name === "Lunch, Combos & Kids";
                        const isMargaritasTab =
                          item.name === "Margaritas & More";
                        const isDotmTab = item.name.startsWith("DOTM");

                        const buttonStyle = getMenuButtonStyle({
                          isActive,
                          isDotmTab,
                          isLunchTab,
                          isMargaritasTab,
                        });

                        return (
                          <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            initial={{ opacity: 0, y: -10 }}
                            key={item.name}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={
                              shouldReduceMotion ? undefined : { scale: 1.02 }
                            }
                            whileTap={
                              shouldReduceMotion ? undefined : { scale: 0.95 }
                            }
                          >
                            <Button
                              className={cn(
                                "whitespace-nowrap font-semibold text-sm md:text-base",
                                isActive ? "scale-105 font-black" : "scale-100",
                                "transition-transform duration-150 ease-out",
                                buttonStyle
                              )}
                              id={`menu-btn-desktop-${index}`}
                              onClick={() =>
                                handleMenuButtonInteraction(
                                  index,
                                  `menu-btn-desktop-${index}`
                                )
                              }
                              type="button"
                              variant={getButtonVariant(isLunchTab, isActive)}
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
                className="w-full lg:mt-0"
                opts={{
                  align: "start",
                  ...(isMobile
                    ? {
                        dragFree: false,
                      }
                    : {
                        dragFree: false,
                        skipSnaps: false,
                        containScroll: "trimSnaps",
                      }),
                }}
                setApi={setApi}
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
                          (imageStartOffsets[groupIndex] ?? 0) + imageIndex;

                        return (
                          <MenuCarouselItem
                            absoluteIndex={absoluteIndex}
                            forceLunch={forceLunch}
                            groupIndex={groupIndex}
                            highlightTarget={highlightTarget}
                            image={image}
                            imageIndex={imageIndex}
                            isMobile={isMobile}
                            item={item}
                            key={image}
                            targetPage={targetPage}
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
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <motion.div
                        whileHover={
                          shouldReduceMotion ? undefined : { scale: 1.1 }
                        }
                        whileTap={
                          shouldReduceMotion ? undefined : { scale: 0.9 }
                        }
                      >
                        <Button
                          aria-label="Previous page"
                          className="h-8 w-8 p-0 text-[#03502D] hover:bg-[#03502D]/10 hover:text-[#03502D]"
                          onClick={handlePrevClick}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </PaginationItem>

                    {Array.from({
                      length: isMobile
                        ? allImages.length
                        : DESKTOP_DOT_POSITIONS.length,
                    }).map((_, i) => {
                      const isLunchPage =
                        forceLunch && (isMobile ? i === 6 || i === 7 : i === 3);

                      return (
                        <PaginationItem
                          key={
                            isMobile
                              ? allImages[i]
                              : `desktop-dot-${DESKTOP_DOT_POSITIONS[i]}`
                          }
                        >
                          <button
                            aria-label={`Go to page ${i + 1}`}
                            className={cn(
                              "h-2 w-2 rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#03502D] focus-visible:ring-offset-2",
                              {
                                "bg-[#03502D]":
                                  getActiveDotIndex(currentPage) === i &&
                                  !isLunchPage,
                                "bg-[#03502D]/20":
                                  !isLunchPage &&
                                  getActiveDotIndex(currentPage) !== i,
                                "bg-yellow-500":
                                  forceLunch &&
                                  ((isMobile && (i === 6 || i === 7)) ||
                                    (!isMobile && i === 3)),
                              }
                            )}
                            onClick={() => handleDotClick(i)}
                            type="button"
                          />
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <motion.div
                        whileHover={
                          shouldReduceMotion ? undefined : { scale: 1.1 }
                        }
                        whileTap={
                          shouldReduceMotion ? undefined : { scale: 0.9 }
                        }
                      >
                        <Button
                          aria-label="Next page"
                          className="h-8 w-8 p-0 text-[#03502D] hover:bg-[#03502D]/10 hover:text-[#03502D]"
                          onClick={handleNextClick}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
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
            className="fixed right-4 bottom-4 z-50 rounded-full bg-[#03502D] px-4 py-2 text-sm text-stone-50 shadow-lg hover:opacity-90"
            onClick={() =>
              dispatch({ type: "set_force_lunch", value: !forceLunch })
            }
            type="button"
          >
            {forceLunch ? "Disable" : "Enable"} Lunch Hours
          </button>
        )}
      </div>
    </LazyMotion>
  );
}
