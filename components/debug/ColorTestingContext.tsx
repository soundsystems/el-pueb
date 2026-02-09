"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { CONFETTI_COLORS, MARKER_COLORS } from "@/lib/constants/colors";

type ColorMode = "confetti" | "marker";

type ColorTestingContextType = {
  menuButtonColorMode: ColorMode;
  cateringButtonColorMode: ColorMode;
  menuButtonColorIndex: number;
  cateringButtonColorIndex: number;
  menuButtonHoverIndex: number;
  cateringButtonHoverIndex: number;
  setMenuButtonColorMode: (mode: ColorMode) => void;
  setCateringButtonColorMode: (mode: ColorMode) => void;
  setMenuButtonColorIndex: (index: number | ((prev: number) => number)) => void;
  setCateringButtonColorIndex: (
    index: number | ((prev: number) => number)
  ) => void;
  setMenuButtonHoverIndex: (index: number | ((prev: number) => number)) => void;
  setCateringButtonHoverIndex: (
    index: number | ((prev: number) => number)
  ) => void;
  getMenuButtonColors: () => { bg: string; hover: string };
  getCateringButtonColors: () => { bg: string; hover: string };
};

const ColorTestingContext = createContext<ColorTestingContextType | undefined>(
  undefined
);

export function ColorTestingProvider({ children }: { children: ReactNode }) {
  const [menuButtonColorMode, setMenuButtonColorMode] =
    useState<ColorMode>("marker");
  const [cateringButtonColorMode, setCateringButtonColorMode] =
    useState<ColorMode>("marker");
  const [menuButtonColorIndex, setMenuButtonColorIndex] = useState(0);
  const [cateringButtonColorIndex, setCateringButtonColorIndex] = useState(0);
  const [menuButtonHoverIndex, setMenuButtonHoverIndex] = useState(1);
  const [cateringButtonHoverIndex, setCateringButtonHoverIndex] = useState(1);

  // Set specific colors for catering button
  const getCateringButtonColors = () => ({
    bg: "#F16D15",
    hover: "#FD2821",
  });

  const getMenuButtonColors = () => ({
    bg: "#F9AA51",
    hover: "#F9B870",
  });

  return (
    <ColorTestingContext.Provider
      value={{
        menuButtonColorMode,
        cateringButtonColorMode,
        menuButtonColorIndex,
        cateringButtonColorIndex,
        menuButtonHoverIndex,
        cateringButtonHoverIndex,
        setMenuButtonColorMode,
        setCateringButtonColorMode,
        setMenuButtonColorIndex,
        setCateringButtonColorIndex,
        setMenuButtonHoverIndex,
        setCateringButtonHoverIndex,
        getMenuButtonColors,
        getCateringButtonColors,
      }}
    >
      {children}
    </ColorTestingContext.Provider>
  );
}

export function useColorTesting() {
  const context = useContext(ColorTestingContext);
  if (context === undefined) {
    throw new Error(
      "useColorTesting must be used within a ColorTestingProvider"
    );
  }
  return context;
}
