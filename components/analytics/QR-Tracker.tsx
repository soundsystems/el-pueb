'use client';

import { type Location, type QRSource, trackQRVisit } from '@/lib/analytics';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function QRTracker() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const location = searchParams.get('location');
    const source = searchParams.get('source');

    // Validate parameters before tracking
    if (
      location &&
      source &&
      ['bella-vista', 'rogers', 'highfill', 'centerton'].includes(location) &&
      ['bar', 'table'].includes(source)
    ) {
      trackQRVisit({
        location: location as Location,
        source: source as QRSource,
        page: pathname,
      });
    }
  }, [searchParams, pathname]);

  // Return null since this is a utility component
  return null;
}
