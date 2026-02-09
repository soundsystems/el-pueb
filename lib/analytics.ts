import { sendGAEvent } from "@next/third-parties/google";

// Type definitions for our tracking parameters
export type QRSource = "bar" | "table";
export type Location = "bella-vista" | "rogers" | "highfill" | "centerton";

export interface QRTrackingParams {
  location: Location;
  source: QRSource;
  page: string;
}

// Analytics utility functions
export const trackQRVisit = ({ location, source, page }: QRTrackingParams) => {
  sendGAEvent("qr_code_visit", {
    location,
    source,
    page,
    timestamp: new Date().toISOString(),
  });
};

// Lightbox and image interaction tracking
export const trackLightboxOpen = (imageData: {
  src: string;
  alt: string;
  caption: string;
  category: string;
  index: number;
}) => {
  sendGAEvent("lightbox_open", {
    image_src: imageData.src,
    image_alt: imageData.alt,
    image_caption: imageData.caption,
    category: imageData.category,
    image_index: imageData.index,
    timestamp: new Date().toISOString(),
  });
};

export const trackLightboxNavigation = (
  direction: "prev" | "next",
  imageData: {
    src: string;
    alt: string;
    caption: string;
    category: string;
    index: number;
  }
) => {
  sendGAEvent("lightbox_navigation", {
    direction,
    image_src: imageData.src,
    image_alt: imageData.alt,
    image_caption: imageData.caption,
    category: imageData.category,
    image_index: imageData.index,
    timestamp: new Date().toISOString(),
  });
};

export const trackLightboxClose = (imageData: {
  src: string;
  alt: string;
  caption: string;
  category: string;
  index: number;
  viewDuration: number; // in milliseconds
}) => {
  sendGAEvent("lightbox_close", {
    image_src: imageData.src,
    image_alt: imageData.alt,
    image_caption: imageData.caption,
    category: imageData.category,
    image_index: imageData.index,
    view_duration_ms: imageData.viewDuration,
    timestamp: new Date().toISOString(),
  });
};

export const trackImageEngagement = (imageData: {
  src: string;
  alt: string;
  caption: string;
  category: string;
  index: number;
  action: "click" | "hover" | "view";
  location: "hero" | "lightbox" | "carousel";
}) => {
  sendGAEvent("image_engagement", {
    image_src: imageData.src,
    image_alt: imageData.alt,
    image_caption: imageData.caption,
    category: imageData.category,
    image_index: imageData.index,
    action: imageData.action,
    location: imageData.location,
    timestamp: new Date().toISOString(),
  });
};

export const trackCarouselInteraction = (
  action: "next" | "prev" | "autoplay",
  category: string,
  currentIndex: number
) => {
  sendGAEvent("carousel_interaction", {
    action,
    category,
    current_index: currentIndex,
    timestamp: new Date().toISOString(),
  });
};

export const trackTabSwitch = (fromTab: string, toTab: string) => {
  sendGAEvent("tab_switch", {
    from_tab: fromTab,
    to_tab: toTab,
    timestamp: new Date().toISOString(),
  });
};
