"use client";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import Loading from "@/app/loading";
import Menus from "@/components/Menus";

function resolveInitialTab(tabParam: string | null): number | null {
  if (!tabParam) {
    return null;
  }

  if (tabParam === "drinks") {
    return 7;
  }

  const tabIndex = Number.parseInt(tabParam, 10);
  return Number.isNaN(tabIndex) || tabIndex < 0 ? null : tabIndex;
}

function resolveTargetPage(pageParam: string | null): number | undefined {
  if (!pageParam) {
    return undefined;
  }

  const pageNumber = Number.parseInt(pageParam, 10);
  return Number.isNaN(pageNumber) || pageNumber < 0 ? undefined : pageNumber;
}

export default function MenuPageClient() {
  const searchParams = useSearchParams();
  const initialTab = useMemo(
    () => resolveInitialTab(searchParams.get("tab")),
    [searchParams]
  );
  const targetPage = useMemo(
    () => resolveTargetPage(searchParams.get("page")),
    [searchParams]
  );

  return (
    <LazyMotion features={domAnimation}>
      <m.main
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <m.h1
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none mb-2 select-none pt-4 text-center font-black text-3xl text-stone-900 md:mb-4 md:pt-6 md:text-5xl"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          Our Menu
        </m.h1>
        <Suspense
          fallback={
            <div className="flex h-screen w-full items-center justify-center">
              <Loading />
            </div>
          }
        >
          <m.section
            animate={{ y: 0 }}
            className="flex h-full flex-col items-center pb-2 lg:pb-6"
            id="menu"
            initial={{ y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Menus initialTab={initialTab} targetPage={targetPage} />
          </m.section>
        </Suspense>
      </m.main>
    </LazyMotion>
  );
}
