import { useEffect, useRef } from 'react';

export const CONFETTI_COLORS = [
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
] as const;

export function useMarkerColors() {
  const markerColorsRef = useRef<string[]>([]);

  useEffect(() => {
    markerColorsRef.current = CONFETTI_COLORS.filter(
      (color) => color !== '#FFFFFF' && color !== '#FCF3D8'
    )
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, []);

  return markerColorsRef;
}
