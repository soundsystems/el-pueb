'use client';

import { CONFETTI_COLORS } from '@/lib/constants/colors';
import { useMemo } from 'react';
import { Vortex } from 'react-loader-spinner';

function getRandomColors(): [string, string, string, string, string, string] {
  // Colors we always want to include
  const blacks = ['#202020', '#231F20', '#1F2121'];
  const requiredColors = [
    blacks[Math.floor(Math.random() * blacks.length)], // Random black
    '#006847', // green
    '#CF0822', // crimson
  ];

  // Filter out colors we don't want, and also remove our required colors since we'll add them back
  const filteredColors = CONFETTI_COLORS.filter(
    (color) =>
      ![
        '#FDEAAF', // eagle beak gold hilight
        '#B07229', // eagle tail feather brown
        '#8F4620', // eagle feather brown
        '#953220', // dark brown
        '#DBAD6C', // eagle hilight tan
        '#FF0000', // red
        '#FFFFFF', // white
        '#FDF2D2', // pale yellow hilight
        ...requiredColors, // Remove required colors from pool since we'll add them back
      ].includes(color)
  );

  // Get 3 random colors from our filtered pool
  const randomColors = [...filteredColors]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Combine and shuffle required and random colors
  const allColors = [...requiredColors, ...randomColors].sort(
    () => Math.random() - 0.5
  );

  return allColors as [string, string, string, string, string, string];
}

export function LoadingSpinner({
  size = 80,
  className,
}: {
  size?: number;
  className?: string;
}) {
  // Memoize the colors so they don't change on every render
  const colors = useMemo(() => getRandomColors(), []);

  return (
    <div className={className}>
      <Vortex
        visible={true}
        height={size}
        width={size}
        ariaLabel="vortex-loading"
        wrapperClass="vortex-wrapper"
        colors={colors}
      />
    </div>
  );
}
