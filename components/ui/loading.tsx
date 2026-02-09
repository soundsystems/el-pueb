"use client";
import { useMemo } from "react";
import { Vortex } from "react-loader-spinner";
import { MARKER_COLORS } from "@/lib/constants/colors";

export function LoadingSpinner({
  size = 80,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const colors = useMemo(() => {
    const availableColors = [...MARKER_COLORS];
    const selectedColors: string[] = [];

    while (selectedColors.length < 6 && availableColors.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      selectedColors.push(availableColors[randomIndex]);
      availableColors.splice(randomIndex, 1);
    }

    // If we don't have enough colors, repeat some to fill up to 6
    while (selectedColors.length < 6) {
      selectedColors.push(
        selectedColors[selectedColors.length % selectedColors.length]
      );
    }

    return selectedColors as [string, string, string, string, string, string];
  }, []); // Empty deps array means colors will be generated once per mount

  return (
    <div className={className}>
      <Vortex
        ariaLabel="vortex-loading"
        colors={colors}
        height={size}
        visible={true}
        width={size}
        wrapperClass="vortex-wrapper"
      />
    </div>
  );
}
