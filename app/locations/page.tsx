'use client';

import {
  APIProvider,
  Map as GoogleMap,
  useMap,
} from '@vis.gl/react-google-maps';

import { getRandomMarkerColors } from '@/lib/constants/colors';
import { MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type Location = {
  name: string;
  address: string;
  phone: string;
  slug: string;
  position: { lat: number; lng: number };
  placeId: string;
};

const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

const locations: Location[] = [
  {
    name: 'Bella Vista',
    address: '1707 Forest Hills Blvd, Bella Vista, AR 72715',
    phone: '+1-479-855-2324',
    slug: 'bella-vista',
    position: { lat: 36.4659829, lng: -94.2997737 },
    placeId: 'ChIJ6UYv8unz0IcRDeDm1icSF4g',
  },
  {
    name: 'Highfill',
    address: '708 NW Highfill St, Gentry, AR 72734',
    phone: '+1-479-525-6034',
    slug: 'highfill',
    position: { lat: 36.2619322, lng: -94.3498537 },
    placeId: 'ChIJN48WaACL0IcRgQJ8z9j_XE8',
  },
  {
    name: 'Prairie Creek',
    address: '14340 AR-12, Rogers, AR 72756',
    phone: '+1-479-372-6275',
    slug: 'prairie-creek',
    position: { lat: 36.3404949, lng: -94.0650799 },
    placeId: 'ChIJj4N21mE92IcRiswN1sLGnCE',
  },
  {
    name: 'Centerton',
    address: '300 E Centerton Blvd, Centerton, AR 72719',
    phone: '+1-479-224-4820',
    slug: 'centerton',
    position: { lat: 36.3592987, lng: -94.2822265 },
    placeId: 'ChIJ87Jm17AP0IcRybiTHtVWpUQ',
  },
];

const createMarker = (
  location: Location,
  index: number,
  map: google.maps.Map,
  isDarkMode: boolean,
  markerColors: string[],
  infoWindowRef: React.MutableRefObject<google.maps.InfoWindow | null>,
  selectedLocation: string | null,
  setSelectedLocation: (slug: string | null) => void
) => {
  const markerColor = markerColors[index];
  const marker = new google.maps.marker.AdvancedMarkerElement({
    map,
    position: location.position,
    title: `El Pueblito ${location.name}`,
    content: document.createElement('div'),
  });

  if (marker.content instanceof HTMLElement) {
    marker.content.style.width = '24px';
    marker.content.style.height = '24px';
    marker.content.style.borderRadius = '50%';
    marker.content.style.backgroundColor = markerColor;
    marker.content.style.cursor = 'pointer';
    marker.content.style.transform = 'scale(1.25)';
  }

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="padding: 8px; color: ${isDarkMode ? '#ffffff' : '#000000'}; background-color: ${isDarkMode ? '#1f1f1f' : '#ffffff'};">
        <style>
          .gm-ui-hover-effect {
            outline: none !important;
          }
          .maps-link {
            color: ${markerColor};
            text-decoration: none;
            transition: filter 0.2s ease;
          }
          .maps-link:hover {
            filter: brightness(0.7);
          }
        </style>
        <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold;">El Pueblito ${location.name}</h3>
        <p style="margin: 0 0 8px;">${location.address}</p>
        <a 
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `El Pueblito ${location.name} ${location.address}`
          )}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="maps-link"
          tabindex="-1"
        >View on Google Maps</a>
      </div>
    `,
  });

  marker.addListener('click', () => {
    if (!map) return;
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
    infoWindow.open({ map, anchor: marker });
    infoWindowRef.current = infoWindow;
    setSelectedLocation(
      location.slug === selectedLocation ? null : location.slug
    );
  });

  if (location.slug === selectedLocation) {
    infoWindow.open({ map, anchor: marker });
    infoWindowRef.current = infoWindow;
  }

  return marker;
};

const MapComponent = ({
  locations,
  selectedLocation,
  setSelectedLocation,
  onMarkersInit,
}: {
  position: { lat: number; lng: number };
  locations: Location[];
  selectedLocation: string | null;
  setSelectedLocation: (slug: string | null) => void;
  onMarkersInit: (colors: string[]) => void;
}) => {
  const map = useMap();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markerColorsRef = useRef<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode preference
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handler);
    return () => darkModeQuery.removeEventListener('change', handler);
  }, []);

  // Initialize random colors on mount
  useEffect(() => {
    markerColorsRef.current = getRandomMarkerColors();
    onMarkersInit(markerColorsRef.current);
  }, [onMarkersInit]);

  // Initialize markers
  useEffect(() => {
    if (!map) {
      return;
    }

    for (const marker of markersRef.current) {
      marker.map = null;
    }
    markersRef.current = [];

    markersRef.current = locations.map((location, index) =>
      createMarker(
        location,
        index,
        map,
        isDarkMode,
        markerColorsRef.current,
        infoWindowRef,
        selectedLocation,
        setSelectedLocation
      )
    );

    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      for (const marker of markersRef.current) {
        marker.map = null;
      }
      markersRef.current = [];
    };
  }, [map, locations, selectedLocation, setSelectedLocation, isDarkMode]);

  // Handle selection changes
  useEffect(() => {
    if (!map || !markersRef.current.length) {
      return;
    }

    // Close any existing info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    if (selectedLocation) {
      const locationIndex = locations.findIndex(
        (loc) => loc.slug === selectedLocation
      );
      const marker = markersRef.current[locationIndex];
      const location = locations[locationIndex];
      const markerColor = markerColorsRef.current[locationIndex];

      if (marker) {
        // Update marker appearance
        if (marker.content instanceof HTMLElement) {
          marker.content.style.backgroundColor = markerColor;
        }

        // Create and show info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; color: ${isDarkMode ? '#ffffff' : '#000000'}; background-color: ${isDarkMode ? '#1f1f1f' : '#ffffff'};">
              <style>
                .gm-ui-hover-effect {
                  outline: none !important;
                }
                .maps-link {
                  color: ${markerColor};
                  filter: brightness(0.85);
                  font-weight: 600;
                  text-decoration: none;
                  transition: filter 0.2s ease;
                }
                .maps-link:hover {
                  filter: brightness(0.65);
                }
              </style>
              <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold;">El Pueblito ${location.name}</h3>
              <p style="margin: 0 0 8px;">${location.address}</p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `El Pueblito ${location.name} ${location.address}`
                )}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="maps-link"
                tabindex="-1"
              >View on Google Maps</a>
            </div>
          `,
        });

        infoWindow.open({
          map,
          anchor: marker,
        });

        infoWindowRef.current = infoWindow;

        // Pan to selected location
        map.panTo(location.position);
        map.setZoom(16);
      }
    } else {
      // Reset marker appearances
      markersRef.current.forEach((marker, index) => {
        if (marker.content instanceof HTMLElement) {
          marker.content.style.backgroundColor = markerColorsRef.current[index];
        }
      });
    }
  }, [map, selectedLocation, locations, isDarkMode]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <GoogleMap
        mapId={
          isDarkMode
            ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_DARK_ID ||
              'YOUR_DARK_MAP_ID_HERE'
            : process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID || 'YOUR_LIGHT_MAP_ID_HERE'
        }
        defaultCenter={{ lat: 36.36, lng: -94.25 }}
        defaultZoom={11}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

