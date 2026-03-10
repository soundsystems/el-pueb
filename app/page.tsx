"use client";
import { motion } from "motion/react";
import { useState } from "react";
import ChevronBorder from "@/components/ChevronBorder";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";

// const mufferaw = localFont({
//   src: './fonts/mufferaw.ttf',
//   weight: '400',
// });

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const sectionTransition = {
  duration: 0.55,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function HomePage() {
  const [testimonialsDebugMode, setTestimonialsDebugMode] = useState(false);

  return (
    <div className="min-h-screen">
      <main className="flex flex-col space-y-6">
        <motion.section
          animate="visible"
          className="flex w-full flex-col items-center"
          id="hero"
          initial="hidden"
          transition={sectionTransition}
          variants={sectionVariants}
        >
          <Hero />
        </motion.section>

        <ChevronBorder />

        <motion.section
          animate="visible"
          className="flex w-full flex-col items-center"
          id="testimonials"
          initial="hidden"
          transition={{ ...sectionTransition, delay: 0.08 }}
          variants={sectionVariants}
        >
          <Testimonials debugMode={testimonialsDebugMode} />
        </motion.section>
      </main>

      {/* Debug buttons - only in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed right-4 bottom-8 z-[9999] flex flex-col gap-2">
          <button
            className={`rounded-full p-3 text-sm shadow-lg transition-colors ${
              testimonialsDebugMode
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-stone-950/90 text-stone-50 hover:bg-stone-950/70"
            }`}
            onClick={() => setTestimonialsDebugMode(!testimonialsDebugMode)}
            title={
              testimonialsDebugMode
                ? "Switch to random reviews"
                : "Load longest reviews"
            }
            type="button"
          >
            {testimonialsDebugMode ? "Debug ON" : "Testimonials Debug"}
          </button>

          <button
            className="rounded-full bg-blue-500 p-3 text-sm text-white shadow-lg transition-colors hover:bg-blue-600"
            onClick={() => setTestimonialsDebugMode(true)}
            title="Force load longest reviews for testing"
            type="button"
          >
            Load Longest
          </button>
        </div>
      )}
    </div>
  );
}
