'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRestaurantHours } from '@/lib/hooks/useRestaurantHours';
import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { Phone } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

const bouncySpring = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

const fadeInUp = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  transition: {
    type: 'spring',
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

export default function Header() {
  const [open, setOpen] = useState(false);
  const isLargeScreen = useScreenSize();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('');
  const { isOpen, hoursToday, closedMessage } = useRestaurantHours();

  useEffect(() => {
    const currentTab = tabs.find((tab) => tab.href === pathname);
    if (currentTab) {
      setActiveTab(currentTab.id);
    } else if (pathname === '/') {
      setActiveTab('home');
    } else {
      setActiveTab('');
    }
  }, [pathname]);

  const locations = useMemo(
    () => [
      { name: 'Bella Vista', phone: '+1-479-855-2324' },
      { name: 'Highfill', phone: '+1-479-525-6034' },
      { name: 'Prairie Creek', phone: '+1-479-372-6275' },
      { name: 'Centerton', phone: '+1-479-224-4820' },
    ],
    []
  );

  const tabs = [
    { id: 'menu', label: 'Menu', href: '/menu' },
    { id: 'locations', label: 'Locations', href: '/locations' },
    { id: 'contact', label: 'Contact Us', href: '/contact' },
    {
      id: 'pick-up',
      label: (
        <div className="flex items-center gap-1 font-black">
          <span className="md:hidden">Order</span>
          <span className="hidden whitespace-nowrap md:inline">
            Order Pick Up
          </span>
          <Phone className="h-4 w-4 fill-[#CE1226] stroke-0 group-hover:stroke-1 group-hover:stroke-[white]" />
        </div>
      ),
      href: '#',
    },
  ];

  return (
    <motion.header
      layout="preserve-aspect"
      transition={springTransition}
      className="top-0 z-50 mt-2 mb-4 flex w-full flex-col items-center pt-safe-top"
    >
      <AnimatePresence mode="wait" initial={false} key={pathname}>
        <motion.div
          key={isLargeScreen ? 'desktop' : 'mobile'}
          layout="position"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative flex w-full flex-col items-center md:flex-row md:items-center md:justify-between"
        >
          <motion.div
            layout="position"
            {...fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative shrink-0 md:ml-4 md:pr-4"
          >
            <Link
              href="/"
              onClick={() => setActiveTab('home')}
              className="relative block"
              aria-label="El Pueblito - Home"
              role="tab"
              aria-selected={activeTab === 'home'}
            >
              <Image
                src="/logo.png"
                alt="El Pueblito Logo"
                width="731"
                height="337"
                priority
                className="relative z-20 w-[14rem] max-w-[22rem]"
              />
              <AnimatePresence mode="wait" key={pathname}>
                {activeTab === 'home' && (
                  <motion.svg
                    layoutId="bubble"
                    className="absolute inset-[-1px] z-10 h-[calc(100%+2px)] w-[calc(100%+4px)]"
                    style={{ borderRadius: 9999 }}
                    viewBox="0 0 200 45"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    key={pathname}
                  >
                    <motion.path
                      d="M 200 22.5 C 200 34.93 155.228 45 100 45 C 44.772 45 0 34.93 0 22.5 C 0 10.07 44.772 0 100 0 C 155.228 0 200 10.07 200 22.5"
                      stroke="#FFD9A2"
                      strokeWidth="2"
                      initial={{ pathLength: 0, pathOffset: 0.5 }}
                      animate={{ pathLength: 1, pathOffset: 0 }}
                      transition={{
                        pathLength: { duration: 1, ease: 'easeInOut' },
                        pathOffset: { duration: 1, ease: 'easeInOut' },
                      }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>
          <motion.nav
            layout="position"
            transition={springTransition}
            className="w-full flex-1 md:flex md:min-w-[400px] md:justify-center"
          >
            <nav className="flex items-center justify-center space-x-1 text-base lg:text-lg">
              {tabs.map((tab, index) => (
                <motion.div
                  key={tab.id}
                  className="relative"
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    ...springTransition,
                    delay: index * 0.1 + 0.3,
                  }}
                >
                  {tab.id === 'pick-up' ? (
                    <DropdownMenu open={open} onOpenChange={setOpen}>
                      <DropdownMenuTrigger
                        className={`group relative line-clamp-1 rounded-full px-3 py-1.5 transition-colors duration-300 focus:outline-none ${
                          open
                            ? 'bg-[#03502D] text-stone-50'
                            : 'text-black hover:bg-[#03502D] hover:text-stone-50'
                        }`}
                      >
                        <motion.span layout className="relative z-20">
                          {tab.label}
                        </motion.span>
                      </DropdownMenuTrigger>
                      <AnimatePresence>
                        {open && (
                          <DropdownMenuContent
                            asChild
                            className="bg-[#03502D] font-semibold text-stone-50"
                            sideOffset={5}
                            align="end"
                            forceMount
                          >
                            <motion.div {...dropdownAnimation}>
                              {locations.map((location, idx) => (
                                <motion.div
                                  key={location.name}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    ...bouncySpring,
                                    delay: idx * 0.05,
                                  }}
                                >
                                  <DropdownMenuItem
                                    className="cursor-pointer data-[highlighted]:bg-[#03502D] data-[highlighted]:text-[#CF0822]"
                                    asChild
                                  >
                                    <motion.a
                                      href={`tel:${location.phone}`}
                                      className="flex w-full items-center"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      transition={springTransition}
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
                      href={tab.href}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative whitespace-nowrap rounded-full px-2 py-1.5 font-semibold transition-colors duration-300 sm:px-3 ${
                        activeTab === tab.id
                          ? 'text-stone-50'
                          : 'text-black hover:text-stone-50'
                      }`}
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {activeTab === tab.id && (
                        <motion.span
                          layoutId="bubble"
                          className="absolute inset-0 z-10 bg-[#CE1226]"
                          style={{ borderRadius: 9999 }}
                          transition={springTransition}
                        />
                      )}
                      <motion.span layout className="relative z-20">
                        {tab.label}
                      </motion.span>
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>
          </motion.nav>
          <motion.div
            layout="position"
            transition={springTransition}
            className="hidden md:mr-4 md:block md:w-[10rem] lg:hidden"
          >
            {/* Spacer div to balance the logo width */}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className="-translate-y-1/2 absolute top-1/2 right-4 hidden text-sm md:text-md lg:static lg:mr-16 lg:block lg:translate-y-0 lg:text-base"
          >
            {isOpen ? (
              <span className="font-semibold text-[#03502D]">
                Open Today {hoursToday}
              </span>
            ) : (
              <span className="font-semibold text-[#CE1226]">
                {closedMessage}
              </span>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        className="py-1 text-center text-sm md:text-md lg:hidden"
      >
        {isOpen ? (
          <span className="font-semibold text-[#03502D]">
            Open Today {hoursToday}
          </span>
        ) : (
          <span className="font-semibold text-[#CE1226]">{closedMessage}</span>
        )}
      </motion.div>
    </motion.header>
  );
}
