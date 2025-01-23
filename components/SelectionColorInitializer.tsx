'use client';

import { initializeSelectionColor } from '@/lib/utils/selectionColor';
import { useEffect } from 'react';

export default function SelectionColorInitializer() {
  useEffect(() => {
    initializeSelectionColor();
  }, []);

  return null;
}
