"use client";

import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m as motion,
} from "framer-motion";
import { Star } from "lucide-react";
import { Fragment, useEffect, useReducer, useRef } from "react";
import {
  formatForDesktop,
  highlightMenuItems,
  reviews,
  selectReviewsByTier,
  splitIntoSentences,
} from "@/lib/constants/reviews";
import {
  formatReviewDate,
  getSourceIcon,
  getSourceLabel,
} from "@/lib/utils/dateFormatter";
import { Button } from "./ui/button";
import { LoadingSpinner } from "./ui/loading";

function formatName(fullName: string) {
  const [firstName, lastName] = fullName.split(" ");
  return `${firstName} ${lastName ? `${lastName[0]}.` : ""}`;
}

interface TestimonialCarouselProps {
  debugMode?: boolean;
}

interface TestimonialsState {
  current: number;
  debugMode: boolean;
  dotColors: string[];
  isHeightCalculated: boolean;
  isHolding: boolean;
  isPaused: boolean;
  isSmallScreen: boolean;
  maxHeight: number;
  testimonials: typeof reviews;
  touchEnd: number | null;
  touchStart: number | null;
}

type TestimonialsAction =
  | { type: "go_to"; index: number }
  | { type: "initialize"; dotColors: string[]; testimonials: typeof reviews }
  | { type: "pause"; value: boolean }
  | {
      type: "set_layout";
      isHeightCalculated: boolean;
      isSmallScreen: boolean;
      maxHeight: number;
    }
  | { type: "set_holding"; value: boolean }
  | { type: "set_touch_end"; value: number | null }
  | { type: "set_touch_start"; value: number | null }
  | { type: "step"; amount: number }
  | { type: "sync_debug_mode"; value: boolean };

function wrapIndex(index: number, length: number) {
  if (length === 0) {
    return 0;
  }

  return (index + length) % length;
}

