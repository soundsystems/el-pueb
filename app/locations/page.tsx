'use client';

import {
  APIProvider,
  AdvancedMarker,
  Map as GoogleMap,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';

import { LocationCard } from '@/components/LocationCard';
import { LoadingSpinner } from '@/components/ui/loading';
import { getRandomMarkerColors } from '@/lib/constants/colors';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import React from 'react';

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
  map: google.maps.Map | null,
  isDarkMode: boolean,
  markerColors: string[],
  selectedLocation: string | null,
  setSelectedLocation: (slug: string | null) => void
) => {
  const markerColor = markerColors[index];
  const markerStyle = {
    backgroundColor: markerColor,
    borderRadius: '50%',
    cursor: 'pointer',
    height: '24px',
    width: '24px',
    transform: 'scale(1.25)',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  return (
    <AdvancedMarker
      position={location.position}
      title={`El Pueblito ${location.name}`}
      onClick={() => {
        setSelectedLocation(
          location.slug === selectedLocation ? null : location.slug
        );
      }}
    >
      <div style={markerStyle} />
      {location.slug === selectedLocation && (
        <InfoWindow
          position={location.position}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div className="p-2">
            <div className="mb-2 flex justify-center">
              <img
                src="/logo.png"
                alt="El Pueblito Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <h3 className="mb-2 text-center font-bold text-base">
              {location.name}
            </h3>
            <p className="mb-2">{location.address}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `El Pueblito ${location.name} ${location.address}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sm transition-opacity hover:opacity-80"
              style={{ color: markerColor }}
            >
              View on Google Maps
            </a>
          </div>
        </InfoWindow>
      )}
    </AdvancedMarker>
  );
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handler);
    return () => darkModeQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <GoogleMap
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID}
        defaultCenter={{ lat: 36.36, lng: -94.25 }}
        defaultZoom={11}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%' }}
      >
        {locations.map((location, index) => (
          <React.Fragment key={location.slug}>
            {createMarker(
              location,
              index,
              map,
              isDarkMode,
              markerColors,
              selectedLocation,
              setSelectedLocation
            )}
          </React.Fragment>
        ))}
      </GoogleMap>
    </div>
  );
};

export default function LocationsPage() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [markerColors, setMarkerColors] = useState<string[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [envVarsLoaded, setEnvVarsLoaded] = useState(false);

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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID as string;
  const darkMapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_DARK_ID as string;

  useEffect(() => {
    // Debug logging for environment variables
    console.log('API Key:', apiKey);
    console.log('Map ID:', mapId);
    console.log('Dark Map ID:', darkMapId);

    // Check if the environment variables have actual values (not just empty strings)
    const hasValidApiKey = apiKey && apiKey.length > 0;
    const hasValidMapId = mapId && mapId.length > 0;

    console.log('Has valid API key:', hasValidApiKey);
    console.log('Has valid Map ID:', hasValidMapId);

    if (hasValidApiKey && hasValidMapId) {
      setEnvVarsLoaded(true);
    }
  }, [apiKey, mapId, darkMapId]);

  if (!envVarsLoaded) {
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
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
          <LoadingSpinner size={32} />
          <p className="text-sm text-stone-600">Loading map configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {mapError && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
          {mapError}
        </div>
      )}
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
            <APIProvider
              apiKey={apiKey}
              libraries={['places', 'marker', 'geometry']}
              version="beta"
              onError={(error: unknown) => {
                console.error('Google Maps Error:', error);
                setMapError(
                  error instanceof Error
                    ? error.message
                    : 'An error occurred loading the map'
                );
              }}
            >
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
