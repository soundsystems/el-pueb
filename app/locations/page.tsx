'use client';

import {
  APIProvider,
  Map as GoogleMap,
  useMap,
} from '@vis.gl/react-google-maps';

import { LocationCard } from '@/components/LocationCard';
import { getRandomMarkerColors } from '@/lib/constants/colors';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type Location = {
  name: string;
  address: string;
  phone: string;
  slug: string;
  position: { lat: number; lng: number };
  placeId: string;
  hours: {
    weekdays: string;
    weekend: string;
  };
};

const locations: Location[] = [
  {
    name: 'Bella Vista',
    address: '1707 Forest Hills Blvd, Bella Vista, AR 72715',
    phone: '+1-479-855-2324',
    slug: 'bella-vista',
    position: { lat: 36.4659829, lng: -94.2997737 },
    placeId: 'ChIJ6UYv8unz0IcRDeDm1icSF4g',
    hours: {
      weekdays: 'Mon-Thu & Sun 11am-9pm',
      weekend: 'Fri-Sat 11am-10pm',
    },
  },
  {
    name: 'Highfill',
    address: '708 NW Highfill St, Gentry, AR 72734',
    phone: '+1-479-525-6034',
    slug: 'highfill',
    position: { lat: 36.2619322, lng: -94.3498537 },
    placeId: 'ChIJN48WaACL0IcRgQJ8z9j_XE8',
    hours: {
      weekdays: 'Mon-Thu & Sun 11am-9pm',
      weekend: 'Fri-Sat 11am-10pm',
    },
  },
  {
    name: 'Prairie Creek',
    address: '14340 AR-12, Rogers, AR 72756',
    phone: '+1-479-372-6275',
    slug: 'prairie-creek',
    position: { lat: 36.3404949, lng: -94.0650799 },
    placeId: 'ChIJj4N21mE92IcRiswN1sLGnCE',
    hours: {
      weekdays: 'Mon-Thu & Sun 11am-9pm',
      weekend: 'Fri-Sat 11am-10pm',
    },
  },
  {
    name: 'Centerton',
    address: '300 E Centerton Blvd, Centerton, AR 72719',
    phone: '+1-479-224-4820',
    slug: 'centerton',
    position: { lat: 36.3592987, lng: -94.2822265 },
    placeId: 'ChIJ87Jm17AP0IcRybiTHtVWpUQ',
    hours: {
      weekdays: 'Mon-Thu & Sun 11am-9pm',
      weekend: 'Fri-Sat 11am-10pm',
    },
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
    if (!map) {
      return;
    }
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
  markerColors,
}: {
  position: { lat: number; lng: number };
  locations: Location[];
  selectedLocation: string | null;
  setSelectedLocation: (slug: string | null) => void;
  onMarkersInit: (colors: string[]) => void;
  markerColors: string[];
}) => {
  const map = useMap();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode preference
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handler);
    return () => darkModeQuery.removeEventListener('change', handler);
  }, []);

  // Initialize markers
  useEffect(() => {
    if (!map) {
      return;
    }

    // Clear existing markers
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
        markerColors,
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
  }, [
    map,
    locations,
    selectedLocation,
    setSelectedLocation,
    markerColors,
    isDarkMode,
  ]);

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
      const markerColor = markerColors[locationIndex];

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
          marker.content.style.backgroundColor = markerColors[index];
        }
      });
    }
  }, [map, selectedLocation, locations, markerColors, isDarkMode]);

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

export default function LocationsPage() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [markerColors, setMarkerColors] = useState<string[]>([]);

  useEffect(() => {
    setMarkerColors(getRandomMarkerColors());
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
        className="pointer-events-none mb-2 select-none text-center font-black text-2xl text-stone-900 md:mb-4 md:text-4xl"
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
          {markerColors.length > 0 &&
            locations.map((location, index) => (
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
        {selectedLocationData && markerColors.length > 0 && (
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
                onMarkersInit={() => {}}
                markerColors={markerColors}
              />
            </APIProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
