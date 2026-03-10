import type { Metadata } from "next";
import LocationsPageClient from "@/components/LocationsPageClient";

export const metadata: Metadata = {
  title: "Locations | El Pueblito",
  description:
    "Find El Pueblito locations across Northwest Arkansas with directions, hours, and contact details.",
};

export default function LocationsPage() {
  return <LocationsPageClient />;
}
