'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Star } from 'lucide-react';
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

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 3333);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="rounded-xl bg-stone-50/80 py-8 shadow-lg backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="mb-8 text-center font-bold text-[#0f8540] text-xl">
          Our Commitment to Excellence
        </h2>
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{
                duration: 0.9,
                ease: 'easeOut',
              }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
            >
              <div
                className="mb-4 flex justify-center"
                aria-label={`Rating: ${testimonials[current].rating} out of 5 stars`}
              >
                {[...new Array(testimonials[current].rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-8 w-8 fill-[#CE1226] text-[#CE1226]"
                  />
                ))}
              </div>
              <blockquote className="mb-4 max-w-xl text-pretty text-center text-base text-gray-800">
                "{testimonials[current].text}"
              </blockquote>
              <cite className="font-semibold text-[#0f8540] text-lg not-italic">
                {testimonials[current].name}
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <Button
              type="button"
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                current === index ? 'w-6 bg-[#CE1226]' : 'bg-gray-300'
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
