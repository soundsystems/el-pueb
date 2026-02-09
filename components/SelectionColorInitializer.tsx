"use client";

import { useEffect } from "react";
import { initializeSelectionColor } from "@/lib/utils/selectionColor";

export default function SelectionColorInitializer() {
  useEffect(() => {
    initializeSelectionColor();
  }, []);

  return null;
}
