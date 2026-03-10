import type { Metadata } from "next";
import MenuPageClient from "@/components/MenuPageClient";

export const metadata: Metadata = {
  title: "Menu | El Pueblito",
  description:
    "Browse food, lunch, and margarita menus for El Pueblito Mexican Restaurant.",
};

export default function MenuPage() {
  return <MenuPageClient />;
}
