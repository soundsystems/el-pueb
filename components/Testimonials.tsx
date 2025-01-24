'use client';

import { CONFETTI_COLORS } from '@/lib/constants/colors';
import { Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Button } from './ui/button';

const allTestimonials = [
  {
    name: 'Santosh Kotyankar',
    location: 'Centerton',
    text: 'Got off work late - they were the only Mexican open until 10, and boy did their team deliver. One heck of a magnificent feast, and some of the best prices around.',
    rating: 5,
  },
  {
    name: 'Toubabo Koomi',
    location: 'Rogers',
    text: 'Nice clean restaurant. Staff are amazing people. Great Superbowl party. Live music on Monday nights. I love this place.',
    rating: 5,
  },
  {
    name: 'Ross Ellerbe',
    location: 'Bella Vista',
    text: 'We called an order in for pickup (4 people) and it was ready within 15 minutes. Service was friendly and fast. Our order was correct, and more importantly delicious! 5/5!',
    rating: 5,
  },
  {
    name: 'Russell Capps',
    location: 'Rogers',
    text: 'Lots of good reviews, and I see why! Great service, serving sizes were enormous and an excellent value, food was delicious. We will definitely be back!',
    rating: 5,
  },
  {
    name: 'Kyle Brunetti',
    location: 'Rogers',
    text: 'Food was delicious and the service was great. The queso was one of the tastier ones I\'ve had before.',
    rating: 5,
  },
  {
    name: 'Lisa Lynn',
    location: 'Highfill',
    text: 'I really enjoyed my meal, and my grandson claimed his Steven special was the best ever! Service was good but was missing the cilantro. Overall, it\'s a great place to eat!',
    rating: 5,
  },
  {
    name: 'Pandaloves17',
    location: 'Highfill',
    text: 'Super good food! Nice to have something so close instead of going miles to find a good place to eat.',
    rating: 5,
  },
  {
    name: 'Kiki Love',
    location: 'Highfill',
    text: 'Food was fantastic! Salsa is one of the best! Prices are pretty good too.',
    rating: 5,
  },
  {
    name: 'Marsha TravelMastersNWA',
    location: 'Highfill',
    text: 'Yes! Good food! Ice cold beer! Nice decor. We will be back!!!',
    rating: 5,
  },
  {
    name: 'Rinku Master',
    location: 'Centerton',
    text: 'My favorite Mexican restaurant in Northwest Arkansas. The food is tasty and the serving sizes are very generous! The staff is humble and serves up patrons pretty quickly. The second best thing after the tasty food here is the price! Tasty food with generous portions at a very affordable price!',
    rating: 5,
  },
  {
    name: 'Patty Anaya',
    location: 'Bella Vista',
    text: 'This is our favorite Mexican restaurant by far. The food is authentic and tastes homemade. The ambiance is nice and always clean, and the service is excellent! The lunch menu is very reasonably priced, and as you can see in the photos, the portions are generous. We had the chicken fajitas and burrito con chili verde. Both delicious.',
    rating: 5,
  },
  {
    name: 'Jack Morrison',
    location: 'Rogers',
    text: 'The margarita trio (margarita flight) was great!! I enjoyed the pineapple jalapeño margarita. My wife liked the coconut lime better, but she\'s usually wrong. Wife here... he\'s a knuckle-dragging draft beer drinker. Trust me on the coconut lime.',
    rating: 5,
  },
  {
    name: 'AK Carter',
    location: 'Highfill',
    text: 'At first glance, I immediately noticed the cleanliness of the restaurant. It is clean and extremely nice! The food is amazing. The family that owns the restaurant went above and beyond, they were super attentive and personable! This is the new spot - highly recommend going to check it out!',
    rating: 5,
  },
  {
    name: 'Cher Cleveland',
    location: 'Bella Vista',
    text: 'We got quick service, and their menu was really large and the prices were great! Upon arrival we chowed down their free basket of chips and salsa in no time (we loved them and I\'m picky about salsa), we ordered choriqueso dip to go with a 2nd basket of chips which the 2 of us ate down (plenty to serve for 4). For my entree I got this delicious thing I never heard of called El Torro which I highly recommend! My entree cost $6.25 and it was amazing (I\'m glad I ordered only 1, I feel that 3 would serve a family). My boyfriend got Alambre (a favorite of ours I recommend everyone try it) which was huge and delicious. (we sometimes get it as an appetizer to share with a group). We will definitely come back and will bring friends next time!',
    rating: 5,
  },
  {
    name: 'Courtney Bailey',
    location: 'Rogers',
    text: 'Visiting from Texas and we needed some Mexican food on our first evening! We were not disappointed with our meal. Chips and salsa, combo beef and chicken quesadillas, chicken street tacos and rice! We even got their house margaritas as well. Thanks for our first meal in Rogers!',
    rating: 5,
  },
  {
    name: 'Paul Cate',
    location: 'Highfill',
    text: 'Folks, this is a new Mexican restaurant in Highfill Arkansas El Pueblito. My wife ordered street chicken tacos, and I had chicken taco salad. My taste buds were doing backflips for their tangy, delicious taco salad. The street tacos were just as good as you get in Progresso Mexico, nice clean restaurant we will definitely be back.',
    rating: 5,
  },
  {
    name: 'Rbidbear Spirit',
    location: 'Centerton',
    text: 'Food portions are good size. Food and drink menu is good too. Friendly, courteous and attentive staff. Staff is accommodating as well. Love their homemade spicy salsa which you have to ask for with chips and salsa.',
    rating: 5,
  },
  {
    name: 'Joel McEwan',
    location: 'Rogers',
    text: 'Our new go to Mexican restaurant we\'ve been there about 7 times. There are a few locations we\'ve been to the one on Beaver lake successfully a few times also. Monday through Friday they have fajitas for lunch $11.99. the salsa and the chips are very fresh. Very quick delivery of food and service.',
    rating: 5,
  },
  {
    name: 'Carol Karlowski',
    location: 'Rogers',
    text: 'Really enjoyed the food. Chili rellenos were great. Had them leave the shrimp off so my spouse could try it. The chicken and shrimp aren\'t actually stuffed in the chili but are served on either side of the rellenos. Spouse had street tacos and enjoyed those as well. The salsa was good as well and had just enough kick without being overwhelming!',
    rating: 5,
  },
];

