"use client";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m as motion,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { trackImageEngagement, trackLightboxOpen } from "@/lib/analytics";
import { CONFETTI_COLORS } from "@/lib/constants/colors";
import {
  getCaptionByFilename,
  getDynamicCaption,
  getMenuLinkByFilename,
  IMAGE_CAPTIONS,
  MENU_LINKS,
} from "@/lib/constants/image-captions";
import { cn } from "@/lib/utils";
import { useColorTesting } from "./debug/ColorTestingContext";

const SOFT_EASE = [0.16, 1, 0.3, 1] as const;
const SOFT_ENTER = {
  duration: 0.55,
  ease: SOFT_EASE,
};

// Shuffle function for arrays
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get daily confetti colors for headings (changes daily, consistent per day)
const getDailyHeadingColors = (debugDay: number | null = null): string[] => {
  const today = new Date();

  // Use debug day if provided, otherwise use actual day of year
  const dayOfYear =
    debugDay !== null
      ? debugDay
      : Math.floor(
          (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
            (1000 * 60 * 60 * 24)
        );

  // Use day of year as seed for consistent daily colors
  const seed = dayOfYear;

  // Select 3 different colors from confetti colors
  const selectedColors: string[] = [];
  const availableColors = [...CONFETTI_COLORS];

  for (let i = 0; i < 3; i++) {
    const index = (seed + i * 7) % availableColors.length;
    selectedColors.push(availableColors[index]);
  }

  return selectedColors;
};

// Split the original images into three categories
const featuredFoodFilenames = [
  "DSC05867.jpg",
  "DSC05980.jpg",
  "DSC06133.jpg",
  "DSC06141.jpg",
  "DSC06149.jpg",
  "DSC06155.jpg",
  "DSC06163.jpg",
  "DSC06175.jpg",
  "DSC06190.jpg",
  "DSC06195.jpg",
  "DSC06200.jpg",
  "DSC06206.jpg",
  "DSC06216.jpg",
  "DSC06225.jpg",
  "DSC06231.jpg",
  "DSC06245.jpg",
  "DSC06261.jpg",
];

// Create featured food images with proper captions and links, then shuffle
// Note: This will be memoized in the component to prevent infinite loops
const createFeaturedFoodImages = () =>
  shuffleArray(
    featuredFoodFilenames.map((filename, index) => ({
      src: `/images/food/${filename}`,
      alt: "Featured Food Item",
      caption:
        IMAGE_CAPTIONS.featuredFood[index] || "Delicious Mexican Cuisine",
      menuLink: MENU_LINKS.featuredFood[index] || "/menu",
    }))
  );

// Create featured drinks images with dynamic ordering based on caption prefixes
const createDynamicDrinksCarousel = () => {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Create drinks using the actual filenames from the constants
  const drinkFilenames = [
    "Margarita.jpg", // MON: 12oz Margaritas
    "Blue_Marg_Jaz.jpg", // TUE: 16oz Blue Margaritas
    "DSC03251.jpg", // WED: 32oz Draft Beer
    "20oz_Beer.jpg", // THU: 20oz Draft Beer
    "DSC01270.jpg", // FRI: 12oz Draft Beer
    "DSC01260.jpg", // SAT: 20oz Draft Beer + Margaritas
    "Wine.jpg", // SUN: Wine by the Glass
    "Mexican_Mule.jpg", // Mexican Mule
    "Cantarito.jpg", // Cantarito
    "Spicy_Margarita.jpg", // Spicy Margarita
    "Beer-ita.jpg", // Beer-ita
  ];

  const allDrinks = drinkFilenames.map((filename) => {
    const caption = getCaptionByFilename(filename, "featuredDrinks");
    const menuLink = getMenuLinkByFilename(filename, "featuredDrinks");

    return {
      filename,
      src: `/images/drinks/${filename}`,
      alt: "Featured Drink Item",
      caption,
      menuLink,
    };
  });

  // Separate drinks by whether they have day prefixes
  const dailySpecials: Array<{
    filename: string;
    src: string;
    alt: string;
    caption: string;
    menuLink: string;
  }> = [];
  const additionalDrinks: Array<{
    filename: string;
    src: string;
    alt: string;
    caption: string;
    menuLink: string;
  }> = [];

  allDrinks.forEach((drink) => {
    const hasDayPrefix = /^(MON|TUE|WED|THU|FRI|SAT|SUN):\s/.test(
      drink.caption
    );

    if (hasDayPrefix) {
      dailySpecials.push(drink);
    } else {
      additionalDrinks.push(drink);
    }
  });

  // Sort daily specials by day of week (Monday = 1, Sunday = 0)
  const dayOrder = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 0 };
  dailySpecials.sort((a, b) => {
    const dayA = a.caption.match(/^(MON|TUE|WED|THU|FRI|SAT|SUN):/)?.[1];
    const dayB = b.caption.match(/^(MON|TUE|WED|THU|FRI|SAT|SUN):/)?.[1];
    return (
      (dayOrder[dayA as keyof typeof dayOrder] || 0) -
      (dayOrder[dayB as keyof typeof dayOrder] || 0)
    );
  });

  // Shuffle additional drinks for variety
  const shuffledAdditionalDrinks = shuffleArray(additionalDrinks);

  // Reorder daily specials to start with today
  const reorderedSpecials: typeof allDrinks = [];
  const todayDay = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][today];
  const todayIndex = dailySpecials.findIndex((drink) =>
    drink.caption.startsWith(`${todayDay}:`)
  );

  if (todayIndex !== -1) {
    // Start with today and continue through the week
    for (let i = 0; i < dailySpecials.length; i++) {
      const index = (todayIndex + i) % dailySpecials.length;
      const special = { ...dailySpecials[index] }; // Clone to avoid mutating original

      // Update caption for today's special
      if (i === 0) {
        special.caption = special.caption.replace(/^[A-Z]+: /, "TODAY: ");
      }

      reorderedSpecials.push(special);

      // Add additional drinks interspersed (every other daily special)
      if (
        i < dailySpecials.length - 1 &&
        i % 2 === 1 &&
        shuffledAdditionalDrinks.length > 0
      ) {
        const nextDrink = shuffledAdditionalDrinks.shift();
        if (nextDrink) {
          reorderedSpecials.push(nextDrink);
        }
      }
    }
  } else {
    // If today's special not found, just use original order
    reorderedSpecials.push(...dailySpecials);
  }

  // Add any remaining additional drinks at the end
  reorderedSpecials.push(...shuffledAdditionalDrinks);

  return reorderedSpecials;
};

