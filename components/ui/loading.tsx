'use client';

import { useMemo } from 'react';
import { Vortex } from 'react-loader-spinner';

const CONFETTI_COLORS = [
  '#F8C839', // yellow
  '#016945', // green
  '#CF0822', // red
  '#FFFFFF', // white
  '#EF6A4B', // orange
  '#9DA26A', // olive
  '#088589', // teal
  '#91441A', // brown
  '#717732', // moss
  '#F690A1', // pink
  '#30C2DC', // blue
  '#0972A7', // navy
  '#202020', // black
  '#CD202B', // bright red
  '#006847', // forest
  '#FCF3D8', // cream
];

function getRandomColors(): [string, string, string, string, string, string] {
  // Shuffle array and take first 6 elements
  const shuffled = [...CONFETTI_COLORS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6) as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
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
