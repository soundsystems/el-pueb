"use client";
import { useEffect, useState } from "react";

type DaySchedule = {
  open: string;
  close: string;
};

const HOURS: { [key: number]: DaySchedule } = {
  0: { open: "11:00 AM", close: "9:00 PM" }, // Sunday
  1: { open: "11:00 AM", close: "9:00 PM" }, // Monday
  2: { open: "11:00 AM", close: "9:00 PM" }, // Tuesday
  3: { open: "11:00 AM", close: "9:00 PM" }, // Wednesday
  4: { open: "11:00 AM", close: "9:00 PM" }, // Thursday
  5: { open: "11:00 AM", close: "10:00 PM" }, // Friday
  6: { open: "11:00 AM", close: "10:00 PM" }, // Saturday
};

type DebugOptions = {
  debugDate?: Date;
  debugTime?: string;
};

export const useRestaurantHours = (debugOptions?: DebugOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoursToday, setHoursToday] = useState("");
  const [closedMessage, setClosedMessage] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const getClosedMessage = (now: Date, schedule: DaySchedule) => {
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const { hours: openHour, minutes: openMinute } = parseTime(schedule.open);
      const openTime = new Date(now);
      openTime.setHours(openHour, openMinute, 0, 0);

      if (currentTime < openHour * 100) {
        // Before opening
        return `¡Buenos días! We open at ${formatTime(openTime.getTime())}`;
      }
      if (currentTime >= openHour * 100) {
        // After closing
        return `Closed until ${formatTime(openTime.getTime())} Tomorrow`;
      }
      return "";
    };

    const formatTime = (date: number) =>
      new Date(date).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      return {
        hours:
          period === "PM" && hours !== 12
            ? hours + 12
            : period === "AM" && hours === 12
              ? 0
              : hours,
        minutes,
      };
    };

    const checkIfOpen = () => {
      let now: Date;

      if (debugOptions?.debugDate && debugOptions?.debugTime) {
        const [hours, minutes] = debugOptions.debugTime.split(":").map(Number);
        now = new Date(debugOptions.debugDate);
        now.setHours(hours, minutes);
      } else {
        now = new Date();
      }

      const day = now.getDay();
      const schedule = HOURS[day];

      if (!schedule) {
        return false;
      }

      const currentTime = now.getHours() * 100 + now.getMinutes();
      const { hours: openHour, minutes: openMinute } = parseTime(schedule.open);
      const { hours: closeHour, minutes: closeMinute } = parseTime(
        schedule.close
      );
      const openTime = openHour * 100 + openMinute;
      const closeTime = closeHour * 100 + closeMinute;

      const formattedOpen = new Date(now).setHours(openHour, openMinute);
      const formattedClose = new Date(now).setHours(closeHour, closeMinute);

      setHoursToday(`until ${formatTime(formattedClose)}`);

      const isCurrentlyOpen =
        currentTime >= openTime && currentTime < closeTime;
      if (!isCurrentlyOpen) {
        setClosedMessage(getClosedMessage(now, schedule));
      }
      return isCurrentlyOpen;
    };

    const updateStatus = () => {
      setIsOpen(checkIfOpen());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60_000); // Check every minute

    return () => clearInterval(interval);
  }, [isClient, debugOptions?.debugDate, debugOptions?.debugTime]);

  return { isOpen, hoursToday, closedMessage };
};
