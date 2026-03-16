"use client";

import Image from "next/image";

interface PinataIconProps {
  className?: string;
}

export default function PinataIcon({
  className = "h-16 w-16",
}: PinataIconProps) {
  return (
    <Image
      alt="Colorful burro piñata in Mexican fiesta style"
      className={className}
      height={240}
      priority
      src="/pinata-new.png"
      width={300}
    />
  );
}
