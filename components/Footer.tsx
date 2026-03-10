"use client";

import { Facebook, Instagram, Mail } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CONFETTI_COLORS } from "@/lib/constants/colors";
import PinataIcon from "./PinataIcon";
import Subscribe from "./Subscribe";

type ColorArray = [string, string, string];

const Footer = () => {
  const [socialIconColors, setSocialIconColors] = useState<ColorArray>([
    CONFETTI_COLORS[0],
    CONFETTI_COLORS[1],
    CONFETTI_COLORS[2],
  ]);

  useEffect(() => {
    // Filter out black and white colors
    const filteredColors = CONFETTI_COLORS.filter(
      (color) =>
        ![
          "#202020",
          "#231F20",
          "#1F2121",
          "#FFFFFF", // black and white
          "#FDEAAF",
          "#FDF2D2", // cream colors
          "#02534E",
          "#065955", // dark teal
          "#006847", // dark green
          "#FF0000", // red
          "#AA8C30", // leaf gold accent
          "#DBAD6C", // eagle hilight tan
        ].includes(color)
    );

    // Randomly select colors after component mounts
    const randomSortOffset = 0.5;
    const colorCount = 3;
    const randomColors = [...filteredColors]
      .sort(() => Math.random() - randomSortOffset)
      .slice(0, colorCount) as ColorArray;
    setSocialIconColors(randomColors);
  }, []);

  return (
    <>
      <footer className="relative mt-6 pb-6">
        <div className="mx-auto flex flex-col items-center">
          <div className="-mb-4 w-fit text-pretty rounded-xl bg-[#221E1B] p-2 text-center font-semibold text-sm text-stone-50 md:text-base">
            Subscribe below ⬇️ to stay in the loop 🌵
          </div>
          <Subscribe />
        </div>
        <div className="flex justify-center px-6 pb-safe-area-inset-bottom md:px-20">
          <motion.div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <a
                className="group flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-50/70 backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-stone-950/90"
                href="https://www.facebook.com/profile.php?id=100063517664462"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Facebook
                  className="h-6 w-6 stroke-stone-950 text-stone-950 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:stroke-current"
                  fill="currentColor"
                  style={{ fill: "currentColor" }}
                />
                <style>{`
                  .group:hover .group-hover\\:stroke-current:first-child {
                    fill: ${socialIconColors[0]} !important;
                    stroke: ${socialIconColors[0]} !important;
                  }
                `}</style>
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <a
                className="group flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-50/70 backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-stone-950/90"
                href="https://www.instagram.com/elpueblitonwa"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Instagram className="h-6 w-6 stroke-stone-950 text-stone-950 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:fill-stone-950-ig" />
                <style>{`
                  .group:hover .group-hover\\:fill-stone-950-ig {
                    fill: #0c0a09 !important;
                    stroke: ${socialIconColors[1]} !important;
                  }
                `}</style>
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <a
                className="group flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-50/70 backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-stone-950/90"
                href="mailto:hola@elpueblitonwa.com"
              >
                <Mail className="h-6 w-6 stroke-stone-950 text-stone-950 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:stroke-mail" />
                <style>{`
                  .group:hover .group-hover\\:stroke-mail {
                    stroke: ${socialIconColors[2]} !important;
                  }
                `}</style>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Piñata Button - Centered on Mobile, Left on Desktop */}
        <div className="mt-4 flex justify-center px-4 md:absolute md:bottom-6 md:left-4 md:mt-0 md:justify-start">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-white/10"
              onClick={() => (window.location.href = "/contact?event=true")}
              type="button"
            >
              <PinataIcon className="h-8 w-8" />
              <span className="font-semibold text-sm text-stone-700">
                Having a fiesta? Book an{" "}
                <span className="underline decoration-2 underline-offset-2 hover:text-yellow-600">
                  event
                </span>{" "}
                today!
              </span>
            </button>
          </motion.div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} El Pueblito Mexican Restaurant
          </p>
          <div className="mt-2 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.18em] text-stone-600">
            <Link
              className="transition-colors hover:text-[#016945]"
              href="/privacy"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
