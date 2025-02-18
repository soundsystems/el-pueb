'use client';
import Hero from '@/components/Hero';
import Testimonials from '@/components/Testimonials';
import { AnimatePresence, motion } from 'motion/react';
// const mufferaw = localFont({
//   src: './fonts/mufferaw.ttf',
//   weight: '400',
// });

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: 'easeIn',
    },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main className="flex flex-col space-y-6">
        <AnimatePresence>
          <motion.section
            key="hero-section"
            id="hero"
            className="flex w-full flex-col items-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sectionVariants}
          >
            <Hero />
          </motion.section>

          <motion.section
            key="testimonials-section"
            id="testimonials"
            className="flex w-full flex-col items-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sectionVariants}
          >
            <Testimonials />
          </motion.section>

          {/* <motion.section
            key="specials-section"
            id="specials"
            className="flex w-full flex-col items-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sectionVariants}
          >
             <Specials /> 
          </motion.section> */}
        </AnimatePresence>
      </main>
    </div>
  );
}
