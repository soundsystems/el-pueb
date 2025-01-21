'use client';

import { Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

const testimonials = [
  {
    name: 'Maria R.',
    text: "The most authentic Mexican food in NWA! Their handmade tortillas remind me of my grandmother's cooking.",
    rating: 5,
  },
  {
    name: 'John D.',
    text: "Best guacamole I've ever had! The staff treats you like family every time you visit.",
    rating: 5,
  },
  {
    name: 'Sarah M.',
    text: 'Their new Highfill location is beautiful! Love the outdoor seating area and the service is always excellent.',
    rating: 5,
  },
  {
    name: 'Michael T.',
    text: 'The fajitas are out of this world! Sizzling hot and packed with flavor. A must-try!',
    rating: 5,
  },
  {
    name: 'Emily L.',
    text: "I'm obsessed with their street tacos. So simple yet so delicious. I could eat them every day!",
    rating: 5,
  },
  {
    name: 'David W.',
    text: 'The margaritas here are the perfect blend of tart and sweet. Best in town, hands down!',
    rating: 5,
  },
  {
    name: 'Sophia K.',
    text: 'As a vegetarian, I appreciate the variety of options. The veggie enchiladas are my go-to!',
    rating: 5,
  },
  {
    name: 'Robert J.',
    text: 'The atmosphere is so warm and inviting. It feels like dining in a little piece of Mexico.',
    rating: 5,
  },
];

const SENTENCE_SPLITTER = /(?<=[.!?])\s+/;

function splitIntoSentences(text: string) {
  return text.split(SENTENCE_SPLITTER);
}

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isUserNavigated, setIsUserNavigated] = useState(false);

  useEffect(() => {
    if (isPaused) {
      const resumeTimer = setTimeout(() => {
        setIsPaused(false);
        setIsUserNavigated(false);
      }, 4000);
      return () => clearTimeout(resumeTimer);
    }

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 3333);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleDotClick = (index: number) => {
    setIsUserNavigated(true);
    // Small delay to ensure exit animation starts first
    setTimeout(() => {
      setCurrent(index);
      setIsPaused(true);
    }, 10);
  };

  return (
    <section className="w-full rounded-xl bg-stone-50/80 py-8 shadow-lg backdrop-blur-sm">
      <div className="mx-auto w-full max-w-screen-lg px-2 md:px-8 lg:px-12">
        <h2 className="mb-6 text-center font-bold text-[#0f8540] text-xl">
          Our Commitment to Excellence
        </h2>
        <div className="relative min-h-[200px]">
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
              className="absolute inset-0 flex flex-col items-center justify-center"
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
                <cite className="block text-center font-semibold text-[#0f8540] text-lg not-italic">
                  {testimonials[current].name}
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
              className={`h-1.5 w-1.5 rounded-full transition-all md:h-2 md:w-2 ${
                current === index ? 'w-4 bg-[#CE1226] md:w-6' : 'bg-gray-300'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-selected={current === index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