const dailySpecialsImages = [
  "Mixed_Fajita.jpg",
  "Two_Taco_RB.jpg",
  "Enchilada_Supremas.jpg",
  "Emily_Special.jpg",
  "Steven_Special.jpg",
  "Burrito_Pueblito_1.jpg",
  "Taco_Salad_Pueblito.jpg",
].map((filename, index) => ({
  src: `/images/daily specials/${filename}`,
  alt: "Daily Special Item",
  caption: IMAGE_CAPTIONS.dailySpecials[index] || "Daily Specials",
  menuLink: MENU_LINKS.dailySpecials[index] || "/menu",
}));

interface HeroImage {
  src: string;
  alt: string;
  caption: string;
  menuLink?: string; // Optional link to specific menu section
  isDailyDrinkSpecial?: boolean; // Optional flag for daily drink specials
}

interface AutoplayController {
  play?: () => void;
  stop?: () => void;
}

const HeroCarousel = ({
  images,
  setCurrentIndex,
  onImageClick,
  isMobile,
  carouselIndex,
  categoryName,
  disableKeyboard,
  pauseAutoplay,
  isDailySpecials,
  isDailyDrinks,
}: {
  images: HeroImage[];
  setCurrentIndex: (index: number) => void;
  onImageClick?: (image: HeroImage, carouselIndex: number) => void;
  isMobile: boolean;
  carouselIndex: number;
  categoryName: string;
  disableKeyboard?: boolean;
  pauseAutoplay?: boolean;
  isDailySpecials?: boolean;
  isDailyDrinks?: boolean;
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Initialize loading states for all images
  useEffect(() => {
    const initialLoadingStates: { [key: string]: boolean } = {};
    for (const img of images) {
      initialLoadingStates[img.src] = true;
    }
    setImageLoadingStates(initialLoadingStates);
  }, [images]);

  // Memoize the plugins array to prevent infinite re-renders
  let autoplayDelay = 7000;
  if (isDailySpecials) {
    autoplayDelay = 11_000;
  } else if (isDailyDrinks) {
    autoplayDelay = 9000;
  }

  const plugins = useMemo(
    () => [
      Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        playOnInit: true,
      }),
    ],
    [autoplayDelay]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      duration: 25,
      dragFree: false,
      inViewThreshold: 0.7,
    },
    // All carousels: YES autoplay, YES keyboard navigation, YES on-screen button navigation
    plugins
  );

  // Store autoplay plugin reference
  const [autoplayPlugin, setAutoplayPlugin] =
    useState<AutoplayController | null>(null);

  // Use useRef to maintain stable reference to the API
  const apiRef = useRef(emblaApi);
  useEffect(() => {
    apiRef.current = emblaApi;
  }, [emblaApi]);

  // console.log('HeroCarousel render - emblaApi:', emblaApi, 'isDailyDrinks:', isDailyDrinks);

  // Use onSelect to trigger re-renders when carousel changes, but don't manage state
  const [_forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const handleSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
      // Force a re-render so the caption updates
      setForceUpdate((prev) => prev + 1);
    };

    emblaApi.on("select", handleSelect);
    return () => {
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi, setCurrentIndex]);

  // For daily specials, start on today's special then autoplay from there
  useEffect(() => {
    if (isDailySpecials && emblaApi) {
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      // Map: Sunday=6, Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5
      const specialIndex = today === 0 ? 6 : today - 1;

      // Scroll to today's special first
      if (specialIndex < images.length) {
        emblaApi.scrollTo(specialIndex);
      }
    }
  }, [isDailySpecials, emblaApi, images.length]);

  // Note: Daily drinks are already reordered to start with today's special at index 0
  // No need for additional scrolling logic

  // Store autoplay plugin reference when carousel initializes
  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    // Wait a bit for plugins to be fully initialized
    const timer = setTimeout(() => {
      const plugins = emblaApi.plugins();
      // console.log(`Carousel ${carouselIndex}: Available plugins:`, plugins);

      // Try to find the autoplay plugin
      let foundPlugin: AutoplayController | null = null;

      if (plugins.autoplay) {
        foundPlugin = plugins.autoplay as AutoplayController;
      } else if (plugins["embla-carousel-autoplay"]) {
        foundPlugin = plugins["embla-carousel-autoplay"] as AutoplayController;
      } else {
        // Look through all plugin properties
        for (const key in plugins) {
          if (
            key.includes("autoplay") ||
            (plugins[key] &&
              typeof plugins[key] === "object" &&
              "stop" in plugins[key] &&
              "play" in plugins[key])
          ) {
            foundPlugin = plugins[key] as AutoplayController;
            break;
          }
        }
      }

      if (foundPlugin) {
        // console.log(`Carousel ${carouselIndex}: Found autoplay plugin:`, foundPlugin);
        setAutoplayPlugin(foundPlugin);
      } else {
        // console.log(`Carousel ${carouselIndex}: No autoplay plugin found`);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [emblaApi]);

  // Control autoplay based on pauseAutoplay prop
  useEffect(() => {
    if (!autoplayPlugin) {
      return;
    }

    // console.log(`Carousel ${carouselIndex}: pauseAutoplay changed to:`, pauseAutoplay);

    if (pauseAutoplay) {
      // console.log(`Carousel ${carouselIndex}: Pausing autoplay`);
      if (typeof autoplayPlugin.stop === "function") {
        autoplayPlugin.stop();
      }
    } else if (typeof autoplayPlugin.play === "function") {
      // console.log(`Carousel ${carouselIndex}: Starting autoplay`);
      autoplayPlugin.play();
    }
  }, [pauseAutoplay, autoplayPlugin]);

  // For mobile: Show today's special when tab changes, then autoplay continues
  useEffect(() => {
    if (emblaApi && isMobile) {
      if (isDailySpecials) {
        // Show today's special for daily specials, then autoplay continues
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        // Map: Sunday=6, Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5
        const specialIndex = today === 0 ? 6 : today - 1;

        // Scroll to today's special first
        if (specialIndex < images.length) {
          emblaApi.scrollTo(specialIndex);
        }
      } else if (isDailyDrinks) {
        // Show today's drink special for drinks, then autoplay continues
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        // Map: Sunday=6, Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5
        const drinkSpecialIndex = today === 0 ? 6 : today - 1;

        // Scroll to today's drink special first
        if (drinkSpecialIndex < images.length) {
          emblaApi.scrollTo(drinkSpecialIndex);
        }
      }
    }
  }, [emblaApi, isMobile, isDailySpecials, isDailyDrinks, images.length]);

  // Keyboard navigation - enabled for all carousels
  useEffect(() => {
    if (!emblaApi || disableKeyboard) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        emblaApi.scrollPrev();
        // No need to manage state - caption reads directly from carousel
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        emblaApi.scrollNext();
        // No need to manage state - caption reads directly from carousel
      }
    };

    // Add keyboard listener to the window for global keyboard navigation
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [emblaApi, disableKeyboard]);

  return (
    <div className="relative w-full">
      <div className="relative mx-auto w-full overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              className="min-w-0 shrink-0 grow-0 basis-full px-2"
              key={image.src}
            >
              <motion.div
                animate={{ opacity: 1 }}
                className="relative w-full"
                initial={false}
                transition={shouldReduceMotion ? { duration: 0 } : SOFT_ENTER}
              >
                <button
                  aria-label={`${categoryName}: ${image.caption}`}
                  className="relative block aspect-video w-full cursor-pointer appearance-none overflow-hidden rounded-[1.75rem] border-0 bg-stone-950/5 p-0 text-left shadow-lg transition-transform duration-300 hover:scale-[1.01]"
                  onClick={() => {
                    // Track image engagement
                    trackImageEngagement({
                      src: image.src,
                      alt: image.alt,
                      caption: image.caption,
                      category: categoryName,
                      index,
                      action: "click",
                      location: "carousel",
                    });

                    if (isMobile) {
                      // On mobile/tablet, link to menu page
                      if (image.menuLink) {
                        window.location.href = image.menuLink;
                      }
                    } else if (onImageClick) {
                      // On desktop, open lightbox
                      onImageClick(image, carouselIndex);
                    }
                  }}
                  type="button"
                >
                  <div className="absolute inset-0 z-10 bg-black/10" />
                  <div
                    className={cn(
                      "absolute inset-0 z-[15] bg-gradient-to-br from-stone-200/80 via-stone-100/60 to-stone-300/80 transition-opacity duration-500",
                      imageLoadingStates[image.src]
                        ? "animate-pulse opacity-100"
                        : "pointer-events-none opacity-0"
                    )}
                  />

                  <Image
                    alt={image.alt}
                    className={cn(
                      "object-cover transition-[opacity,transform,filter] duration-700",
                      imageLoadingStates[image.src]
                        ? "scale-[1.015] opacity-0 blur-[6px]"
                        : "scale-100 opacity-100 blur-0"
                    )}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    onError={() => {
                      setImageLoadingStates((prev) => ({
                        ...prev,
                        [image.src]: false,
                      }));
                    }}
                    onLoad={() => {
                      setImageLoadingStates((prev) => ({
                        ...prev,
                        [image.src]: false,
                      }));
                    }}
                    priority={index === 0}
                    quality={60}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    src={image.src}
                  />
                  <div className="absolute inset-0 z-20 hidden items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-100 lg:flex">
                    <div className="rounded-full bg-black/50 p-2 transition-colors duration-200 hover:bg-yellow-400">
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4 text-stone-50"
                        fill="none"
                        focusable="false"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Caption ALWAYS reads directly from carousel - no state management */}
        <div className="mt-4 flex justify-center">
          {(() => {
            // ALWAYS read from the carousel's current state, never from currentIndex
            // forceUpdate ensures this re-renders when carousel changes
            const currentSlideIndex = emblaApi
              ? emblaApi.selectedScrollSnap()
              : 0;
            const currentImage = images[currentSlideIndex];

            // Debug: log what's happening
            // console.log('Caption render - forceUpdate:', forceUpdate, 'currentSlideIndex:', currentSlideIndex, 'image:', currentImage?.caption);

            // Get dynamic caption based on current day
            const dynamicCaption = currentImage?.caption
              ? getDynamicCaption(
                  currentImage.caption,
                  isDailySpecials
                    ? "dailySpecials"
                    : isDailyDrinks
                      ? "featuredDrinks"
                      : "featuredFood",
                  currentSlideIndex,
                  false // isMobile - you can pass this from props if needed
                )
              : "";

            if (currentImage?.menuLink) {
              return (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                  exit={{ opacity: 0, y: -6 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={`${currentSlideIndex}-${dynamicCaption}`}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.35, ease: SOFT_EASE }
                  }
                >
                  <Link
                    className="cursor-pointer rounded-full bg-[#221E1B] px-6 py-3 shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-yellow-400/90"
                    href={currentImage.menuLink}
                    onClick={() => {
                      // Track caption click engagement
                      trackImageEngagement({
                        src: currentImage.src,
                        alt: currentImage.alt,
                        caption: currentImage.caption,
                        category: categoryName,
                        index: currentSlideIndex,
                        action: "click",
                        location: "carousel",
                      });
                    }}
                  >
                    <p className="text-center font-bold tablet:text-sm text-white text-xs">
                      {dynamicCaption}
                    </p>
                  </Link>
                </motion.div>
              );
            }
            return (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
                exit={{ opacity: 0, y: -6 }}
                initial={{ opacity: 0, y: 8 }}
                key={`${currentSlideIndex}-${dynamicCaption}`}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.35, ease: SOFT_EASE }
                }
              >
                <div className="rounded-full bg-[#221E1B] px-6 py-3 shadow-lg backdrop-blur-sm">
                  <p className="text-center font-bold tablet:text-sm text-white text-xs">
                    {dynamicCaption}
                  </p>
                </div>
              </motion.div>
            );
          })()}
        </div>

        {/* Navigation buttons - work for ALL carousels (weekly specials, featured food, drinks) */}
        <button
          className="absolute top-1/2 left-4 z-20 h-8 w-8 -translate-y-1/2 rounded-full border border-yellow-400 bg-black/50 text-zinc-50 transition-all duration-200 hover:scale-110 hover:border-yellow-400 hover:bg-yellow-400"
          disabled={!emblaApi?.canScrollPrev()}
          onClick={() => {
            const api = apiRef.current;
            if (api) {
              try {
                // console.log('Before scrollPrev - current index:', api.selectedScrollSnap());
                api.scrollPrev();
                // console.log('After scrollPrev - new index:', api.selectedScrollSnap());
                // No need to manage state - caption reads directly from carousel
              } catch (error) {
                console.error("Error calling scrollPrev:", error);
              }
            }
          }}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="mx-auto h-4 w-4"
            fill="none"
            focusable="false"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
        <button
          className="absolute top-1/2 right-4 z-20 h-8 w-8 -translate-y-1/2 rounded-full border border-yellow-400 bg-black/50 text-zinc-50 transition-all duration-200 hover:scale-110 hover:border-yellow-400 hover:bg-yellow-400"
          disabled={!emblaApi?.canScrollNext()}
          onClick={() => {
            const api = apiRef.current;
            if (api) {
              try {
                // console.log('Before scrollNext - current index:', api.selectedScrollSnap());
                api.scrollNext();
                // console.log('After scrollNext - new index:', api.selectedScrollSnap());
                // No need to manage state - caption reads directly from carousel
              } catch (error) {
                console.error("Error calling scrollNext:", error);
              }
            }
          }}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="mx-auto h-4 w-4"
            fill="none"
            focusable="false"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const _CaptionBubble = ({
  caption,
  direction,
  menuLink,
}: {
  caption: string;
  direction: "forward" | "backward";
  menuLink?: string;
}) => {
  const isForward = direction === "forward";

  return (
    <motion.div
      animate={{ opacity: 1, x: 0, scale: 1 }} // This ensures the component re-animates when caption changes
      className="mt-4 flex justify-center"
      exit={{ opacity: 0, x: isForward ? 20 : -20, scale: 0.95 }}
      initial={{ opacity: 0, x: isForward ? -20 : 20, scale: 0.95 }}
      key={caption}
      transition={{
        duration: 0.4,
        ease: "easeInOut",
      }}
    >
      {menuLink ? (
        <Link
          className="cursor-pointer rounded-full bg-[#221E1B] px-6 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-yellow-400/90"
          href={menuLink}
        >
          <p className="text-center font-bold tablet:text-sm text-white text-xs">
            {caption}
          </p>
        </Link>
      ) : (
        <div className="rounded-full bg-[#221E1B] px-6 py-3 shadow-blur-sm">
          <p className="text-center font-bold tablet:text-sm text-white text-xs">
            {caption}
          </p>
        </div>
      )}
    </motion.div>
  );
};

