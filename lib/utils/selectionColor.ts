'use client';

import { CONFETTI_COLORS } from '../constants/colors';

const hexToRGBA = (hex: string, alpha = 0.3): string => {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const initializeSelectionColor = () => {
  if (typeof window === 'undefined') return;

  let lastColor = '';
  let isSelecting = false;
  const styleTag = document.createElement('style');
  document.head.appendChild(styleTag);

  // Add base styles with transition
  styleTag.textContent = `
    *::selection {
      transition: background-color 0.25s ease-in-out;
      -webkit-transition: background-color 0.25s ease-in-out;
    }
    *::-moz-selection {
      transition: background-color 0.25s ease-in-out;
      -webkit-transition: background-color 0.25s ease-in-out;
    }
  `;

  const updateSelectionColor = () => {
    let randomColor: string;
    do {
      randomColor =
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    } while (randomColor === lastColor && CONFETTI_COLORS.length > 1);

    lastColor = randomColor;
    const rgbaColor = hexToRGBA(randomColor);

    styleTag.textContent = `
      *::selection {
        transition: background-color 0.3s ease;
        -webkit-transition: background-color 0.3s ease;
        background-color: ${rgbaColor} !important;
        color: currentColor !important;
      }
      *::-moz-selection {
        transition: background-color 0.3s ease;
        -webkit-transition: background-color 0.3s ease;
        background-color: ${rgbaColor} !important;
        color: currentColor !important;
      }
    `;
  };

  // Initialize with a random color
  updateSelectionColor();

  let selectionTimeout: NodeJS.Timeout;

  // Track when selection starts
  document.addEventListener('mousedown', () => {
    const selection = window.getSelection();
    if (selection?.toString().length === 0) {
      isSelecting = true;
      clearTimeout(selectionTimeout);
      requestAnimationFrame(updateSelectionColor);
    }
  });

  // Reset selection state when mouse is released
  document.addEventListener('mouseup', () => {
    isSelecting = false;
  });

  // Debounce selection changes
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection?.toString().length === 0) {
      isSelecting = false;
    } else {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(() => {
        if (!isSelecting) {
          requestAnimationFrame(updateSelectionColor);
        }
      }, 80); // Debounce time
    }
  });

  // Cleanup
  return () => {
    clearTimeout(selectionTimeout);
    document.head.removeChild(styleTag);
  };
};
