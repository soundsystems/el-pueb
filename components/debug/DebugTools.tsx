'use client';

import { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useRestaurantHours } from '@/lib/hooks/useRestaurantHours';
import { updateHoursText } from '@/components/Header';

type TimeState = 'before' | 'during' | 'after';

const useDebugTime = () => {
  const [debugDay, setDebugDay] = useState<number | null>(null);
  const [debugTimeState, setDebugTimeState] = useState<TimeState | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

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
  } = useDebugTime();

  const { isOpen, hoursToday, closedMessage } = useRestaurantHours(
    debugDay !== null || debugTimeState !== null
      ? {
          debugDate: getDebugDate(),
          debugTime: `${String(getDebugDate().getHours()).padStart(2, '0')}:00`,
        }
      : undefined
  );

  // Update header text whenever debug state changes
  useEffect(() => {
    console.log('DebugTools useEffect triggered with:', {
      isOpen,
      hoursToday,
      closedMessage,
      debugDay,
      debugTimeState
    });
    const newText = isOpen ? `Open Now ${hoursToday}` : closedMessage;
    console.log('Calling updateHoursText with:', newText);
    updateHoursText(newText);
  }, [debugDay, debugTimeState, isOpen, hoursToday, closedMessage]);

  if (process.env.NODE_ENV !== 'development') return null;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeStates: TimeState[] = ['before', 'during', 'after'];

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 rounded-full bg-stone-950/90 p-1 text-stone-100 shadow-lg"
      >
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                    type="button"
                    key={day}
                    onClick={() => setDebugDay(debugDay === index ? null : index)}
                    className={`rounded px-2 py-1 text-xs transition-colors ${
                      debugDay === index
                        ? 'bg-stone-800 text-stone-50'
                        : 'bg-stone-900/50 text-stone-100 hover:bg-stone-800'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="h-6 w-px bg-stone-600" />
              <div className="flex gap-1">
                {timeStates.map((state) => (
                  <button
                    type="button"
                    key={state}
                    onClick={() =>
                      setDebugTimeState(debugTimeState === state ? null : state)
                    }
                    className={`rounded px-2 py-1 text-xs capitalize transition-colors ${
                      debugTimeState === state
                        ? 'bg-stone-800 text-stone-50'
                        : 'bg-stone-900/50 text-stone-100 hover:bg-stone-800'
                    }`}
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
                  type="button"
                  onClick={() => {
                    setDebugDay(null);
                    setDebugTimeState(null);
                  }}
                  className="rounded bg-red-900/50 px-2 py-1 text-xs text-red-100 hover:bg-red-900/70"
                >
                  Reset
                </button>
              </>
            )}
          </div>

          <div className="text-right text-xs text-stone-100">
            {isOpen ? (
              <span>Open Now {hoursToday}</span>
            ) : (
              <span>{closedMessage}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugTools; 