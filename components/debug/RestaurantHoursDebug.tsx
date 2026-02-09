"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { useRestaurantHours } from "@/lib/hooks/useRestaurantHours";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

const RestaurantHoursDebug = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const debugDate = new Date();
  debugDate.setDate(debugDate.getDate() + (selectedDay - debugDate.getDay()));
  debugDate.setHours(selectedHour, selectedMinute);

  const { isOpen, hoursToday, closedMessage } = useRestaurantHours(
    isDebugMode
      ? {
          debugDate,
          debugTime: `${String(selectedHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`,
        }
      : undefined
  );

  const handleDebugToggle = () => {
    setIsDebugMode(!isDebugMode);
  };

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed top-20 right-4 z-[9999]">
      <button
        className={`flex items-center gap-2 rounded-full bg-stone-950/90 p-3 text-sm text-stone-50 shadow-lg ${
          isDebugMode ? "bg-red-500" : ""
        }`}
        onClick={handleExpandToggle}
        type="button"
      >
        <Clock className="h-4 w-4" />
        <span>Hours Debug</span>
      </button>

      {isExpanded && (
        <div className="absolute top-12 right-0 w-96 rounded-lg border border-stone-800/50 bg-stone-950/90 p-4 shadow-lg backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg text-stone-50">
              Restaurant Hours Debug
            </h2>
            <button
              className={`rounded px-3 py-1 ${
                isDebugMode
                  ? "bg-red-500 text-white"
                  : "bg-stone-800 text-stone-50"
              }`}
              onClick={handleDebugToggle}
            >
              {isDebugMode ? "Disable Debug" : "Enable Debug"}
            </button>
          </div>

          {isDebugMode && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium text-sm text-stone-300">Day</h3>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((day, index) => (
                    <button
                      className={`rounded p-2 text-xs ${
                        selectedDay === index
                          ? "bg-stone-800 text-stone-50"
                          : "bg-stone-900/50 text-stone-300 hover:bg-stone-800"
                      }`}
                      key={day}
                      onClick={() => setSelectedDay(index)}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-sm text-stone-300">
                  Hour
                </h3>
                <div className="grid grid-cols-6 gap-1">
                  {HOURS.map((hour) => (
                    <button
                      className={`rounded p-2 text-xs ${
                        selectedHour === hour
                          ? "bg-stone-800 text-stone-50"
                          : "bg-stone-900/50 text-stone-300 hover:bg-stone-800"
                      }`}
                      key={hour}
                      onClick={() => setSelectedHour(hour)}
                    >
                      {hour % 12 || 12} {hour < 12 ? "AM" : "PM"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-sm text-stone-300">
                  Minute
                </h3>
                <div className="grid grid-cols-4 gap-1">
                  {MINUTES.map((minute) => (
                    <button
                      className={`rounded p-2 text-xs ${
                        selectedMinute === minute
                          ? "bg-stone-800 text-stone-50"
                          : "bg-stone-900/50 text-stone-300 hover:bg-stone-800"
                      }`}
                      key={minute}
                      onClick={() => setSelectedMinute(minute)}
                    >
                      {String(minute).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 rounded bg-stone-900/50 p-3">
            <p className="font-medium text-stone-50">Current Status:</p>
            <p className="text-stone-300">Is Open: {isOpen ? "Yes" : "No"}</p>
            <p className="text-stone-300">Hours Today: {hoursToday}</p>
            <p className="text-stone-300">Closed Message: {closedMessage}</p>
            <p className="mt-2 text-sm text-stone-400">
              Selected: {DAYS[selectedDay]}, {selectedHour % 12 || 12}:
              {String(selectedMinute).padStart(2, "0")}{" "}
              {selectedHour < 12 ? "AM" : "PM"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantHoursDebug;
