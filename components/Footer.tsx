"use client";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { Facebook, Instagram, Mail } from "lucide-react";
import Link from "next/link";
import { CONFETTI_COLORS } from "@/lib/constants/colors";
import PinataIcon from "./PinataIcon";
import Subscribe from "./Subscribe";

type ColorArray = [string, string, string];

function getSocialIconColors(): ColorArray {
  const filteredColors = CONFETTI_COLORS.filter(
    (color) =>
      ![
        "#202020",
        "#231F20",
        "#1F2121",
        "#FFFFFF",
        "#FDEAAF",
        "#FDF2D2",
        "#02534E",
        "#065955",
        "#006847",
        "#FF0000",
        "#AA8C30",
        "#DBAD6C",
      ].includes(color)
  );

  const colorCount = filteredColors.length;

  // Use stable positions so SSR and hydration produce identical CSS.
  return [
    filteredColors[3 % colorCount],
    filteredColors[8 % colorCount],
    filteredColors[13 % colorCount],
  ] as ColorArray;
}

const SOCIAL_ICON_COLORS = getSocialIconColors();

const Footer = () => {
  return (
    <LazyMotion features={domAnimation}>
      <footer className="relative mt-6 pb-6">
        <div className="mx-auto flex flex-col items-center">
          <div className="-mb-4 w-fit text-pretty rounded-xl bg-[#221E1B] p-2 text-center font-semibold text-sm text-stone-50 md:text-base">
            Subscribe below ⬇️ to stay in the loop 🌵
          </div>
          <Subscribe />
        </div>
        <div className="flex justify-center px-6 pb-safe-area-inset-bottom md:px-20">
          <m.div className="flex items-center gap-2">
            <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                    fill: ${SOCIAL_ICON_COLORS[0]} !important;
                    stroke: ${SOCIAL_ICON_COLORS[0]} !important;
                  }
                `}</style>
              </a>
            </m.div>
            <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                    stroke: ${SOCIAL_ICON_COLORS[1]} !important;
                  }
                `}</style>
              </a>
            </m.div>
            <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <a
                className="group flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-50/70 backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-stone-950/90"
                href="mailto:hola@elpueblitonwa.com"
              >
                <Mail className="h-6 w-6 stroke-stone-950 text-stone-950 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:stroke-mail" />
                <style>{`
                  .group:hover .group-hover\\:stroke-mail {
                    stroke: ${SOCIAL_ICON_COLORS[2]} !important;
                  }
                `}</style>
              </a>
            </m.div>
          </m.div>
        </div>

        <div className="mt-4 flex justify-center px-4 md:absolute md:bottom-6 md:left-4 md:mt-0 md:justify-start">
          <m.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-white/10"
              onClick={() => {
                window.location.href = "/contact?event=true";
              }}
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
          </m.div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} El Pueblito Mexican Restaurant
          </p>
          <div className="mt-2 flex items-center justify-center gap-3 text-stone-600 text-xs uppercase tracking-[0.18em]">
            <Link
              className="transition-colors hover:text-[#016945]"
              href="/privacy"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </LazyMotion>
  );
};

export default Footer;
