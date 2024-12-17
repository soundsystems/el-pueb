'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const currentTab = tabs.find((tab) => tab.href === pathname);
    if (currentTab) {
      setActiveTab(currentTab.id);
    } else {
      setActiveTab('');
    }
  }, [pathname]);

  const locations = [
    { name: 'Bella Vista', phone: '+1-479-855-2324' },
    { name: 'Highfill', phone: '+1-479-525-6034.' },
    { name: 'Prairie Creek', phone: '+1-479-372-6275' },
    { name: 'Centerton', phone: '+1-479-224-4820' },
  ];

  const tabs = [
    { id: 'menu', label: 'Menu', href: '/menu' },
    { id: 'locations', label: 'Locations', href: '/locations' },
    { id: 'contact', label: 'Contact Us', href: '/contact' },
    {
      id: 'pick-up',
      label: (
        <div className="flex items-center gap-1 font-black">
          <span className="md:hidden">Order</span>
          <span className="hidden md:inline">Order Pick Up</span>
          <Phone className="h-4 w-4 fill-[#CE1226] stroke-0 group-hover:stroke-1 group-hover:stroke-[white]" />
        </div>
      ),
      href: '#',
    },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.header
        layout
        key={isLargeScreen ? 'desktop-header' : 'mobile-header'}
        transition={springTransition}
        className="top-0 z-50 mt-2 mb-3 flex w-full flex-col items-center gap-y-1 pt-safe-top md:flex-row md:items-center md:justify-between"
      >
        <motion.div
          layout
          {...fadeInUp}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="shrink-0 md:ml-4"
        >
          <Link href="/">
            <Image
              src="/logo.png"
              alt="El Pueblito Logo"
              width="731"
              height="337"
              priority
              className="w-[13rem] max-w-[16rem] md:w-[16rem]"
            />
          </Link>
        </motion.div>
        <motion.nav
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...springTransition,
            delay: 0.2,
          }}
          className="w-full flex-1 md:flex md:min-w-[400px] md:justify-center"
        >
          <nav className="flex items-center justify-center space-x-1 text-xs sm:text-sm lg:text-base">
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
                      className={`group relative line-clamp-1 rounded-full px-3 py-1.5 font-medium text-black transition-colors hover:bg-[#03502D] hover:text-white focus:outline-none ${
                        open ? 'bg-[#03502D] text-white' : ''
                      }`}
                    >
                      {open && (
                        <motion.span
                          layoutId="dropdown-background"
                          className="absolute inset-0 z-0 rounded-full bg-[#03502D]"
                          initial={false}
                          transition={springTransition}
                        />
                      )}
                      <motion.span layout className="relative z-20">
                        {tab.label}
                      </motion.span>
                    </DropdownMenuTrigger>
                    <AnimatePresence>
                      {open && (
                        <DropdownMenuContent
                          asChild
                          className="bg-[#03502D] text-white"
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
                                  className="cursor-pointer data-[highlighted]:bg-[#193618] data-[highlighted]:text-white"
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
                        ? 'text-white'
                        : 'text-black hover:text-white'
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
          layout
          transition={springTransition}
          className="hidden md:mr-4 md:block md:w-[13rem]"
        >
          {/* Spacer div to balance the logo width */}
        </motion.div>
      </motion.header>
    </AnimatePresence>
  );
}
