'use client';

import { motion } from 'motion/react';

// Colors that match your app's theme
const textColors = [
  // '#EAB308', // Warm yellow
  '#1AB2B2', // Teal blue
  '#D3A667', // Light brown
  '#FAF9F6', // Off white
  '#F8C839', // Golden yellow
  '#CF0822', // Bright red
  '#EF6A4B', // Coral orange
  '#9DA26A', // Sage green
  '#F690A1', // Soft pink
  '#30C2DC', // Sky blue
  // '#0972A7', // Deep blue
  '#CD202B', // Cherry red
  '#009B5B', // Emerald green
  '#FCF3D8', // Cream
];

const bannerItems = [
  { text: 'Now Open in Highfill!', emoji: '🌮' },
  { text: 'Host Your Next Fiesta With Us', emoji: '🎉' },
  { text: 'Best Mexican Food in NWA', emoji: '🏆' },
  { text: 'Fresh Ingredients, Authentic Flavors', emoji: '🌶️' },
  { text: '4 Locations to Serve You', emoji: '📍' },
  { text: 'We are hiring!', emoji: '👔' },
  { text: 'Happy Hour Monday-Friday 3-6pm', emoji: '🍺' },
  { text: 'Try Our New Signature Margaritas', emoji: '🍹' },
  { text: 'Live Music', emoji: '🎸' },
  { text: 'Catering Available for All Events', emoji: '🌯' },
  { text: 'Salsa Dancing Nights on Thursdays', emoji: '💃' },
];

export default function FlowingBanner() {
  // Calculate the exact width needed for smooth infinite scroll
  const translateX = `-${100}%`;

  return (
    <div
      className="relative overflow-hidden bg-stone-950/90 py-1.5 pt-safe-top shadow-lg backdrop-blur-sm"
      role="marquee"
      aria-label="Announcements"
    >
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{
            x: translateX,
          }}
          transition={{
            duration: 80,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
          className="flex shrink-0"
        >
          {bannerItems.map((item, index) => (
            <span
              key={index}
              className="mx-4 font-medium text-xs tracking-wide"
            >
              <span role="img" aria-hidden="true" className="mr-1.5">
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
          transition={{
            duration: 80,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
          className="flex shrink-0"
        >
          {bannerItems.map((item, index) => (
            <span
              key={`dup-${index}`}
              className="mx-4 font-medium text-xs tracking-wide"
            >
              <span role="img" aria-hidden="true" className="mr-1.5">
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
  );
}
