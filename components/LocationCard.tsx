import { m as motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Location {
  address: string;
  hours: {
    weekdays: string;
    weekend: string;
  };
  name: string;
  phone: string;
  slug: string;
}

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

export const LocationCard = ({
  location,
  selectedLocation,
  setSelectedLocation,
  markerColor,
  isFocused,
  index,
}: {
  location: Location;
  selectedLocation: string | null;
  setSelectedLocation: (slug: string | null) => void;
  markerColor: string;
  isFocused: boolean;
  index: number;
}) => (
  <motion.div
    animate={{ opacity: 1, scale: 1 }}
    className="mx-auto w-full max-w-[800px]"
    exit={{ opacity: 0, scale: 0.9 }}
    initial={{ opacity: 0, scale: 0.9 }}
    layout
    transition={{
      layout: springTransition,
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    }}
  >
    <motion.button
      aria-label={`${location.name} location information. Use up and down arrow keys to navigate between locations.`}
      className={`relative flex h-full w-full overflow-hidden rounded-xl bg-stone-50/70 shadow-lg shadow-stone-950/75 backdrop-blur-sm transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[color:var(--marker-color)] focus:ring-offset-2 ${
        selectedLocation === location.slug ? "bg-stone-950/90" : ""
      } ${isFocused ? "ring-2 ring-[color:var(--marker-color)] ring-offset-2" : ""}`}
      data-index={index}
      layout
      onClick={() => {
        setSelectedLocation(
          selectedLocation === location.slug ? null : location.slug
        );
        if (selectedLocation !== location.slug) {
          setTimeout(() => {
            document.getElementById("map-container")?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 200);
        }
      }}
      style={{ "--marker-color": markerColor } as React.CSSProperties}
      tabIndex={0}
      transition={{
        layout: springTransition,
        scale: { type: "spring", stiffness: 300, damping: 25 },
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="flex flex-1 flex-col justify-between p-4 md:p-6"
        layout
        transition={{ layout: springTransition }}
      >
        <div>
          <motion.h2
            className={`mb-1 font-black text-xl md:mb-2 md:text-2xl lg:text-3xl ${selectedLocation === location.slug ? "text-stone-50" : "text-stone-900"}`}
            layout
            transition={{ layout: springTransition }}
          >
            {location.name}
          </motion.h2>

          <motion.div
            className="mb-2 flex justify-center"
            layout
            transition={{ layout: springTransition }}
          >
            <Link
              aria-label={`View ${location.name} on Google Maps`}
              className={`font-semibold text-base transition-all duration-300 md:text-lg ${
                selectedLocation === location.slug
                  ? "text-[color:var(--marker-color)] hover:brightness-75 md:text-stone-50 md:hover:text-[color:var(--marker-color)] md:hover:brightness-100"
                  : "text-stone-600 hover:text-[color:var(--marker-color)]"
              } focus:outline-none focus:ring-2 focus:ring-[color:var(--marker-color)] focus:ring-offset-2`}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `El Pueblito ${location.name} ${location.address}`
              )}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.click();
                }
              }}
              rel="noopener noreferrer"
              tabIndex={0}
              target="_blank"
            >
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                <div className="flex items-center gap-1 md:gap-2">
                  <MapPin className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
                  <span className="md:hidden">
                    {location.address.split(",")[0]}
                  </span>
                  <span className="hidden md:inline">{location.address}</span>
                </div>
                <span className="pl-4 md:hidden">
                  {location.address.split(",").slice(1).join(",").trim()}
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            className="mt-2 flex flex-col gap-0.5 text-left tablet:text-base text-[.79rem] md:text-lg"
            layout
            style={{
              color: selectedLocation === location.slug ? "#FFFFFF" : "#000000",
              transition: "color 0.3s ease",
              fontWeight: 600,
            }}
            transition={{ layout: springTransition }}
          >
            <div className="flex items-start gap-1 pt-2">
              <span>•</span>
              <span>{location.hours.weekdays}</span>
            </div>
            <div className="flex items-start gap-1 pt-1">
              <span>•</span>
              <span>{location.hours.weekend}</span>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="pt-2"
          layout
          transition={{ layout: springTransition }}
        >
          <Link
            aria-label={`Call ${location.name} at ${location.phone}`}
            className={`font-bold text-base decoration-[2px] transition-all duration-300 md:text-lg ${
              selectedLocation === location.slug
                ? "text-stone-50 underline"
                : "text-stone-900 no-underline hover:underline"
            } rounded-sm hover:text-[color:var(--marker-color)] focus:outline-none focus:ring-2 focus:ring-[color:var(--marker-color)] focus:ring-offset-2`}
            href={`tel:${location.phone}`}
            style={{ textDecorationColor: markerColor }}
          >
            {location.phone}
          </Link>
        </motion.div>
      </motion.div>
      <motion.div
        className="relative flex h-full w-[140px] flex-shrink-0 items-center justify-center p-4 md:w-[280px]"
        layout
        transition={{ layout: springTransition }}
      >
        <div className="relative h-[120px] w-full overflow-hidden rounded-xl md:h-[180px]">
          <Image
            alt={`${location.name} location`}
            className="h-full w-full object-cover object-center"
            height={900}
            src={`/images/locations/${location.slug}.jpg`}
            width={1600}
          />
        </div>
      </motion.div>
    </motion.button>
  </motion.div>
);
