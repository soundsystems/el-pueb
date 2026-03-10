"use client";
import { Vortex } from "react-loader-spinner";
import { MARKER_COLORS } from "@/lib/constants/colors";

const DEFAULT_SPINNER_COLORS: [string, string, string, string, string, string] =
  (() => {
    if (MARKER_COLORS.length >= 6) {
      return [
        MARKER_COLORS[0],
        MARKER_COLORS[1],
        MARKER_COLORS[2],
        MARKER_COLORS[3],
        MARKER_COLORS[4],
        MARKER_COLORS[5],
      ];
    }

    const fallback =
      MARKER_COLORS.length > 0 ? [...MARKER_COLORS] : ["#9CA169"];

    while (fallback.length < 6) {
      fallback.push(fallback[0]);
    }

    return [
      fallback[0],
      fallback[1],
      fallback[2],
      fallback[3],
      fallback[4],
      fallback[5],
    ];
  })();

export function LoadingSpinner({
  size = 80,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <Vortex
        ariaLabel="vortex-loading"
        colors={DEFAULT_SPINNER_COLORS}
        height={size}
        visible={true}
        width={size}
        wrapperClass="vortex-wrapper"
      />
    </div>
  );
}
