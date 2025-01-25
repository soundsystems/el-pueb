import { useEffect, useState } from 'react';

type DaySchedule = {
  open: string;
  close: string;
};

const HOURS: { [key: number]: DaySchedule } = {
  0: { open: '11:00', close: '21:00' }, // Sunday
  1: { open: '11:00', close: '21:00' }, // Monday
  2: { open: '11:00', close: '21:00' }, // Tuesday
  3: { open: '11:00', close: '21:00' }, // Wednesday
  4: { open: '11:00', close: '21:00' }, // Thursday
  5: { open: '11:00', close: '22:00' }, // Friday
  6: { open: '11:00', close: '22:00' }, // Saturday
};

export const useRestaurantHours = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoursToday, setHoursToday] = useState('');
  const [closedMessage, setClosedMessage] = useState('');

  useEffect(() => {
    const getClosedMessage = (now: Date, schedule: DaySchedule) => {
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const [openHour] = schedule.open.split(':').map(Number);
      const [closeHour] = schedule.close.split(':').map(Number);
      const openTime = openHour * 100;
      const closeTime = closeHour * 100;

      if (currentTime < openTime) {
        // Before opening
        const openingTime = new Date(now).setHours(openHour, 0);
        return `Opening Soon at ${formatTime(openingTime)}`;
      }
      if (currentTime >= closeTime) {
        // After closing
        return 'Closed Until Tomorrow';
      }
      return '';
    };

    const checkIfOpen = () => {
      const now = new Date();
      const day = now.getDay();
      const schedule = HOURS[day];

      if (!schedule) {
        return false;
      }

      const currentTime = now.getHours() * 100 + now.getMinutes();
      const [openHour, openMinute] = schedule.open.split(':').map(Number);
      const [closeHour, closeMinute] = schedule.close.split(':').map(Number);
      const openTime = openHour * 100 + openMinute;
      const closeTime = closeHour * 100 + closeMinute;

      const formattedOpen = new Date().setHours(openHour, openMinute);
      const formattedClose = new Date().setHours(closeHour, closeMinute);

      setHoursToday(`until ${formatTime(formattedClose)}`);

      const isCurrentlyOpen =
        currentTime >= openTime && currentTime < closeTime;
      if (!isCurrentlyOpen) {
        setClosedMessage(getClosedMessage(now, schedule));
      }
      return isCurrentlyOpen;
    };

    const formatTime = (date: number) => {
      return new Date(date).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    const updateStatus = () => {
      setIsOpen(checkIfOpen());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return { isOpen, hoursToday, closedMessage };
};
