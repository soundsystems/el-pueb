"use client";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Menus from "@/components/Menus";
import Loading from "../loading";

export default function HomePage() {
  const searchParams = useSearchParams();
  const [initialTab, setInitialTab] = useState<number | null>(null);
  const [targetPage, setTargetPage] = useState<number | undefined>(undefined);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const pageParam = searchParams.get("page");

    if (tabParam) {
      // Handle string tab names
      if (tabParam === "drinks") {
        // Check if we're on mobile or desktop - only after client hydration
        if (typeof window !== "undefined") {
          const isMobile = window.innerWidth < 1024;
          if (isMobile) {
            setInitialTab(7); // "Margaritas & More" is at index 7 on mobile after DOTM
          } else {
            // On desktop, pass the menuItems index. Margaritas is menuItems[7] after DOTM.
            setInitialTab(7);
          }
        } else {
          // Default to desktop on server - use menuItems index
          setInitialTab(7);
        }
      } else {
        // Handle numeric tab indices
        const tabIndex = Number.parseInt(tabParam, 10);
        if (!isNaN(tabIndex) && tabIndex >= 0) {
          setInitialTab(tabIndex);
        }
      }
    }

    // Handle target page parameter for highlighting
    if (pageParam) {
      const pageNumber = Number.parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber >= 0) {
        setTargetPage(pageNumber);
      }
    }
  }, [searchParams]);

  return (
    <AnimatePresence mode="wait">
      <motion.main
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none mb-2 select-none pt-4 text-center font-black text-3xl text-stone-900 md:mb-4 md:pt-6 md:text-5xl"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          Our Menu
        </motion.h1>
        <Suspense
          fallback={
            <div className="flex h-screen w-full items-center justify-center">
              <Loading />
            </div>
          }
        >
          <motion.section
            animate={{ y: 0 }}
            className="flex h-full flex-col items-center pb-2 lg:pb-6"
            id="menu"
            initial={{ y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Menus initialTab={initialTab} targetPage={targetPage} />
          </motion.section>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  );
}
