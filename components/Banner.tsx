"use client";

import { domAnimation, LazyMotion, m as motion } from "framer-motion";

// Colors that match your app's theme
const textColors = [
  // '#EAB308', // Warm yellow
  "#1AB2B2", // Teal blue
  "#D3A667", // Light brown
  "#FAF9F6", // Off white
  "#F8C839", // Golden yellow
  "#CF0822", // Bright red
  "#EF6A4B", // Coral orange
  "#9DA26A", // Sage green
  "#F690A1", // Soft pink
  "#30C2DC", // Sky blue
  // '#0972A7', // Deep blue
  "#CD202B", // Cherry red
  "#009B5B", // Emerald green
  "#FCF3D8", // Cream
];

const bannerItems = [
  { text: "Now Open in Highfill!", emoji: "🌮" },
  { text: "Host Your Next Fiesta With Us", emoji: "🎉" },
  { text: "Best Mexican Food in NWA", emoji: "🏆" },
  { text: "Fresh Ingredients, Authentic Flavors", emoji: "🌶️" },
  { text: "4 Locations to Serve You", emoji: "📍" },
  { text: "We are hiring!", emoji: "👔" },
  { text: "Happy Hour Monday-Friday 3-6pm", emoji: "🍺" },
  { text: "Try Our New Blue  Margaritas", emoji: "💙" },
  { text: "Live Music", emoji: "🎸" },
  { text: "Catering Available for All Events", emoji: "🌯" },
  { text: "Daily Food and Drink Specials", emoji: "👨‍👩‍👧" },
];

export default function FlowingBanner() {
  // Calculate the exact width needed for smooth infinite scroll
  const translateX = `-${100}%`;

  return (
    <LazyMotion features={domAnimation}>
      <div
        aria-label="Announcements"
        className="relative overflow-hidden bg-stone-950/90 py-1.5 pt-safe-top shadow-lg backdrop-blur-sm"
        role="marquee"
      >
        <div className="flex whitespace-nowrap">
          <motion.div
            animate={{
              x: translateX,
            }}
            className="flex shrink-0"
            transition={{
              duration: 80,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {bannerItems.map((item, index) => (
              <span
                className="mx-4 font-medium text-sm tracking-wide"
                key={`${item.text}-${item.emoji}`}
              >
                <span aria-hidden="true" className="mr-1.5" role="img">
                  {item.emoji}
                </span>
                <span style={{ color: textColors[index % textColors.length] }}>
                  {item.text}
                </span>
              </span>
            ))}
          </motion.div>
          <motion.div
            animate={{
              x: translateX,
            }}
            className="flex shrink-0"
            transition={{
              duration: 80,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {bannerItems.map((item, index) => (
              <span
                className="mx-4 font-medium text-sm tracking-wide"
                key={`dup-${item.text}-${item.emoji}`}
              >
                <span aria-hidden="true" className="mr-1.5" role="img">
                  {item.emoji}
                </span>
                <span style={{ color: textColors[index % textColors.length] }}>
                  {item.text}
                </span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </LazyMotion>
  );
}
