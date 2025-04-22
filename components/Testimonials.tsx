'use client';

import { CONFETTI_COLORS } from '@/lib/constants/colors';
import { reviews, formatForDesktop, splitIntoSentences } from '@/lib/constants/reviews';
import { Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

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
  const [isSmallScreen, setIsSmallScreen] = useState(false);

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

    // Find the longest review and format it
    const longestReview = testimonials.reduce(
      (longest, t) => (t.text.length > longest.length ? t.text : longest),
      ''
    );
    const formattedText = formatForDesktop(longestReview, isSmallScreen);

    // Create a temporary element to measure the formatted text
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.width = '100%';
    tempElement.style.fontSize = '1rem'; // Match the font size used in the component
    tempElement.style.lineHeight = '1.5'; // Match the line height used in the component
    tempElement.style.whiteSpace = 'pre-wrap'; // Ensure line breaks are considered
    tempElement.innerText = formattedText;
    document.body.appendChild(tempElement);

    const height = tempElement.offsetHeight;
    setMaxHeight(height + 140); // Add more padding to ensure space

    // Clean up the temporary element
    document.body.removeChild(tempElement);
  }, [testimonials, isSmallScreen]); // Recalculate if testimonials or screen size change

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 620);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    <section className="w-full rounded-xl bg-stone-50/40 pb-10 pt-4 shadow-lg backdrop-blur-sm">
      <div className="mx-auto w-full max-w-screen-lg px-4 md:px-10 lg:px-14">
        <h2 className="mb-10 text-center font-black text-[#0f8540] text-2xl md:text-3xl">
          Our Commitment to Excellence
        </h2>

        {/* Hidden div to measure content */}
        <div className="-left-[9999px] -top-[9999px] invisible fixed">
          <div
            ref={contentRef}
            className="flex flex-col items-center justify-center py-20 md:py-16"
          >
            <div className="mb-6 flex justify-center">
              {[...new Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6" />
              ))}
            </div>
            <div className="w-full max-w-xl px-2 lg:max-w-4xl">
              <blockquote className="mb-6 text-pretty text-center text-base font-bold text-stone-900">
                {splitIntoSentences(testimonials[current].text).map(
                  (sentence, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {sentence.trim()}
                    </p>
                  )
                )}
              </blockquote>
              <cite className="block text-center">
                <span className="block font-black text-[#0f8540] text-lg md:text-xl not-italic">
                  Name
                </span>
                <span className="block text-stone-800 text-sm">Location</span>
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
              className="absolute inset-0 flex flex-col items-center justify-center py-20 md:py-16"
              style={{ height: maxHeight }}
            >
              <div
                className="mb-6 flex justify-center"
                aria-label={`Rating: ${testimonials[current].rating} out of 5 stars`}
              >
                {[...new Array(testimonials[current].rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 fill-[#CE1226] text-[#CE1226]"
                  />
                ))}
              </div>
              <div className="w-full max-w-max px-2 lg:max-w-4xl">
                <blockquote className="mb-6 text-pretty text-center text-base font-medium lg:text-lg text-stone-950s">
                  <span className="block lg:hidden">
                    {splitIntoSentences(testimonials[current].text).map(
                      (sentence, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          {sentence.trim()}
                        </p>
                      )
                    )}
                  </span>
                  <span className="hidden lg:block whitespace-pre-line leading-relaxed prose prose-stone mx-auto">
                    "{formatForDesktop(testimonials[current].text, isSmallScreen)}"
                  </span>
                </blockquote>
                <cite className="block text-center">
                  <span
                    className="block text-lg md:text-xl not-italic"
                    style={{
                      color: dotColors[current],
                      filter: 'brightness(60%)',
                    }}
                  >
                    {formatName(testimonials[current].name)}
                  </span>
                  <span className="block text-stone-700 font-semibold text-base md:text-lg">
                    {testimonials[current].location}
                  </span>
                </cite>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center gap-1.5 md:gap-2">
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

        <div className="mt-6 -mb-4 text-center">
          <p className="text-sm lg:text-base text-stone-800">
            These reviews are sourced from our Google Business Profile. 
            <a 
              href="https://www.google.com/search?sca_esv=a2d1b3f2df31e648&tbm=lcl&q=el+pueblito+mexican+restaurant+arkansas#"
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-1 font-semibold text-[#0f8540] hover:underline"
            >
              <br />
              Leave a review
            </a>
            {' '}to see your feedback featured here!
          </p>
        </div>
      </div>
    </section>
  );
}
