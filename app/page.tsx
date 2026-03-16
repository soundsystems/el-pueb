import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  description:
    "Authentic Mexican cuisine made fresh in the heart of Northwest Arkansas.",
};

export default function HomePage() {
  return <HomePageClient />;
}