const LocationCard = ({
  location,
  selectedLocation,
  setSelectedLocation,
  markerColor,
}: {
  location: Location;
  selectedLocation: string | null;
  setSelectedLocation: (slug: string | null) => void;
  markerColor: string;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{
      layout: springTransition,
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    }}
    className="mx-auto w-full max-w-[800px]"
  >
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        layout: springTransition,
        scale: { type: "spring", stiffness: 300, damping: 25 }
      }}
      className={`relative flex h-full w-full cursor-pointer overflow-hidden rounded-xl bg-stone-50/70 shadow-lg shadow-stone-950/75 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${selectedLocation === location.slug ? 'bg-stone-950/90' : ''}`}
      onClick={() => setSelectedLocation(selectedLocation === location.slug ? null : location.slug)}
      style={{ '--marker-color': markerColor } as React.CSSProperties}
    >
      <motion.div
        layout
        transition={{ layout: springTransition }}
        className="flex flex-1 flex-col justify-between p-4 md:p-6"
      >
        <div>
          <motion.h2
            layout
            transition={{ layout: springTransition }}
            className={`mb-1 font-black text-xl md:mb-2 md:text-2xl ${selectedLocation === location.slug ? 'text-stone-50' : 'text-stone-900'}`}
          >
            {location.name}
          </motion.h2>
          <motion.div
            layout
            transition={{ layout: springTransition }}
            className={`flex items-start gap-1 md:gap-2 ${
              selectedLocation === location.slug
                ? 'text-stone-300'
                : 'text-stone-600'
            }`}
          >
            <MapPin className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `El Pueblito ${location.name} ${location.address}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold text-xs transition-all duration-300 md:text-sm xl:text-md ${
                selectedLocation === location.slug
                  ? 'text-[color:var(--marker-color)] hover:brightness-75 md:text-stone-50 md:hover:text-[color:var(--marker-color)] md:hover:brightness-100'
                  : 'text-stone-600 hover:text-[color:var(--marker-color)]'
              }`}
            >
              {location.address}
            </Link>
          </motion.div>
        </div>
        <motion.div
          layout
          transition={{ layout: springTransition }}
          className="mt-auto"
        >
          <Link href={`tel:${location.phone}`}>
            <motion.p
              layout
              transition={{ layout: springTransition }}
              className={`mt-1 font-bold text-xs decoration-[2px] transition-all duration-300 md:text-sm ${
                selectedLocation === location.slug
                  ? 'text-stone-50 underline'
                  : 'text-stone-900 no-underline hover:underline'
              } hover:text-[color:var(--marker-color)]`}
              style={{ textDecorationColor: markerColor }}
            >
              {location.phone}
            </motion.p>
          </Link>
        </motion.div>
      </motion.div>
      <motion.div
        layout
        transition={{ layout: springTransition }}
        className="relative flex h-full w-[140px] flex-shrink-0 items-center justify-center p-4 md:w-[280px]"
      >
        <div className="relative h-[120px] w-full overflow-hidden rounded-xl md:h-[180px]">
          <Image
            src={`/images/locations/${location.slug}.jpg`}
            alt={`${location.name} location`}
            width={1600}
            height={900}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export default function LocationsPage() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [markerColors, setMarkerColors] = useState<string[]>([]);

  const handleMarkersInit = useCallback((colors: string[]) => {
    setMarkerColors(colors);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const selectedLocationData = locations.find(
    (loc) => loc.slug === selectedLocation
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <motion.h1
        className="mb-2 text-center font-black text-2xl text-stone-900 md:mb-4 md:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        Our Locations
      </motion.h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLargeScreen ? 'large' : 'small'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`grid gap-4 md:gap-8 ${isLargeScreen ? 'lg:grid-cols-2' : 'grid-cols-1'}`}
        >
          {locations.map((location, index) => (
            <LocationCard
              key={location.slug}
              location={location}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              markerColor={markerColors[index] || '#000000'}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedLocationData && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: isLargeScreen ? 400 : 400 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 w-full overflow-hidden rounded-xl bg-stone-50/70 shadow-lg"
          >
            <APIProvider apiKey={apiKey} libraries={['places', 'marker']}>
              <MapComponent
                position={selectedLocationData.position}
                locations={locations}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                onMarkersInit={handleMarkersInit}
              />
            </APIProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
