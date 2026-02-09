"use client";
import { Phone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRestaurantHours } from "@/lib/hooks/useRestaurantHours";
import { useScreenSize } from "@/lib/hooks/useScreenSize";

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

const bouncySpring = {
  type: "spring" as const,
  stiffness: 600,
  damping: 40,
  mass: 0.8,
};

const fadeInUp = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  transition: {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
    mass: 0.8,
  },
};

const dropdownAnimation = {
  initial: { opacity: 0, scale: 0.95, y: -10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -10 },
  transition: bouncySpring,
};

export function updateHoursText(text: string) {
  const headerElements = document.querySelectorAll(".header-hours");

  if (headerElements.length > 0) {
    headerElements.forEach((element) => {
      const span = element.querySelector("span");
      if (span) {
        span.textContent = text;
      }
    });
  }
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const isLargeScreen = useScreenSize();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("");
  const { isOpen, hoursToday, closedMessage } = useRestaurantHours();

  useEffect(() => {
    const currentTab = tabs.find((tab) => tab.href === pathname);
    if (currentTab) {
      setActiveTab(currentTab.id);
    } else if (pathname === "/") {
      setActiveTab("home");
    } else {
      setActiveTab("");
    }
  }, [pathname]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const newText = isOpen ? `Open Now ${hoursToday}` : closedMessage;
      updateHoursText(newText);
    }
  }, [isOpen, hoursToday, closedMessage]);

  const locations = useMemo(
    () => [
      { name: "Bella Vista", phone: "+1-479-855-2324" },
      { name: "Highfill", phone: "+1-479-525-6034" },
      { name: "Prairie Creek", phone: "+1-479-372-6275" },
      { name: "Centerton", phone: "+1-479-224-4820" },
    ],
    []
  );

  const tabs = [
    { id: "menu", label: "Menu", href: "/menu" },
    { id: "locations", label: "Locations", href: "/locations" },
    { id: "contact", label: "Contact Us", href: "/contact" },
    {
      id: "pick-up",
      label: (
        <div className="flex items-center gap-1 font-ultrablack">
          <span className="md:hidden">Order</span>
          <span className="hidden whitespace-nowrap md:inline">
            Order Pick Up
          </span>
          <Phone
            className={`pointer-events-auto h-4 w-4 stroke-0 ${open ? "fill-stone-50 transition-colors transition-duration-400" : "fill-[#CE1226]"} active:fill-stone-50`}
          />
        </div>
      ),
      href: "#",
    },
  ];

  return (
    <motion.header
      className="top-0 z-50 mt-[.75rem] mb-2 flex w-full flex-col items-center"
      layout="preserve-aspect"
      transition={springTransition}
    >
      <AnimatePresence initial={false}>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative flex w-full flex-col items-center md:flex-row md:items-center md:justify-between"
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
          key={isLargeScreen ? "desktop" : "mobile"}
          layout="position"
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            layout="position"
            {...fadeInUp}
            className="relative mt-2 shrink-0 md:mt-0 md:ml-8 md:pr-10 lg:mb-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              aria-label="El Pueblito - Home"
              aria-selected={activeTab === "home"}
              className="relative block"
              href="/"
              onClick={() => setActiveTab("home")}
              role="tab"
            >
              <Image
                alt="El Pueblito Logo"
                className="-inset-y-1 relative z-20 w-[14rem] max-w-[22rem]"
                height="337"
                priority
                src="/logo.png"
                width="731"
              />
              <AnimatePresence mode="wait">
                {activeTab === "home" && (
                  <motion.svg
                    aria-hidden="true"
                    className="absolute inset-[-1px] z-10 h-[calc(100%+2px)] w-[calc(100%+4px)]"
                    fill="none"
                    layoutId="bubble"
                    preserveAspectRatio="none"
                    style={{ borderRadius: 9999 }}
                    viewBox="0 0 200 45"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <motion.path
                      animate={{ pathLength: 1, pathOffset: 0 }}
                      d="M 200 22.5 C 200 34.93 155.228 45 100 45 C 44.772 45 0 34.93 0 22.5 C 0 10.07 44.772 0 100 0 C 155.228 0 200 10.07 200 22.5"
                      initial={{ pathLength: 0, pathOffset: 0.5 }}
                      stroke="#FFD9A2"
                      strokeWidth="2"
                      transition={{
                        pathLength: { duration: 1, ease: "easeInOut" },
                        pathOffset: { duration: 1, ease: "easeInOut" },
                      }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>
          <motion.nav
            className="mt-2 w-full flex-1 md:mt-0 md:flex md:min-w-[400px] md:justify-center"
            layout="position"
            transition={springTransition}
          >
            <nav className="flex items-center justify-center space-x-1 font-ultrablack text-lg lg:text-xl">
              {tabs.map((tab, index) => (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="relative"
                  initial={{ opacity: 0, x: -30 }}
                  key={tab.id}
                  layout
                  transition={{
                    opacity: {
                      duration: 0.3,
                      delay: index * 0.1 + 0.3,
                    },
                    x: {
                      duration: 0.4,
                      delay: index * 0.1 + 0.6,
                      ease: "easeOut",
                    },
                  }}
                >
                  {tab.id === "pick-up" ? (
                    <DropdownMenu onOpenChange={setOpen} open={open}>
                      <DropdownMenuTrigger
                        className={`group relative line-clamp-1 rounded-full px-3 py-1.5 duration-300 focus:outline-none ${
                          open
                            ? "border-none bg-[#03502D] text-stone-50"
                            : "text-stone-950 hover:text-stone-50"
                        }`}
                        suppressHydrationWarning
                      >
                        <motion.span className="relative z-20" layout>
                          {tab.label}
                        </motion.span>
                      </DropdownMenuTrigger>
                      <AnimatePresence>
                        {open && (
                          <DropdownMenuContent
                            align="end"
                            asChild
                            className="border-none bg-[#03502D] font-semibold text-stone-50"
                            forceMount
                            side="bottom"
                            sideOffset={5}
                          >
                            <motion.div {...dropdownAnimation}>
                              {locations.map((location, idx) => (
                                <motion.div
                                  animate={{ opacity: 1, x: 0 }}
                                  initial={{ opacity: 0, x: -10 }}
                                  key={location.name}
                                  transition={{
                                    ...bouncySpring,
                                    delay: idx * 0.05,
                                  }}
                                >
                                  <DropdownMenuItem
                                    asChild
                                    className="flex cursor-pointer justify-center text-center text-base shadow-lg data-[highlighted]:bg-[#03502D] data-[highlighted]:text-[#FFD9A2] data-[highlighted]:transition-colors md:text-lg lg:text-xl"
                                  >
                                    <motion.a
                                      className="flex w-full items-center"
                                      href={`tel:${location.phone}`}
                                      transition={springTransition}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      {location.name}
                                    </motion.a>
                                  </DropdownMenuItem>
                                </motion.div>
                              ))}
                            </motion.div>
                          </DropdownMenuContent>
                        )}
                      </AnimatePresence>
                    </DropdownMenu>
                  ) : (
                    <Link
                      className={`relative whitespace-nowrap rounded-full px-2 py-1.5 duration-300 sm:px-3 ${
                        activeTab === tab.id
                          ? "text-stone-50"
                          : "text-stone-950 hover:text-stone-50"
                      }`}
                      href={tab.href}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {activeTab === tab.id && (
                        <motion.span
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute inset-0 z-10 bg-stone-950/90"
                          initial={{ scale: 0.8, opacity: 0 }}
                          layoutId={activeTab !== "home" ? "bubble" : undefined}
                          style={{ borderRadius: 9999 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                            mass: 0.8,
                          }}
                        />
                      )}
                      <motion.span className="relative z-20" layout>
                        {tab.label}
                      </motion.span>
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>
          </motion.nav>
          <motion.div
            className="hidden md:mr-4 md:block md:w-[10rem] lg:hidden"
            layout="position"
            transition={springTransition}
          >
            {/* Spacer div to balance the logo width */}
          </motion.div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="-translate-y-1/2 header-hours absolute top-1/2 right-4 my-2 hidden lg:static lg:mr-16 lg:block lg:translate-y-0 lg:text-lg"
            initial={{ opacity: 0, y: -10 }}
            transition={springTransition}
          >
            {isOpen ? (
              <span className="font-bold text-[#006847]">
                Open Today {hoursToday}
              </span>
            ) : (
              <span className="font-bold text-[#CF0822]">{closedMessage}</span>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="md:-mt-6 header-hours py-2 text-center text-base md:text-lg lg:hidden"
        initial={{ opacity: 0, y: -10 }}
        transition={springTransition}
      >
        {isOpen ? (
          <span className="font-bold text-[#03502D]">
            Open Today {hoursToday}
          </span>
        ) : (
          <span className="font-bold text-[#CE1226]">{closedMessage}</span>
        )}
      </motion.div>
    </motion.header>
  );
}
