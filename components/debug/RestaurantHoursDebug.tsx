'use client';

import { useState } from 'react';
import { useRestaurantHours } from '@/lib/hooks/useRestaurantHours';
import { Clock } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
          debugTime: `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`,
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
    <div className="fixed right-4 top-20 z-[9999]">
      <button
        onClick={handleExpandToggle}
        className={`flex items-center gap-2 rounded-full bg-stone-950/90 p-3 text-stone-50 text-sm shadow-lg ${
          isDebugMode ? 'bg-red-500' : ''
        }`}
        type="button"
      >
        <Clock className="h-4 w-4" />
        <span>Hours Debug</span>
      </button>

      {isExpanded && (
        <div className="absolute right-0 top-12 w-96 bg-stone-950/90 p-4 rounded-lg shadow-lg border border-stone-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-50">Restaurant Hours Debug</h2>
            <button
              onClick={handleDebugToggle}
              className={`px-3 py-1 rounded ${
                isDebugMode ? 'bg-red-500 text-white' : 'bg-stone-800 text-stone-50'
              }`}
            >
              {isDebugMode ? 'Disable Debug' : 'Enable Debug'}
            </button>
          </div>

          {isDebugMode && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-stone-300 mb-2">Day</h3>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(index)}
                      className={`p-2 text-xs rounded ${
                        selectedDay === index
                          ? 'bg-stone-800 text-stone-50'
                          : 'bg-stone-900/50 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-stone-300 mb-2">Hour</h3>
                <div className="grid grid-cols-6 gap-1">
                  {HOURS.map((hour) => (
                    <button
                      key={hour}
                      onClick={() => setSelectedHour(hour)}
                      className={`p-2 text-xs rounded ${
                        selectedHour === hour
                          ? 'bg-stone-800 text-stone-50'
                          : 'bg-stone-900/50 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {hour % 12 || 12} {hour < 12 ? 'AM' : 'PM'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-stone-300 mb-2">Minute</h3>
                <div className="grid grid-cols-4 gap-1">
                  {MINUTES.map((minute) => (
                    <button
                      key={minute}
                      onClick={() => setSelectedMinute(minute)}
                      className={`p-2 text-xs rounded ${
                        selectedMinute === minute
                          ? 'bg-stone-800 text-stone-50'
                          : 'bg-stone-900/50 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {String(minute).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-stone-900/50 rounded">
            <p className="font-medium text-stone-50">Current Status:</p>
            <p className="text-stone-300">Is Open: {isOpen ? 'Yes' : 'No'}</p>
            <p className="text-stone-300">Hours Today: {hoursToday}</p>
            <p className="text-stone-300">Closed Message: {closedMessage}</p>
            <p className="mt-2 text-sm text-stone-400">
              Selected: {DAYS[selectedDay]}, {selectedHour % 12 || 12}:{String(selectedMinute).padStart(2, '0')} {selectedHour < 12 ? 'AM' : 'PM'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantHoursDebug; 