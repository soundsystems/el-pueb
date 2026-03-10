"use client";

import {
  ChevronDown,
  ChevronUp,
  Clock,
  Palette,
  Pause,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";
import { updateHoursText } from "@/components/Header";
import { useRestaurantHours } from "@/lib/hooks/useRestaurantHours";
import { useColorTesting } from "./ColorTestingContext";

type TimeState = "before" | "during" | "after";

const useDebugTime = () => {
  const [debugDay, setDebugDay] = useState<number | null>(null);
  const [debugTimeState, setDebugTimeState] = useState<TimeState | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  // Dispatch custom event when debugDay changes
  useEffect(() => {
    const event = new CustomEvent("debugDayChange", {
      detail: { debugDay },
    });
    window.dispatchEvent(event);
  }, [debugDay]);

  const getDebugDate = () => {
    if (debugDay === null) {
      return new Date();
    }

    const debugHours = {
      before: 8, // 8 AM - before opening
      during: 14, // 2 PM - during business hours
      after: 22, // 10 PM - after closing
    };

    const date = new Date();
    date.setHours(
      debugTimeState ? debugHours[debugTimeState] : date.getHours()
    );
    date.setMinutes(0);
    date.setSeconds(0);

    // Set the day of week (0 = Sunday, 1 = Monday, etc.)
    const currentDay = date.getDay();
    const diff = debugDay - currentDay;
    date.setDate(date.getDate() + diff);

    return date;
  };

  return {
    debugDay,
    setDebugDay,
    debugTimeState,
    setDebugTimeState,
    isExpanded,
    setIsExpanded,
    getDebugDate,
    autoplayEnabled,
    setAutoplayEnabled,
  };
};

const DebugTools = () => {
  const {
    debugDay,
    setDebugDay,
    debugTimeState,
    setDebugTimeState,
    isExpanded,
    setIsExpanded,
    getDebugDate,
    autoplayEnabled,
    setAutoplayEnabled,
  } = useDebugTime();

  const {
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
  } = useColorTesting();

  const { isOpen, hoursToday, closedMessage } = useRestaurantHours(
    debugDay !== null || debugTimeState !== null
      ? {
          debugDate: getDebugDate(),
          debugTime: `${String(getDebugDate().getHours()).padStart(2, "0")}:00`,
        }
      : undefined
  );

  // Update header text whenever debug state changes
  useEffect(() => {
    // Debug mode is being used
    if (
      process.env.NODE_ENV === "development" &&
      (debugDay !== null || debugTimeState !== null)
    ) {
      // Debug state changed
    }
    const newText = isOpen ? `Open Now ${hoursToday}` : closedMessage;
    updateHoursText(newText);
  }, [debugDay, debugTimeState, isOpen, hoursToday, closedMessage]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeStates: TimeState[] = ["before", "during", "after"];

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-1">
      <button
        className="flex items-center gap-2 rounded-full bg-stone-950/90 p-1 text-stone-100 shadow-lg"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        <span>Debug Tools</span>
      </button>

      {isExpanded && (
        <div className="flex flex-col items-end gap-1 rounded-lg bg-stone-950/90 p-2 shadow-lg backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-end gap-1">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-stone-100" />
              <div className="flex gap-1">
                {days.map((day, index) => (
                  <button
                    className={`rounded px-2 py-1 text-xs transition-colors ${
                      debugDay === index
                        ? "bg-stone-800 text-stone-50"
                        : "bg-stone-900/50 text-stone-100 hover:bg-stone-800"
                    }`}
                    key={day}
                    onClick={() =>
                      setDebugDay(debugDay === index ? null : index)
                    }
                    type="button"
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="h-6 w-px bg-stone-600" />
              <div className="flex gap-1">
                {timeStates.map((state) => (
                  <button
                    className={`rounded px-2 py-1 text-xs capitalize transition-colors ${
                      debugTimeState === state
                        ? "bg-stone-800 text-stone-50"
                        : "bg-stone-900/50 text-stone-100 hover:bg-stone-800"
                    }`}
                    key={state}
                    onClick={() =>
                      setDebugTimeState(debugTimeState === state ? null : state)
                    }
                    type="button"
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>

            {(debugDay !== null || debugTimeState !== null) && (
              <>
                <div className="h-6 w-px bg-stone-600" />
                <button
                  className="rounded bg-red-900/50 px-2 py-1 text-red-100 text-xs hover:bg-red-900/70"
                  onClick={() => {
                    setDebugDay(null);
                    setDebugTimeState(null);
                  }}
                  type="button"
                >
                  Reset
                </button>
              </>
            )}

            <div className="h-6 w-px bg-stone-600" />
            <button
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                autoplayEnabled
                  ? "bg-green-900/50 text-green-100 hover:bg-green-900/70"
                  : "bg-red-900/50 text-red-100 hover:bg-red-900/70"
              }`}
              onClick={() => {
                const newState = !autoplayEnabled;
                setAutoplayEnabled(newState);
                // Dispatch custom event to communicate with Hero component
                window.dispatchEvent(
                  new CustomEvent("carouselAutoplayToggle", {
                    detail: { enabled: newState },
                  })
                );
              }}
              title={
                autoplayEnabled
                  ? "Disable carousel autoplay"
                  : "Enable carousel autoplay"
              }
              type="button"
            >
              {autoplayEnabled ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              {autoplayEnabled ? "Autoplay ON" : "Autoplay OFF"}
            </button>

            <div className="h-6 w-px bg-stone-600" />
            <button
              className="flex items-center gap-1 rounded bg-blue-900/50 px-2 py-1 text-blue-100 text-xs transition-colors hover:bg-blue-900/70"
              onClick={() => {
                const newMode =
                  menuButtonColorMode === "confetti" ? "marker" : "confetti";
                setMenuButtonColorMode(newMode);
                setMenuButtonColorIndex(0); // Reset to first color when switching modes
              }}
              title={`Menu button: ${menuButtonColorMode === "confetti" ? "Confetti colors" : "Marker colors"} (click to switch modes)`}
              type="button"
            >
              <Palette className="h-3 w-3" />
              Menu: {menuButtonColorMode === "confetti" ? "Confetti" : "Marker"}
            </button>

            <button
              className="flex items-center gap-1 rounded bg-cyan-900/50 px-2 py-1 text-cyan-100 text-xs transition-colors hover:bg-cyan-900/70"
              onClick={() => {
                setMenuButtonColorIndex((prev) => prev + 1);
              }}
              title="Next Menu button color"
              type="button"
            >
              <Palette className="h-3 w-3" />
              Next
            </button>

            <button
              className="flex items-center gap-1 rounded bg-teal-900/50 px-2 py-1 text-teal-100 text-xs transition-colors hover:bg-teal-900/70"
              onClick={() => {
                setMenuButtonColorIndex((prev) => prev - 1);
              }}
              title="Previous Menu button color"
              type="button"
            >
              <Palette className="h-3 w-3" />
              Prev
            </button>

            <button
              className="flex items-center gap-1 rounded bg-purple-900/50 px-2 py-1 text-purple-100 text-xs transition-colors hover:bg-purple-900/70"
              onClick={() => {
                const newMode =
                  cateringButtonColorMode === "confetti"
                    ? "marker"
                    : "confetti";
                setCateringButtonColorMode(newMode);
                setCateringButtonColorIndex(0); // Reset to first color when switching modes
              }}
              title={`Catering button: ${cateringButtonColorMode === "confetti" ? "Confetti colors" : "Marker colors"} (click to switch modes)`}
              type="button"
            >
              <Palette className="h-3 w-3" />
              Catering:{" "}
              {cateringButtonColorMode === "confetti" ? "Confetti" : "Marker"}
            </button>

            <button
              className="flex items-center gap-1 rounded bg-pink-900/50 px-2 py-1 text-pink-100 text-xs transition-colors hover:bg-pink-900/70"
              onClick={() => {
                setCateringButtonColorIndex((prev) => prev + 1);
              }}
              title="Next Catering button color"
              type="button"
            >
              <Palette className="h-3 w-3" />
              Next
            </button>

            <button
              className="flex items-center gap-1 rounded bg-orange-900/50 px-2 py-1 text-orange-100 text-xs transition-colors hover:bg-orange-900/70"
              onClick={() => {
                setCateringButtonColorIndex((prev) => prev - 1);
              }}
              title="Previous Catering button color"
              type="button"
            >
              <Palette className="h-3 w-3" />
              Prev
            </button>
          </div>

          {/* Second row for hover controls */}
          <div className="flex flex-wrap items-center justify-end gap-1">
            <span className="text-stone-300 text-xs">Menu Hover:</span>
            <button
              className="flex items-center gap-1 rounded bg-indigo-900/50 px-2 py-1 text-indigo-100 text-xs transition-colors hover:bg-indigo-900/70"
              onClick={() => {
                setMenuButtonHoverIndex((prev) => prev + 1);
              }}
              title="Next Menu button hover color"
              type="button"
            >
              <Palette className="h-3 w-3" />+
            </button>

            <button
              className="flex items-center gap-1 rounded bg-slate-900/50 px-2 py-1 text-slate-100 text-xs transition-colors hover:bg-slate-900/70"
              onClick={() => {
                setMenuButtonHoverIndex((prev) => prev - 1);
              }}
              title="Previous Menu button hover color"
              type="button"
            >
              <Palette className="h-3 w-3" />-
            </button>

            <div className="h-6 w-px bg-stone-600" />
            <span className="text-stone-300 text-xs">Catering Hover:</span>
            <button
              className="flex items-center gap-1 rounded bg-rose-900/50 px-2 py-1 text-rose-100 text-xs transition-colors hover:bg-rose-900/70"
              onClick={() => {
                setCateringButtonHoverIndex((prev) => prev + 1);
              }}
              title="Next Catering button hover color"
              type="button"
            >
              <Palette className="h-3 w-3" />+
            </button>

            <button
              className="flex items-center gap-1 rounded bg-gray-900/50 px-2 py-1 text-gray-100 text-xs transition-colors hover:bg-gray-900/70"
              onClick={() => {
                setCateringButtonHoverIndex((prev) => prev - 1);
              }}
              title="Previous Catering button hover color"
              type="button"
            >
              <Palette className="h-3 w-3" />-
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugTools;