const LightboxModal = ({
  isOpen,
  image,
  onClose,
  images: _images,
  onNavigate,
  direction,
  lightboxKey,
}: {
  isOpen: boolean;
  image: HeroImage | null;
  onClose: () => void;
  images: HeroImage[];
  onNavigate?: (direction: "prev" | "next") => void;
  direction: "forward" | "backward";
  lightboxKey: string;
}) => {
  const [loadedImageSrc, setLoadedImageSrc] = useState<string | null>(null);
  const activeImageSrc = image?.src ?? null;
  const isImageLoading = isOpen && activeImageSrc !== loadedImageSrc;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && onNavigate) {
        onNavigate("prev");
      } else if (e.key === "ArrowRight" && onNavigate) {
        onNavigate("next");
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, onNavigate]);

  if (!(isOpen && image)) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {/* Fixed Close Button */}
        <motion.button
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-8 left-8 z-60 rounded-full bg-black/50 p-3 text-stone-50 transition-colors hover:bg-yellow-400 focus:outline-none"
          exit={{ opacity: 0, scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.8 }}
          onClick={onClose}
          transition={{ duration: 0.2, delay: 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            aria-hidden="true"
            className="h-8 w-8"
            fill="none"
            focusable="false"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </motion.button>
        <motion.div
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative max-h-[90vh] max-w-[90vw]"
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <div className="relative">
            {/* Previous Button */}
            <motion.button
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-4 text-stone-50 shadow-lg transition-all duration-200 hover:bg-yellow-400 hover:text-black focus:outline-none"
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                // console.log('Prev button clicked, onNavigate:', !!onNavigate);
                if (onNavigate) {
                  onNavigate("prev");
                }
              }}
              transition={{ duration: 0.2, delay: 0.15 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                focusable="false"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </motion.button>

            {/* Next Button */}
            <motion.button
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-4 text-stone-50 shadow-lg transition-all duration-200 hover:bg-yellow-400 hover:text-black focus:outline-none"
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                // console.log('Next button clicked, onNavigate:', !!onNavigate);
                if (onNavigate) {
                  onNavigate("next");
                }
              }}
              transition={{ duration: 0.2, delay: 0.15 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                focusable="false"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.div
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                className="relative"
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  x: direction === "forward" ? -50 : 50,
                }}
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  x: direction === "forward" ? 50 : -50,
                }}
                key={`${lightboxKey}-${image.src}`}
                transition={{
                  duration: 0.25,
                  ease: "easeInOut",
                }}
              >
                {/* Loading Spinner */}
                {isImageLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20">
                    <LoadingSpinner className="text-white" size={60} />
                  </div>
                )}

                <Image
                  alt={image.alt}
                  className="max-h-[90vh] max-w-full object-contain"
                  height={800}
                  onError={() => {
                    setLoadedImageSrc(image.src);
                  }}
                  onLoad={() => {
                    setLoadedImageSrc(image.src);
                  }}
                  priority
                  quality={75}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                  src={image.src}
                  width={1200}
                />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-4 bottom-4 left-4 bg-[#221E1B]/90 p-4 backdrop-blur-sm"
                exit={{ opacity: 0, y: 20 }}
                initial={{ opacity: 0, y: 20 }}
                key={`caption-${image.src}`}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <p className="text-center font-medium text-white">
                  {image.caption}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface HeroState {
  activeTab: number;
  currentIndices: number[];
  debugAutoplayDisabled: boolean;
  debugDay: number | null;
  isMobile: boolean | undefined;
  lightboxCurrentIndex: number;
  lightboxDirection: "forward" | "backward";
  lightboxImage: HeroImage | null;
  lightboxImages: HeroImage[];
  lightboxKey: string;
  lightboxOpen: boolean;
  pauseAutoplay: boolean;
}

type HeroAction =
  | { type: "set_active_tab"; tab: number }
  | { type: "set_debug_autoplay_disabled"; value: boolean }
  | { type: "set_debug_day"; value: number | null }
  | { type: "set_is_mobile"; value: boolean }
  | { type: "set_pause_autoplay"; value: boolean }
  | { type: "set_slide_index"; carouselIndex: number; index: number }
  | {
      type: "open_lightbox";
      currentIndex: number;
      image: HeroImage;
      images: HeroImage[];
      key: string;
    }
  | { type: "close_lightbox" }
  | {
      type: "navigate_lightbox";
      direction: "forward" | "backward";
      image: HeroImage;
      index: number;
      key: string;
    };

function heroReducer(state: HeroState, action: HeroAction): HeroState {
  switch (action.type) {
    case "close_lightbox":
      return {
        ...state,
        lightboxCurrentIndex: 0,
        lightboxImage: null,
        lightboxImages: [],
        lightboxOpen: false,
      };
    case "navigate_lightbox":
      return {
        ...state,
        lightboxCurrentIndex: action.index,
        lightboxDirection: action.direction,
        lightboxImage: action.image,
        lightboxKey: action.key,
      };
    case "open_lightbox":
      return {
        ...state,
        lightboxCurrentIndex: action.currentIndex,
        lightboxDirection: "forward",
        lightboxImage: action.image,
        lightboxImages: action.images,
        lightboxKey: action.key,
        lightboxOpen: true,
      };
    case "set_active_tab":
      return { ...state, activeTab: action.tab };
    case "set_debug_autoplay_disabled":
      return { ...state, debugAutoplayDisabled: action.value };
    case "set_debug_day":
      return { ...state, debugDay: action.value };
    case "set_is_mobile":
      return { ...state, isMobile: action.value };
    case "set_pause_autoplay":
      return { ...state, pauseAutoplay: action.value };
    case "set_slide_index": {
      const currentIndices = [...state.currentIndices];
      currentIndices[action.carouselIndex] = action.index;
      return { ...state, currentIndices };
    }
    default:
      return state;
  }
}

const Hero = () => {
  const shouldReduceMotion = useReducedMotion();
  const [state, dispatch] = useReducer(heroReducer, {
    activeTab: 0,
    currentIndices: [0, 0, 0],
    debugAutoplayDisabled: false,
    debugDay: null,
    isMobile: undefined,
    lightboxCurrentIndex: 0,
    lightboxDirection: "forward",
    lightboxImage: null,
    lightboxImages: [],
    lightboxKey: "",
    lightboxOpen: false,
    pauseAutoplay: false,
  });
  const {
    activeTab,
    currentIndices,
    debugAutoplayDisabled,
    debugDay,
    isMobile,
    lightboxCurrentIndex,
    lightboxDirection,
    lightboxImage,
    lightboxImages,
    lightboxKey,
    lightboxOpen,
    pauseAutoplay,
  } = state;

  // Get dynamic colors for buttons
  const { getMenuButtonColors, getCateringButtonColors } = useColorTesting();

  // Get current colors for each button to ensure re-renders
  const menuColors = getMenuButtonColors();
  const cateringColors = getCateringButtonColors();

  // Listen for debug day changes
  useEffect(() => {
    const handleDebugDayChange = (event: CustomEvent) => {
      dispatch({ type: "set_debug_day", value: event.detail.debugDay });
    };

    window.addEventListener(
      "debugDayChange",
      handleDebugDayChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "debugDayChange",
        handleDebugDayChange as EventListener
      );
    };
  }, []);

  // Get daily confetti colors for headings (uses debug day if available)
  const headingColors = getDailyHeadingColors(debugDay);

  // Create drinks carousel with current day (memoized to prevent infinite loops)
  const featuredDrinksImages = useMemo(() => createDynamicDrinksCarousel(), []);

  // Create featured food images (memoized to prevent infinite loops)
  const featuredFoodImages = useMemo(() => createFeaturedFoodImages(), []);

  // Define carousel categories inside component so it uses current drinks
  const carouselCategories = useMemo(
    () => [
      {
        name: "Daily Specials",
        mobileName: "Specials",
        images: dailySpecialsImages,
        isDailySpecials: true,
      },
      {
        name: "Menu Highlights",
        mobileName: "Highlights",
        images: featuredFoodImages,
      },
      {
        name: "Featured Drinks",
        mobileName: "Drinks",
        images: featuredDrinksImages,
        isDailyDrinks: true, // Mark this as daily drinks carousel
      },
    ],
    [featuredDrinksImages, featuredFoodImages]
  );

  const [_navigationDirection, setNavigationDirection] = useState<
    "forward" | "backward"
  >("forward");
  const keyboardNavigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [_lightboxOpenTime, setLightboxOpenTime] = useState<number>(0);

  // Use a more reliable method to detect mobile without layout shift
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      dispatch({ type: "set_is_mobile", value: width < 1024 });
    };

    // Set initial value immediately
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleTabClick = (index: number) => {
    const fromTab = carouselCategories[activeTab].name;
    const toTab = carouselCategories[index].name;

    // Track tab switching
    trackImageEngagement({
      src: "tab-switch",
      alt: `Switched from ${fromTab} to ${toTab}`,
      caption: `Tab switch: ${fromTab} → ${toTab}`,
      category: "navigation",
      index,
      action: "click",
      location: "hero",
    });

    dispatch({ type: "set_active_tab", tab: index });
  };

  const updateCurrentIndex = useCallback(
    (carouselIndex: number, newIndex: number) => {
      const currentIndex = currentIndices[carouselIndex];
      const totalImages = carouselCategories[carouselIndex].images.length;

      if (newIndex === currentIndex) {
        return;
      }

      let direction: "forward" | "backward";

      if (currentIndex === totalImages - 1 && newIndex === 0) {
        direction = "forward";
      } else if (currentIndex === 0 && newIndex === totalImages - 1) {
        direction = "backward";
      } else if (newIndex > currentIndex) {
        direction = "forward";
      } else {
        direction = "backward";
      }

      setNavigationDirection(direction);
      dispatch({ type: "set_slide_index", carouselIndex, index: newIndex });
    },
    [carouselCategories, currentIndices]
  );

  const openLightbox = (image: HeroImage, carouselIndex: number) => {
    // console.log('openLightbox called with:', { image, carouselIndex });
    // console.log('carouselCategories[carouselIndex].images:', carouselCategories[carouselIndex].images);
    // console.log('currentIndices[carouselIndex]:', currentIndices[carouselIndex]);

    // Track lightbox open
    trackLightboxOpen({
      src: image.src,
      alt: image.alt,
      caption: image.caption,
      category: carouselCategories[carouselIndex].name,
      index: currentIndices[carouselIndex],
    });

    dispatch({
      type: "open_lightbox",
      currentIndex: currentIndices[carouselIndex],
      image,
      images: carouselCategories[carouselIndex].images,
      key: `lightbox-${Date.now()}-${currentIndices[carouselIndex]}`,
    });
    setLightboxOpenTime(Date.now());
  };

  const closeLightbox = () => {
    dispatch({ type: "close_lightbox" });
  };

  const navigateLightbox = useCallback(
    (direction: "prev" | "next") => {
      // console.log('navigateLightbox called with direction:', direction);
      // console.log('lightboxImages length:', lightboxImages.length);
      // console.log('current lightboxCurrentIndex:', lightboxCurrentIndex);

      if (lightboxImages.length === 0) {
        // console.log('No images to navigate');
        return;
      }

      const newIndex =
        direction === "next"
          ? (lightboxCurrentIndex + 1) % lightboxImages.length
          : (lightboxCurrentIndex - 1 + lightboxImages.length) %
            lightboxImages.length;

      // console.log('New index will be:', newIndex);

      // Update all states in sequence to prevent race conditions
      dispatch({
        type: "navigate_lightbox",
        direction: direction === "next" ? "forward" : "backward",
        image: lightboxImages[newIndex],
        index: newIndex,
        key: `lightbox-${Date.now()}-${newIndex}`,
      });
    },
    [lightboxImages, lightboxCurrentIndex]
  );

  // Preload images for the current carousel
  useEffect(() => {
    const currentImages = carouselCategories[activeTab].images;
    const currentIndex = currentIndices[activeTab];

    // Preload next 2 images
    for (let i = 1; i <= 2; i++) {
      const nextIndex = (currentIndex + i) % currentImages.length;
      const img = new window.Image();
      img.src = currentImages[nextIndex].src;
    }
  }, [activeTab, currentIndices, carouselCategories]);

  // Preload lightbox images when lightbox opens
  useEffect(() => {
    if (lightboxOpen && lightboxImages.length > 0) {
      // Preload next and previous images for smooth navigation
      const nextIndex = (lightboxCurrentIndex + 1) % lightboxImages.length;
      const prevIndex =
        (lightboxCurrentIndex - 1 + lightboxImages.length) %
        lightboxImages.length;

      const nextImg = new window.Image();
      const prevImg = new window.Image();

      nextImg.src = lightboxImages[nextIndex].src;
      prevImg.src = lightboxImages[prevIndex].src;
    }
  }, [lightboxOpen, lightboxImages, lightboxCurrentIndex]);

  // Cleanup timeouts on unmount
  useEffect(
    () => () => {
      if (keyboardNavigationTimeoutRef.current) {
        clearTimeout(keyboardNavigationTimeoutRef.current);
      }
    },
    []
  );

  // Listen for debug autoplay toggle events
  useEffect(() => {
    const handleAutoplayToggle = (event: CustomEvent) => {
      // console.log('Hero: Received autoplay toggle event:', event.detail);
      dispatch({
        type: "set_debug_autoplay_disabled",
        value: !event.detail.enabled,
      });
    };

    window.addEventListener(
      "carouselAutoplayToggle",
      handleAutoplayToggle as EventListener
    );

    return () => {
      window.removeEventListener(
        "carouselAutoplayToggle",
        handleAutoplayToggle as EventListener
      );
    };
  }, []);

  // Handle keyboard navigation and pause autoplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys when not in lightbox
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !lightboxOpen) {
        // Clear any existing timeout
        if (keyboardNavigationTimeoutRef.current) {
          clearTimeout(keyboardNavigationTimeoutRef.current);
        }

        // Pause autoplay immediately
        dispatch({ type: "set_pause_autoplay", value: true });

        // Set a new timeout to resume autoplay
        const timeout = setTimeout(() => {
          dispatch({ type: "set_pause_autoplay", value: false });
        }, 2000);

        keyboardNavigationTimeoutRef.current = timeout;

        // Small delay to let carousel animation complete before direction update
        setTimeout(() => {
          // This ensures the carousel finishes its animation before we update direction
        }, 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (keyboardNavigationTimeoutRef.current) {
        clearTimeout(keyboardNavigationTimeoutRef.current);
      }
    };
  }, [lightboxOpen]);

  // Show loading state until we know the screen size
  if (isMobile === undefined) {
    return (
      <div className="w-full space-y-6">
        <div className="w-full bg-stone-50/40 py-6 backdrop-blur-sm">
          <div className="container mx-auto text-pretty px-1 text-center font-bold sm:px-2">
            <h1 className="text-stone-950">
              <span className="block text-sm leading-relaxed sm:text-base lg:hidden">
                For well over a decade, our family has shared our Mexican
                heritage and old-school hospitality with the people of NWA.
              </span>
              <span className="hidden text-base lg:block">
                For well over a decade, our family has shared our Mexican
                heritage and old-school hospitality with the people of Northwest
                Arkansas.
              </span>
            </h1>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((placeholder) => (
              <div className="space-y-4" key={placeholder}>
                <div className="mx-auto h-8 w-36 animate-pulse rounded-full bg-stone-200/80" />
                <div className="aspect-video animate-pulse rounded-[1.75rem] bg-stone-200/80 shadow-lg" />
                <div className="mx-auto h-12 w-48 animate-pulse rounded-full bg-stone-200/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        transition={shouldReduceMotion ? { duration: 0 } : SOFT_ENTER}
      >
        <div className="w-full bg-stone-50/40 py-6 backdrop-blur-sm">
          <div className="container mx-auto text-pretty px-1 text-center font-bold sm:px-2">
            <h1 className="text-stone-950">
              <span className="block text-sm leading-relaxed sm:text-base lg:hidden lg:text-lg">
                For well over a decade, our family has shared our Mexican
                heritage and old-school hospitality with the people of NWA.
              </span>
              <span className="hidden text-lg lg:block">
                For well over a decade, our family has shared our Mexican
                heritage and old-school hospitality with the people of Northwest
                Arkansas.
              </span>
            </h1>
          </div>
        </div>

        {/* Mobile Tabs */}
        {isMobile && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            aria-label="Featured categories"
            className="my-4 grid grid-cols-3 gap-2 px-4"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            layout
            role="tablist"
            transition={shouldReduceMotion ? { duration: 0 } : SOFT_ENTER}
          >
            {carouselCategories.map((category, index) => {
              const isActive = activeTab === index;
              const tabId = `hero-tab-${index}`;
              const panelId = `hero-panel-${index}`;

              return (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  key={category.name}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.4,
                    delay: shouldReduceMotion ? 0 : index * 0.06,
                    ease: SOFT_EASE,
                  }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    aria-controls={panelId}
                    aria-selected={isActive}
                    className={cn(
                      "whitespace-nowrap px-2 text-center font-semibold text-sm",
                      isActive ? "scale-105 font-black" : "scale-100",
                      "transition-transform duration-150 ease-in-out",
                      "hover:bg-[#03502D]/10",
                      isActive &&
                        "bg-[#03502D] text-stone-50 hover:bg-[#03502D]/90"
                    )}
                    id={tabId}
                    onClick={() => handleTabClick(index)}
                    role="tab"
                    tabIndex={isActive ? 0 : -1}
                    type="button"
                    variant={isActive ? "default" : "ghost"}
                  >
                    {category.mobileName}
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
        {/* Desktop: Three separate carousels */}
        {!isMobile && (
          <div className="flex w-full justify-center px-3 lg:px-4">
            <div className="mx-auto w-full max-w-[88rem]">
              <div className="grid grid-cols-3 gap-3 xl:gap-5">
                {carouselCategories.map((category, index) => {
                  // console.log('Rendering category:', category.name, 'isDailyDrinks:', category.isDailyDrinks);
                  return (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, y: 14 }
                      }
                      key={category.name}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.5,
                        delay: shouldReduceMotion ? 0 : index * 0.08,
                        ease: SOFT_EASE,
                      }}
                    >
                      <h3
                        className="mx-auto w-fit border-b-4 pb-1 text-center font-bold text-lg text-stone-900"
                        style={{ borderBottomColor: headingColors[index] }}
                      >
                        {category.name}
                      </h3>
                      <HeroCarousel
                        carouselIndex={index}
                        categoryName={category.name}
                        disableKeyboard={lightboxOpen}
                        images={category.images}
                        isDailyDrinks={category.isDailyDrinks}
                        isDailySpecials={category.isDailySpecials}
                        isMobile={isMobile}
                        onImageClick={openLightbox}
                        pauseAutoplay={
                          lightboxOpen || pauseAutoplay || debugAutoplayDisabled
                        }
                        setCurrentIndex={(newIndex) =>
                          updateCurrentIndex(index, newIndex)
                        }
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile: Single carousel with tabs */}
        {isMobile && (
          <div className="flex w-full justify-center px-0">
            <div className="w-full max-w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
                  key={activeTab}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.4,
                    ease: SOFT_EASE,
                  }}
                >
                  <HeroCarousel
                    carouselIndex={activeTab}
                    categoryName={carouselCategories[activeTab].name}
                    disableKeyboard={lightboxOpen}
                    images={carouselCategories[activeTab].images}
                    isDailyDrinks={carouselCategories[activeTab].isDailyDrinks}
                    isDailySpecials={
                      carouselCategories[activeTab].isDailySpecials
                    }
                    isMobile={isMobile}
                    onImageClick={openLightbox}
                    pauseAutoplay={
                      lightboxOpen || pauseAutoplay || debugAutoplayDisabled
                    }
                    setCurrentIndex={(newIndex) =>
                      updateCurrentIndex(activeTab, newIndex)
                    }
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="w-full text-pretty bg-stone-50/40 py-6 text-center font-semibold text-stone-950 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="space-y-4">
              <p className="font-semibold text-sm leading-relaxed sm:text-base lg:text-lg">
                <span className="block lg:hidden">
                  Time-honored family recipes, passed down through generations.
                  <br />
                  Made fresh daily.
                </span>
                <span className="hidden lg:block">
                  Time-honored family recipes, passed down through generations.
                  Made fresh daily.
                </span>
              </p>

              <p className="font-semibold text-sm leading-relaxed sm:text-base lg:text-lg">
                <span className="block lg:hidden">
                  Savor traditional dishes and handcrafted margaritas
                  <br />
                  in a warm, family-friendly atmosphere.
                </span>
                <span className="hidden lg:block">
                  Savor traditional dishes and handcrafted margaritas in a warm,
                  family-friendly atmosphere.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* View Full Menu and Catering Buttons */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4 pt-6 pb-4 sm:flex-row"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.5,
            delay: shouldReduceMotion ? 0 : 0.18,
            ease: SOFT_EASE,
          }}
        >
          {/* View Full Menu Button */}
          <motion.div
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 font-bold text-lg text-white shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
              href="/menu"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = menuColors.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = menuColors.bg;
              }}
              style={
                {
                  backgroundColor: menuColors.bg,
                  "--hover-bg": menuColors.hover,
                } as React.CSSProperties & { "--hover-bg": string }
              }
            >
              <motion.span
                className="relative z-20 flex items-center gap-2"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                whileHover={{ x: 2 }}
              >
                View Full Menu
                <motion.svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  viewBox="0 0 24 24"
                  whileHover={{ x: 2 }}
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </motion.svg>
              </motion.span>
              <motion.div
                className="absolute inset-0 scale-75 rounded-full bg-gradient-to-r from-white/20 to-white/10 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </Link>
          </motion.div>

          {/* Catering Button */}
          <motion.div
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 font-bold text-lg text-white shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none"
              href="/contact?catering=true"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = cateringColors.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = cateringColors.bg;
              }}
              style={
                {
                  backgroundColor: cateringColors.bg,
                  "--hover-bg": cateringColors.hover,
                } as React.CSSProperties & { "--hover-bg": string }
              }
            >
              <motion.span
                className="relative z-20 flex items-center gap-2"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                whileHover={{ x: 2 }}
              >
                Catering
                <motion.svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  viewBox="0 0 24 24"
                  whileHover={{ x: 2 }}
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </motion.svg>
              </motion.span>
              <motion.div
                className="absolute inset-0 scale-75 rounded-full bg-gradient-to-r from-white/20 to-white/10 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </Link>
          </motion.div>

          {/* Drinks & Margaritas Button */}
          <motion.div
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#1DB2B2] px-6 py-3 font-bold text-lg text-white shadow-lg transition-all duration-300 hover:bg-[#0B8489] hover:shadow-xl focus:outline-none"
              href="/menu?tab=7"
            >
              <motion.span
                className="relative z-20 flex items-center gap-2"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                whileHover={{ x: 2 }}
              >
                <span className="lg:hidden">Margaritas</span>
                <span className="hidden lg:inline">Margaritas & More</span>
                <motion.svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  viewBox="0 0 24 24"
                  whileHover={{ x: 2 }}
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </motion.svg>
              </motion.span>
              <motion.div
                className="absolute inset-0 scale-75 rounded-full bg-gradient-to-r from-white/20 to-white/10 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </Link>
          </motion.div>
        </motion.div>

        <LightboxModal
          direction={lightboxDirection}
          image={lightboxImage}
          images={lightboxImages}
          isOpen={lightboxOpen}
          lightboxKey={lightboxKey}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      </motion.div>
    </LazyMotion>
  );
};

export default Hero;
