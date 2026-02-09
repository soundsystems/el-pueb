"use client";

import {
  AdvancedMarker,
  APIProvider,
  Map as GoogleMap,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { Vortex } from "react-loader-spinner";
import { LocationCard } from "@/components/LocationCard";
import { getRandomMarkerColors } from "@/lib/constants/colors";

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
    name: "Bella Vista",
    address: "1707 Forest Hills Blvd, Bella Vista, AR 72715",
    phone: "+1-479-855-2324",
    slug: "bella-vista",
    position: { lat: 36.465_982_9, lng: -94.299_773_7 },
    placeId: "ChIJ6UYv8unz0IcRDeDm1icSF4g",
    hours: {
      weekdays: "Mon-Thu & Sun: 11:00 AM - 9:00 PM",
      weekend: "Fri-Sat: 11:00 AM - 10:00 PM",
    },
  },
  {
    name: "Highfill",
    address: "708 NW Highfill St, Gentry, AR 72734",
    phone: "+1-479-525-6034",
    slug: "highfill",
    position: { lat: 36.261_932_2, lng: -94.349_853_7 },
    placeId: "ChIJN48WaACL0IcRgQJ8z9j_XE8",
    hours: {
      weekdays: "Mon-Thu & Sun: 11:00 AM - 9:00 PM",
      weekend: "Fri-Sat: 11:00 AM - 10:00 PM",
    },
  },
  {
    name: "Prairie Creek",
    address: "14340 AR-12, Rogers, AR 72756",
    phone: "+1-479-372-6275",
    slug: "prairie-creek",
    position: { lat: 36.340_494_9, lng: -94.065_079_9 },
    placeId: "ChIJj4N21mE92IcRiswN1sLGnCE",
    hours: {
      weekdays: "Mon-Thu & Sun: 11:00 AM - 9:00 PM",
      weekend: "Fri-Sat: 11:00 AM - 10:00 PM",
    },
  },
  {
    name: "Centerton",
    address: "300 E Centerton Blvd, Centerton, AR 72719",
    phone: "+1-479-224-4820",
    slug: "centerton",
    position: { lat: 36.359_298_7, lng: -94.282_226_5 },
    placeId: "ChIJ87Jm17AP0IcRybiTHtVWpUQ",
    hours: {
      weekdays: "Mon-Thu & Sun: 11:00 AM - 9:00 PM",
      weekend: "Fri-Sat: 11:00 AM - 10:00 PM",
    },
  },
];