const SENTENCE_SPLITTER = /(?<=[.!?])\s+/;

function splitIntoSentences(text: string) {
  return text.split(SENTENCE_SPLITTER);
}

function formatName(fullName: string) {
  const [firstName, lastName] = fullName.split(' ');
  return `${firstName} ${lastName ? lastName[0] + '.' : ''}`;
}

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isUserNavigated, setIsUserNavigated] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Randomly select 8 testimonials on page load
  const testimonials = useMemo(() => {
    return [...allTestimonials]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
  }, []);

  // Calculate max height on mount
  useEffect(() => {
    if (!contentRef.current) return;
    
    const height = contentRef.current.offsetHeight;
    setMaxHeight(height + 32); // Add some padding
  }, [testimonials]);

  // Get random colors for dots, one for each testimonial
  const dotColors = useMemo(() => {
    return [...CONFETTI_COLORS]
      .sort(() => Math.random() - 0.5)
      .slice(0, testimonials.length);
  }, [testimonials.length]);

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
        <div className="fixed -left-[9999px] -top-[9999px] invisible">
          <div ref={contentRef} className="flex flex-col items-center justify-center py-10 md:py-12">
            <div className="mb-4 flex justify-center">
              {[...new Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6" />
              ))}
            </div>
            <div className="w-full max-w-xl px-1 lg:max-w-4xl">
              <blockquote className="mb-4 text-pretty text-center text-base text-gray-800">
                {testimonials.reduce((longest, t) => 
                  t.text.length > longest.length ? t.text : longest
                , '')}
              </blockquote>
              <cite className="block text-center">
                <span className="font-semibold text-[#0f8540] text-lg not-italic block">Name</span>
                <span className="text-gray-600 text-sm block">Location</span>
              </cite>
            </div>
          </div>
        </div>

        <div ref={measureRef} className="relative" style={{ height: maxHeight || 'auto' }}>
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
              className="absolute inset-0 flex flex-col items-center justify-center py-10 md:py-12"
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
                  <span className="font-semibold text-[#0f8540] text-lg not-italic block">
                    {formatName(testimonials[current].name)}
                  </span>
                  <span className="text-gray-600 text-sm block">
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
