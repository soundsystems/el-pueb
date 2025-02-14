import { sendGAEvent } from '@next/third-parties/google';

// Type definitions for our tracking parameters
export type QRSource = 'bar' | 'table';
export type Location = 'bella-vista' | 'rogers' | 'highfill' | 'centerton';

export interface QRTrackingParams {
  location: Location;
  source: QRSource;
  page: string;
}

// Analytics utility functions
export const trackQRVisit = ({ location, source, page }: QRTrackingParams) => {
  sendGAEvent('qr_code_visit', {
    location,
    source,
    page,
    timestamp: new Date().toISOString(),
  });
};
