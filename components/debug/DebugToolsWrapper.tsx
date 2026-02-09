"use client";

import { useEffect, useState } from "react";
import DebugTools from "./DebugTools";

export default function DebugToolsWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || process.env.NODE_ENV !== "development") {
    return null;
  }

  return <DebugTools />;
}