function testimonialsReducer(
  state: TestimonialsState,
  action: TestimonialsAction
): TestimonialsState {
  switch (action.type) {
    case "go_to":
      return { ...state, current: action.index, isPaused: true };
    case "initialize":
      return {
        ...state,
        current:
          state.current >= action.testimonials.length ? 0 : state.current,
        dotColors: action.dotColors,
        testimonials: action.testimonials,
      };
    case "pause":
      return { ...state, isPaused: action.value };
    case "set_holding":
      return { ...state, isHolding: action.value };
    case "set_layout":
      return {
        ...state,
        isHeightCalculated: action.isHeightCalculated,
        isSmallScreen: action.isSmallScreen,
        maxHeight: action.maxHeight,
      };
    case "set_touch_end":
      return { ...state, touchEnd: action.value };
    case "set_touch_start":
      return { ...state, touchStart: action.value };
    case "step":
      return {
        ...state,
        current: wrapIndex(
          state.current + action.amount,
          state.testimonials.length
        ),
        isPaused: true,
      };
    case "sync_debug_mode":
      return { ...state, debugMode: action.value };
    default:
      return state;
  }
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

function createTextPartKey(keyPrefix: string, part: string) {
  return `${keyPrefix}-${part.replaceAll(/\s+/g, "-").slice(0, 80)}`;
}

function HighlightedReviewText({
  color,
  keyPrefix,
  text,
}: {
  color: string;
  keyPrefix: string;
  text: string;
}) {
  const highlighted = highlightMenuItems(text, color);
  const parts = highlighted.split(/(<a [^>]+>.*?<\/a>)/g).filter(Boolean);

  return parts.map((part) => {
    const match = part.match(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/);

    if (!match) {
      return (
        <Fragment key={createTextPartKey(keyPrefix, part)}>{part}</Fragment>
      );
    }

    const [, href, label] = match;
    const key = createTextPartKey(keyPrefix, `${href}-${label}`);

    if (href.startsWith("javascript:void")) {
      return (
        <button
          className="font-inherit text-[#D42D40] underline transition-all duration-200 hover:brightness-75"
          key={key}
          onClick={() =>
            (
              window as unknown as {
                openEventDialog?: () => void;
              }
            ).openEventDialog?.()
          }
          type="button"
        >
          {label}
        </button>
      );
    }

    return (
      <a
        className="text-[#D42D40] underline transition-all duration-200 hover:brightness-75"
        href={href}
        key={key}
      >
        {label}
      </a>
    );
  });
}

export default function TestimonialCarousel({
  debugMode: externalDebugMode = false,
}: TestimonialCarouselProps) {
  const [state, dispatch] = useReducer(testimonialsReducer, {
    current: 0,
    debugMode: externalDebugMode,
    dotColors: [],
    isHeightCalculated: false,
    isHolding: false,
    isPaused: false,
    isSmallScreen: false,
    maxHeight: 0,
    testimonials: reviews.slice(0, 8),
    touchEnd: null,
    touchStart: null,
  });
  const {
    current,
    debugMode,
    dotColors,
    isHeightCalculated,
    isHolding,
    isPaused,
    isSmallScreen,
    maxHeight,
    testimonials,
    touchEnd,
    touchStart,
  } = state;
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up global function for opening event dialog
  useEffect(() => {
    (window as unknown as { openEventDialog?: () => void }).openEventDialog =
      () => {
        window.location.href = "/contact?event=true";
      };

    return () => {
      (window as unknown as { openEventDialog?: () => void }).openEventDialog =
        undefined;
    };
  }, []);

  // Load testimonials using tiered system (re-selects on screen size change)
  useEffect(() => {
    const { selectedReviews, selectedColors } = selectReviewsByTier(
      reviews,
      8,
      debugMode || externalDebugMode,
      isSmallScreen
    );

    dispatch({
      type: "initialize",
      dotColors: selectedColors,
      testimonials: selectedReviews,
    });

    // Debug logging removed for production
  }, [debugMode, externalDebugMode, isSmallScreen]);

  // Sync internal debugMode with external changes
  useEffect(() => {
    if (externalDebugMode !== debugMode) {
      dispatch({ type: "sync_debug_mode", value: externalDebugMode });
    }
  }, [externalDebugMode, debugMode]);

  // Handle screen size changes and height calculation
  useEffect(() => {
    const checkScreenSize = () => {
      const newIsSmallScreen = window.innerWidth < 620;

      // Find the longest review from all testimonials
      const longestReview = testimonials.reduce(
        (longest, t) => (t.text.length > longest.length ? t.text : longest),
        ""
      );

      // Analyze the longest review by content units
      const sentences = splitIntoSentences(longestReview);
      const words = longestReview.split(/\s+/).length;
      const sentenceCount = sentences.length;
      const reviewLength = longestReview.length;

      // Determine review tier for optimized padding
      let reviewTier:
        | "tiny-1"
        | "tiny-2"
        | "short"
        | "medium"
        | "long"
        | "extra-long";
      if (reviewLength <= 25) {
        reviewTier = "tiny-1";
      } else if (reviewLength <= 50) {
        reviewTier = "tiny-2";
      } else if (reviewLength <= 150) {
        reviewTier = "medium";
      } else if (reviewLength <= 300) {
        reviewTier = "long";
      } else {
        reviewTier = "extra-long";
      }

      // Calculate height based on content units
      let estimatedTextHeight;
      if (newIsSmallScreen) {
        // Mobile: Each sentence gets its own line with spacing
        const lineHeight = 18; // Conservative line height for mobile
        const sentenceSpacing = 8; // Conservative spacing between sentences
        estimatedTextHeight =
          sentenceCount * lineHeight + (sentenceCount - 1) * sentenceSpacing;
      } else {
        // Desktop: Estimate based on words and average line length
        const avgWordsPerLine = 20; // More words per line for desktop
        const lineHeight = 18; // Tighter line height for desktop
        const estimatedLines = Math.ceil(words / avgWordsPerLine);
        estimatedTextHeight = estimatedLines * lineHeight;
      }

      // Calculate additional space needed for other elements
      const starsHeight = 24; // 6 stars * 4px height
      const starsMarginBottom = 24; // mb-6 below stars
      const blockquoteMarginBottom = 24; // mb-6 below blockquote
      const nameHeight = newIsSmallScreen ? 24 : 32; // Name line height
      const locationHeight = newIsSmallScreen ? 20 : 28; // Location line height
      const sourceDateHeight = newIsSmallScreen ? 20 : 28; // Source/date line height
      const sourceDateMarginTop = 8; // mt-2 above source/date
      const containerPaddingTop = newIsSmallScreen ? 8 : 24; // pt-2 md:py-6
      const containerPaddingBottom = newIsSmallScreen ? 24 : 24; // pb-6 md:py-6
      const innerPadding = 8; // px-2 on inner container

      // Use the estimated text height plus fixed component heights
      const totalHeight =
        estimatedTextHeight +
        starsHeight +
        starsMarginBottom +
        blockquoteMarginBottom +
        nameHeight +
        locationHeight +
        sourceDateMarginTop +
        sourceDateHeight +
        containerPaddingTop +
        containerPaddingBottom +
        innerPadding * 2;

      // Optimized buffer based on review tier
      let tierBasedBuffer;
      if (reviewTier === "tiny-1") {
        // Tiny reviews (≤25 chars): minimal padding
        tierBasedBuffer = newIsSmallScreen ? 8 : 5;
      } else if (reviewTier === "tiny-2") {
        // Tiny reviews (26-50 chars): minimal padding
        tierBasedBuffer = newIsSmallScreen ? 13 : 8;
      } else if (reviewTier === "medium") {
        // Medium reviews (51-150 chars): moderate padding
        tierBasedBuffer = newIsSmallScreen ? 30 : 10;
      } else if (reviewTier === "long") {
        // Long reviews (151-300 chars): generous padding
        tierBasedBuffer = newIsSmallScreen ? 55 : 25;
      } else {
        // Extra-long reviews (>300 chars): maximum padding
        tierBasedBuffer = newIsSmallScreen ? 80 : 60;
      }

      // Additional sentence-based buffer (reduced for shorter reviews and desktop)
      const sentenceBuffer = Math.floor(
        sentenceCount *
          (reviewTier === "tiny-1" || reviewTier === "tiny-2"
            ? 4
            : newIsSmallScreen
              ? 8
              : 5)
      );
      const finalBuffer = tierBasedBuffer + sentenceBuffer;

      const finalHeight = totalHeight + finalBuffer;

      // Cap the height at 100% of screen height with padding
      const maxScreenHeight = window.innerHeight * 1.0 - 40; // Subtract 40px for padding
      const cappedHeight = Math.min(finalHeight, maxScreenHeight);

      // Height calculation completed

      dispatch({
        type: "set_layout",
        isHeightCalculated: true,
        isSmallScreen: newIsSmallScreen,
        maxHeight: cappedHeight,
      });
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [testimonials]); // Only recalculate when testimonials change or forced recalculation

  // Height recalculation tracking

  useEffect(() => {
    if (isPaused) {
      pauseTimerRef.current = setTimeout(() => {
        dispatch({ type: "pause", value: false });
      }, 6000);
      return () => {
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
        }
      };
    }

    const timer = setInterval(() => {
      dispatch({ type: "step", amount: 1 });
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        dispatch({ type: "step", amount: -1 });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        dispatch({ type: "step", amount: 1 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDotClick = (index: number) => {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      dispatch({ type: "go_to", index });
    }, 10);
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    dispatch({ type: "set_touch_end", value: null });
    dispatch({ type: "set_touch_start", value: e.targetTouches[0].clientX });

    // Start hold timer for tap-to-pause functionality
    dispatch({ type: "set_holding", value: true });
    holdTimerRef.current = setTimeout(() => {
      if (isHolding) {
        dispatch({ type: "pause", value: true });
        pauseTimerRef.current = setTimeout(() => {
          dispatch({ type: "pause", value: false });
        }, 3000);
      }
    }, 500); // 500ms hold to trigger pause
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    dispatch({ type: "set_touch_end", value: e.targetTouches[0].clientX });

    // Cancel hold timer if user is swiping
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    dispatch({ type: "set_holding", value: false });
  };

  const handleTouchEnd = () => {
    const hasValidTouch = touchStart !== null && touchEnd !== null;

    if (!hasValidTouch) {
      // If it's a tap (no swipe), handle tap-to-pause
      if (isHolding && holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
        dispatch({ type: "pause", value: true });
        pauseTimerRef.current = setTimeout(() => {
          dispatch({ type: "pause", value: false });
        }, 3000);
      }
      dispatch({ type: "set_holding", value: false });
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Swipe left - go to next testimonial
      dispatch({ type: "step", amount: 1 });
    } else if (isRightSwipe) {
      // Swipe right - go to previous testimonial
      dispatch({ type: "step", amount: -1 });
    }

    dispatch({ type: "set_holding", value: false });
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // Cleanup hold timer on unmount
  useEffect(
    () => () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    },
    []
  );

  // Don't render until height is calculated
  if (!isHeightCalculated) {
    return (
      <section className="w-full rounded-xl bg-stone-50/40 pb-10 shadow-lg backdrop-blur-sm">
        <div className="mx-auto w-full max-w-screen-lg px-4 md:px-16 lg:px-20">
          <div className="mb-6 flex items-center justify-between pt-4">
            <h2 className="flex-1 text-center font-black text-3xl text-zinc-950 md:text-4xl">
              Our Commitment to Excellence
            </h2>
          </div>
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size={50} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="w-full rounded-xl bg-stone-50/40 pt-2 pb-10 shadow-lg backdrop-blur-sm">
        <div className="mx-auto w-full max-w-screen-lg px-4 md:px-16 lg:px-20">
          <div className="mb-6 flex items-center justify-center pt-4">
            <h2 className="text-center font-black text-2xl text-zinc-950 md:text-3xl lg:text-4xl">
              Our Commitment to Excellence
            </h2>
          </div>

          <div className="group relative">
            {/* Left Arrow - Hidden on mobile */}
            <button
              aria-label="Previous testimonial"
              className="absolute top-1/2 -left-6 z-20 hidden h-8 w-8 -translate-y-1/2 rounded-full border border-yellow-400 bg-black/50 text-zinc-50 opacity-0 transition-all duration-200 hover:scale-110 hover:border-yellow-400 hover:bg-yellow-400 group-hover:opacity-100 md:block"
              onClick={() => {
                dispatch({ type: "step", amount: -1 });
              }}
              type="button"
            >
              <svg
                className="mx-auto h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Previous testimonial</title>
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>

            {/* Right Arrow - Hidden on mobile */}
            <button
              aria-label="Next testimonial"
              className="absolute top-1/2 -right-6 z-20 hidden h-8 w-8 -translate-y-1/2 rounded-full border border-yellow-400 bg-black/50 text-zinc-50 opacity-0 transition-all duration-200 hover:scale-110 hover:border-yellow-400 hover:bg-yellow-400 group-hover:opacity-100 md:block"
              onClick={() => {
                dispatch({ type: "step", amount: 1 });
              }}
              type="button"
            >
              <svg
                className="mx-auto h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Next testimonial</title>
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                className="relative touch-pan-y"
                key={`${current}-${isSmallScreen ? "mobile" : "desktop"}`}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onTouchStart={handleTouchStart}
                style={{
                  height: maxHeight || "auto",
                  maxHeight: maxHeight || "auto",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col items-center justify-center pt-2 pb-6 md:py-4"
                  initial={{ opacity: 0, x: 40 }}
                  key={`content-${current}`}
                  transition={{
                    duration: 0.9,
                    ease: "easeOut",
                  }}
                >
                  <div
                    aria-label={`Rating: ${testimonials[current].rating || 5} out of 5 stars`}
                    className="mb-6 flex justify-center"
                    role="img"
                  >
                    {STAR_VALUES.slice(
                      0,
                      testimonials[current].rating || 5
                    ).map((starValue) => (
                      <Star
                        className="h-6 w-6 fill-red-600 text-red-600 drop-shadow-sm"
                        key={`rating-star-${testimonials[current].name}-${testimonials[current].date}-${starValue}`}
                        style={{
                          filter:
                            "drop-shadow(0 1px 2px rgba(220, 38, 38, 0.3))",
                        }}
                      />
                    ))}
                  </div>
                  <div className="w-full max-w-max px-2 lg:max-w-4xl">
                    <blockquote className="mb-6 text-pretty text-center font-medium text-sm text-stone-950 md:text-base lg:text-lg">
                      <span className="block lg:hidden">
                        {splitIntoSentences(testimonials[current].text).map(
                          (sentence) => (
                            <p
                              className="mb-2 last:mb-0"
                              key={`${testimonials[current].name}-${sentence.trim().replaceAll(/\s+/g, "-").slice(0, 40)}`}
                              style={{ textWrap: "balance" }}
                            >
                              <HighlightedReviewText
                                color={dotColors[current]}
                                keyPrefix={`mobile-${testimonials[current].name}-${sentence.trim().replaceAll(/\s+/g, "-").slice(0, 24)}`}
                                text={sentence.trim()}
                              />
                            </p>
                          )
                        )}
                      </span>
                      <span
                        className="prose prose-stone mx-auto hidden whitespace-pre-line leading-relaxed lg:block"
                        style={{ textWrap: "balance" }}
                      >
                        "
                        <HighlightedReviewText
                          color={dotColors[current]}
                          keyPrefix={`desktop-${testimonials[current].name}`}
                          text={formatForDesktop(
                            testimonials[current].text,
                            isSmallScreen
                          )}
                        />
                        "
                      </span>
                    </blockquote>
                    <cite className="block text-center">
                      <span
                        className="block text-lg not-italic md:text-xl"
                        style={{
                          color: dotColors[current],
                          filter: "brightness(60%)",
                        }}
                      >
                        {formatName(testimonials[current].name)}
                      </span>
                      <span className="block font-semibold text-sm text-stone-700 md:text-base lg:text-lg">
                        {testimonials[current].location}
                      </span>
                      <div className="mt-2 flex items-center justify-center gap-2 text-sm text-stone-600">
                        <span className="flex items-center gap-1">
                          <span>
                            {getSourceIcon(testimonials[current].source)}
                          </span>
                          <span>
                            {getSourceLabel(testimonials[current].source)}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          {formatReviewDate(testimonials[current].date)}
                        </span>
                      </div>
                    </cite>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-center gap-1.5 md:gap-2">
            {testimonials.map((_, index) => (
              <Button
                aria-label={`Go to testimonial ${index + 1}`}
                aria-selected={current === index}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ease-in-out hover:opacity-80 md:h-2 md:w-2 ${
                  current === index ? "w-4 md:w-6" : ""
                }`}
                key={`testimonial-dot-${testimonials[index].name}-${testimonials[index].date}`}
                onClick={() => handleDotClick(index)}
                style={{
                  backgroundColor: dotColors[index],
                  opacity: current === index ? 1 : 0.5,
                  filter:
                    current === index ? "brightness(100%)" : "brightness(70%)",
                  transition:
                    "opacity 0.3s ease-in-out, width 0.3s ease-in-out, background-color 0.3s ease-in-out",
                }}
                type="button"
              />
            ))}
          </div>

          <div className="mt-6 -mb-4 text-center">
            <p className="text-sm text-stone-800 lg:text-base">
              These reviews are sourced from Google and Yelp.
              <a
                className="ml-1 font-semibold text-[#0f8540] hover:underline"
                href="https://www.google.com/search?sca_esv=a2d1b3f2df31e648&tbm=lcl&q=el+pueblito+mexican+restaurant+arkansas#"
                rel="noopener noreferrer"
                target="_blank"
              >
                <br />
                Leave a review
              </a>{" "}
              to see your feedback featured here!
            </p>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
