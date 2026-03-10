import type { Metadata } from "next";
import { Suspense } from "react";
import ContactPageClient from "@/components/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact | El Pueblito",
  description:
    "Contact El Pueblito for catering, event bookings, and general restaurant questions.",
};

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageClient />
    </Suspense>
  );
}