const createMarker = (
  location: Location,
  index: number,
  isDarkMode: boolean,
  markerColors: string[],
  selectedLocation: string | null,
  setSelectedLocation: (slug: string | null) => void
) => {
  const markerColor = markerColors[index];
  const markerStyle = {
    backgroundColor: markerColor,
    borderRadius: "50%",
    cursor: "pointer",
    height: "24px",
    width: "24px",
    transform: "scale(1.25)",
    border: "2px solid white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    zIndex: location.slug === selectedLocation ? 1 : 10,
  };

  return (
    <AdvancedMarker
      onClick={() => {
        setSelectedLocation(
          location.slug === selectedLocation ? null : location.slug
        );
      }}
      position={location.position}
      title={location.name}
    >
      <div style={markerStyle} />
      {location.slug === selectedLocation && (
        <InfoWindow
          maxWidth={320}
          onCloseClick={() => setSelectedLocation(null)}
          position={location.position}
        >
          <div
            className="rounded-lg p-2 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2"
            style={
              {
                "--tw-outline-color": markerColor,
              } as React.CSSProperties
            }
          >
            <div className="mb-4 flex justify-center">
              <img
                alt="El Pueblito"
                className="h-20 w-auto object-contain"
                src="/logo.png"
              />
            </div>
            <h3 className="mb-2 flex justify-center font-bold text-base">
              {location.name}
            </h3>
            <p className="mb-3 text-center">{location.address}</p>
            <div className="mb-1 flex justify-center">
              <a
                autoFocus
                className="inline-block rounded px-3 py-1 font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `El Pueblito ${location.name} ${location.address}`
                )}`}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = markerColor;
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = markerColor;
                  e.currentTarget.style.color = "#f5f5f4"; // stone-50
                }}
                rel="noopener noreferrer"
                style={
                  {
                    color: markerColor,
                    backgroundColor: "transparent",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: markerColor,
                    "--tw-ring-offset-width": "2px",
                    "--tw-ring-offset-color": "#fff",
                    "--tw-ring-color": markerColor,
                    "--tw-ring-offset-shadow": "0 0 #0000",
                    "--tw-ring-shadow": "0 0 #0000",
                    boxShadow:
                      "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow, 0 0 #0000)",
                  } as React.CSSProperties
                }
                target="_blank"
              >
                View on Google Maps
              </a>
            </div>
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
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener("change", handler);
    return () => darkModeQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <GoogleMap
        defaultCenter={{ lat: 36.36, lng: -94.25 }}
        defaultZoom={11}
        disableDefaultUI={false}
        gestureHandling={"greedy"}
        style={{ width: "100%", height: "100%" }}
      >
        {locations.map((location, index) => (
          <React.Fragment key={location.slug}>
            {createMarker(
              location,
              index,
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
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  useEffect(() => {
    setMarkerColors(getRandomMarkerColors());
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1547);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!envVarsLoaded) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev <= 0 ? locations.length - 1 : prev - 1
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev === locations.length - 1 ? 0 : prev + 1
          );
          break;
        case "Enter":
          if (focusedIndex >= 0) {
            setSelectedLocation(
              selectedLocation === locations[focusedIndex].slug
                ? null
                : locations[focusedIndex].slug
            );
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [envVarsLoaded, focusedIndex, selectedLocation]);

  const selectedLocationData = locations.find(
    (loc) => loc.slug === selectedLocation
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  useEffect(() => {
    // Check if the environment variables have actual values (not just empty strings)
    const hasValidApiKey = apiKey.length > 0;

    // Log API key status (first 10 chars only for security)
    if (hasValidApiKey) {
      console.log(
        "Google Maps API Key loaded:",
        `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`
      );
      console.log("Current domain:", window.location.hostname);
      console.log("Current origin:", window.location.origin);
    } else {
      console.error("Google Maps API Key is missing or empty");
    }

    // Listen for Google Maps errors that might not be caught by onError
    const handleGoogleMapsError = (event: ErrorEvent) => {
      if (
        event.message?.includes("Google Maps") ||
        event.message?.includes("maps.googleapis.com") ||
        event.filename?.includes("maps.googleapis.com")
      ) {
        console.error("Google Maps Error Event:", {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        });
        setMapError(
          `Google Maps error: ${event.message || "Unknown error"}`
        );
      }
    };

    // Listen for unhandled promise rejections from Google Maps
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        typeof reason === "string" &&
        (reason.includes("Google Maps") ||
          reason.includes("BillingNotEnabled") ||
          reason.includes("RefererNotAllowed") ||
          reason.includes("ApiKeyInvalid"))
      ) {
        console.error("Google Maps Promise Rejection:", reason);
        setMapError(`Google Maps error: ${reason}`);
      } else if (reason instanceof Error) {
        const errorMsg = reason.message.toLowerCase();
        if (
          errorMsg.includes("billingnotenabled") ||
          errorMsg.includes("referer") ||
          errorMsg.includes("apikey")
        ) {
          console.error("Google Maps Error Object:", reason);
          setMapError(`Google Maps error: ${reason.message}`);
        }
      }
    };

    window.addEventListener("error", handleGoogleMapsError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    setEnvVarsLoaded(hasValidApiKey);

    return () => {
      window.removeEventListener("error", handleGoogleMapsError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [apiKey]);

  if (!envVarsLoaded) {
    const StaticColors = [
      "#231F20", // black
      "#006847", // green
      "#CF0822", // crimson
      "#F1A720", // gold
      "#065955", // teal
      "#AA8C30", // brown
    ] as [string, string, string, string, string, string];

    return (
      <div className="container mx-auto px-4">
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none mb-2 select-none text-center font-black text-2xl text-stone-900 md:mb-4 md:text-4xl"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          Our Locations
        </motion.h1>
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
          <div className={undefined}>
            <Vortex
              ariaLabel="vortex-loading"
              colors={StaticColors}
              height={32}
              visible={true}
              width={32}
              wrapperClass="vortex-wrapper"
            />
          </div>
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
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-none mb-2 select-none pt-4 text-center font-black text-3xl text-stone-900 md:mb-4 md:pt-6 md:text-5xl"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        Our Locations
      </motion.h1>

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1 }}
          className={`grid gap-4 md:gap-8 ${isLargeScreen ? "lg:grid-cols-2" : "grid-cols-1"}`}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={isLargeScreen ? "large" : "small"}
          transition={{ duration: 0.2 }}
        >
          {markerColors.length > 0 &&
            locations.map((location, index) => (
              <LocationCard
                index={index}
                isFocused={index === focusedIndex}
                key={location.slug}
                location={location}
                markerColor={markerColors[index] || "#000000"}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
              />
            ))}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedLocationData && markerColors.length > 0 && (
          <motion.div
            animate={{ opacity: 1, height: isLargeScreen ? 400 : 400 }}
            className="mt-8 w-full overflow-hidden rounded-xl bg-stone-50/70 shadow-lg"
            exit={{ opacity: 0, height: 0 }}
            id="map-container"
            initial={{ opacity: 0, height: 0 }}
            layout
            transition={{ duration: 0.3 }}
          >
            <APIProvider
              apiKey={apiKey}
              libraries={["marker", "geometry"]}
              onError={(error: unknown) => {
                console.error("Google Maps API Error (onError callback):", error);
                console.error("Error type:", typeof error);
                console.error("Error constructor:", error?.constructor?.name);
                
                if (error instanceof Error) {
                  console.error("Error stack:", error.stack);
                }

                const errorMessage =
                  error instanceof Error ? error.message : String(error);
                const errorString = errorMessage.toLowerCase();

                // Log the full error object for debugging
                try {
                  const errorDetails = error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message,
                        stack: error.stack,
                      }
                    : error;
                  console.error("Full error details:", errorDetails);
                } catch {
                  console.error("Could not serialize error object");
                }

                if (
                  errorString.includes("billingnotenabled") ||
                  errorString.includes("billing")
                ) {
                  setMapError(
                    "Google Maps billing is not enabled. Please enable billing in Google Cloud Console."
                  );
                } else if (
                  errorString.includes("referer") ||
                  errorString.includes("referrer") ||
                  errorString.includes("not allowed") ||
                  errorString.includes("referernotallowed")
                ) {
                  setMapError(
                    `API key referrer restrictions are blocking this domain. Current domain: ${window.location.hostname}. Check HTTP referrer restrictions in Google Cloud Console and ensure they include: ${window.location.origin}/* and ${window.location.hostname}/*`
                  );
                } else if (
                  errorString.includes("invalid") ||
                  errorString.includes("key") ||
                  errorString.includes("apikeyinvalid")
                ) {
                  setMapError(
                    "Invalid API key. Please verify your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable."
                  );
                } else {
                  setMapError(
                    `Map error: ${errorMessage || "Unknown error occurred"}`
                  );
                }
              }}
              version="beta"
            >
              <MapComponent
                locations={locations}
                markerColors={markerColors}
                onMarkersInit={() => {}}
                position={selectedLocationData.position}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
              />
            </APIProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
