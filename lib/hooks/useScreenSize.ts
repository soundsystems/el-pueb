import { useEffect, useState } from 'react';

export function useScreenSize() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };

    // Initial check
    checkScreenSize();

    // Add resize observer for smoother transitions
    const resizeObserver = new ResizeObserver(() => {
      checkScreenSize();
    });
    resizeObserver.observe(document.body);

    // Backup with regular event listener
    window.addEventListener('resize', checkScreenSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return isLargeScreen;
}
