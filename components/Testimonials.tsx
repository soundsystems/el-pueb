'use client';

import { CONFETTI_COLORS } from '@/lib/constants/colors';
import { reviews } from '@/lib/constants/reviews';
import { Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
const SENTENCE_SPLITTER = /(?<=[.!?])\s+/;

function splitIntoSentences(text: string) {
  return text.split(SENTENCE_SPLITTER);
}

function formatName(fullName: string) {
  const [firstName, lastName] = fullName.split(' ');
  return `${firstName} ${lastName ? `${lastName[0]}.` : ''}`;
}

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isUserNavigated, setIsUserNavigated] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);
  const [testimonials, setTestimonials] = useState(() => reviews.slice(0, 8));
  const [dotColors, setDotColors] = useState(() => CONFETTI_COLORS.slice(0, 8));
  const measureRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Randomly select testimonials and colors on client-side only
  useEffect(() => {
    const randomTestimonials = [...reviews]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
    const randomColors = [...CONFETTI_COLORS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
    setTestimonials(randomTestimonials);
    setDotColors(randomColors);
  }, []);

  // Calculate max height on mount
  useEffect(() => {
    if (!contentRef.current) return;

    const height = contentRef.current.offsetHeight;
    setMaxHeight(height + 32); // Add some padding
  }, []); // Empty dependency array since we only need to measure once

  useEffect(() => {
    if (isPaused) {
      const resumeTimer = setTimeout(() => {
        setIsPaused(false);
        setIsUserNavigated(false);
      }, 6000);
      return () => clearTimeout(resumeTimer);
    }

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  const handleDotClick = (index: number) => {
    setIsUserNavigated(true);
    // Small delay to ensure exit animation starts first
    setTimeout(() => {
      setCurrent(index);
      setIsPaused(true);
    }, 10);
  };

  return (
    <section className="w-full rounded-xl bg-stone-50/50 py-10 shadow-lg backdrop-blur-sm">
      <div className="mx-auto w-full max-w-screen-lg px-2 md:px-8 lg:px-12">
        <h2 className="mb-8 text-center font-bold text-[#0f8540] text-xl md:text-2xl lg:text-3xl">
          Our Commitment to Excellence
        </h2>

        {/* Hidden div to measure content */}
        <div className="-left-[9999px] -top-[9999px] invisible fixed">
          <div
            ref={contentRef}
            className="flex flex-col items-center justify-center py-16 md:py-8"
          >
            <div className="mb-4 flex justify-center">
              {[...new Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6" />
              ))}
            </div>
            <div className="w-full max-w-xl px-1 lg:max-w-4xl">
              <blockquote className="mb-4 text-pretty text-center text-base text-gray-800">
                {testimonials.reduce(
                  (longest, t) =>
                    t.text.length > longest.length ? t.text : longest,
                  ''
                )}
              </blockquote>
              <cite className="block text-center">
                <span className="block font-semibold text-[#0f8540] text-lg not-italic">
                  Name
                </span>
                <span className="block text-gray-600 text-sm">Location</span>
              </cite>
            </div>
          </div>
        </div>

        <div
          ref={measureRef}
          className="relative"
          style={{ height: maxHeight || 'auto' }}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{
                duration: isUserNavigated ? 0.33 : 0.9,
                ease: 'easeOut',
              }}
              onAnimationComplete={() => {
                if (isUserNavigated) {
                  setIsUserNavigated(false);
                }
              }}
              className="absolute inset-0 flex flex-col items-center justify-center py-14 md:py-8"
            >
              <div
                className="mb-4 flex justify-center"
                aria-label={`Rating: ${testimonials[current].rating} out of 5 stars`}
              >
                {[...new Array(testimonials[current].rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 fill-[#CE1226] text-[#CE1226]"
                  />
                ))}
              </div>
              <div className="w-full max-w-xl px-1 lg:max-w-4xl">
                <blockquote className="mb-4 text-pretty text-center text-base text-gray-800">
                  <span className="block lg:hidden">
                    {splitIntoSentences(testimonials[current].text).map(
                      (sentence, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          {sentence.trim()}
                        </p>
                      )
                    )}
                  </span>
                  <span className="hidden lg:block">
                    "{testimonials[current].text}"
                  </span>
                </blockquote>
                <cite className="block text-center">
                  <span
                    className="block font-semibold text-lg not-italic"
                    style={{
                      color: dotColors[current],
                      filter: 'brightness(60%)',
                    }}
                  >
                    {formatName(testimonials[current].name)}
                  </span>
                  <span className="block text-gray-600 text-sm">
                    {testimonials[current].location}
                  </span>
                </cite>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-1.5 md:gap-2">
          {testimonials.map((_, index) => (
            <Button
              type="button"
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ease-in-out hover:opacity-80 md:h-2 md:w-2 ${
                current === index ? 'w-4 md:w-6' : ''
              }`}
              style={{
                backgroundColor: dotColors[index],
                opacity: current === index ? 1 : 0.5,
                filter:
                  current === index ? 'brightness(100%)' : 'brightness(70%)',
                transition:
                  'opacity 0.3s ease-in-out, width 0.3s ease-in-out, background-color 0.3s ease-in-out',
              }}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-selected={current === index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
