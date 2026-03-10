"use client";

import { createContext, type ReactNode, useContext, useReducer } from "react";

type ColorMode = "confetti" | "marker";

interface ColorTestingContextType {
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
}

interface ColorTestingState {
  cateringButtonColorIndex: number;
  cateringButtonColorMode: ColorMode;
  cateringButtonHoverIndex: number;
  menuButtonColorIndex: number;
  menuButtonColorMode: ColorMode;
  menuButtonHoverIndex: number;
}

type ColorTestingAction =
  | { type: "set_catering_button_color_index"; value: number }
  | { type: "set_catering_button_color_mode"; value: ColorMode }
  | { type: "set_catering_button_hover_index"; value: number }
  | { type: "set_menu_button_color_index"; value: number }
  | { type: "set_menu_button_color_mode"; value: ColorMode }
  | { type: "set_menu_button_hover_index"; value: number };

function resolveNextValue<T>(current: T, value: T | ((previous: T) => T)): T {
  return typeof value === "function"
    ? (value as (previous: T) => T)(current)
    : value;
}

function colorTestingReducer(
  state: ColorTestingState,
  action: ColorTestingAction
): ColorTestingState {
  switch (action.type) {
    case "set_catering_button_color_index":
      return { ...state, cateringButtonColorIndex: action.value };
    case "set_catering_button_color_mode":
      return { ...state, cateringButtonColorMode: action.value };
    case "set_catering_button_hover_index":
      return { ...state, cateringButtonHoverIndex: action.value };
    case "set_menu_button_color_index":
      return { ...state, menuButtonColorIndex: action.value };
    case "set_menu_button_color_mode":
      return { ...state, menuButtonColorMode: action.value };
    case "set_menu_button_hover_index":
      return { ...state, menuButtonHoverIndex: action.value };
    default:
      return state;
  }
}

const ColorTestingContext = createContext<ColorTestingContextType | undefined>(
  undefined
);

export function ColorTestingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(colorTestingReducer, {
    cateringButtonColorIndex: 0,
    cateringButtonColorMode: "marker" as ColorMode,
    cateringButtonHoverIndex: 1,
    menuButtonColorIndex: 0,
    menuButtonColorMode: "marker" as ColorMode,
    menuButtonHoverIndex: 1,
  });
  const {
    cateringButtonColorIndex,
    cateringButtonColorMode,
    cateringButtonHoverIndex,
    menuButtonColorIndex,
    menuButtonColorMode,
    menuButtonHoverIndex,
  } = state;

  // Set specific colors for catering button
  const getCateringButtonColors = () => ({
    bg: "#F16D15",
    hover: "#FD2821",
  });

  const getMenuButtonColors = () => ({
    bg: "#F9AA51",
    hover: "#F9B870",
  });

  const setMenuButtonColorMode = (mode: ColorMode) => {
    dispatch({ type: "set_menu_button_color_mode", value: mode });
  };

  const setCateringButtonColorMode = (mode: ColorMode) => {
    dispatch({ type: "set_catering_button_color_mode", value: mode });
  };

  const setMenuButtonColorIndex = (
    index: number | ((prev: number) => number)
  ) => {
    dispatch({
      type: "set_menu_button_color_index",
      value: resolveNextValue(menuButtonColorIndex, index),
    });
  };

  const setCateringButtonColorIndex = (
    index: number | ((prev: number) => number)
  ) => {
    dispatch({
      type: "set_catering_button_color_index",
      value: resolveNextValue(cateringButtonColorIndex, index),
    });
  };

  const setMenuButtonHoverIndex = (
    index: number | ((prev: number) => number)
  ) => {
    dispatch({
      type: "set_menu_button_hover_index",
      value: resolveNextValue(menuButtonHoverIndex, index),
    });
  };

  const setCateringButtonHoverIndex = (
    index: number | ((prev: number) => number)
  ) => {
    dispatch({
      type: "set_catering_button_hover_index",
      value: resolveNextValue(cateringButtonHoverIndex, index),
    });
  };

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
