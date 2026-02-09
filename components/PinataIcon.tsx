"use client";

type PinataIconProps = {
  className?: string;
};

export default function PinataIcon({
  className = "h-16 w-16",
}: PinataIconProps) {
  return (
    <svg
      aria-label="Colorful burro piñata in Mexican fiesta style"
      className={className}
      role="img"
      viewBox="0 0 300 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>
          {`
            :root {
              --yellow: #F8C839;
              --gold: #FCCA3D;
              --gold-hl: #FDEAAF;
              --green: #006847;
              --patina: #5B9D88;
              --crimson: #CF0822;
              --orange: #EF6A4B;
              --gold-deep: #F1A720;
              --teal: #0B8489;
              --teal-dark: #02534E;
              --pink: #F690A1;
              --cyan: #30C2DC;
              --brown: #B07229;
              --black: #202020;
              --white: #FFFFFF;
            }
          `}
        </style>
        <path
          d="M80 40 l10 -20 10 20 16 10 18 20 36 0 16 -10 20 6 10 18 18 6 10 14 -8 16 -18 6 -2 34 -16 0 -4 -16 -26 0 -6 16 -16 0 0 -18 -50 0 0 18 -16 0 -4 -20 -20 -6 -10 -22 12 -14 8 -30 20 -8 16 -14 z"
          id="burro"
        />
        <clipPath id="clip-burro">
          <use href="#burro" />
        </clipPath>
      </defs>

      {/* stripes using your CONFETTI palette */}
      <g clipPath="url(#clip-burro)">
        <rect fill="var(--yellow)" height="14" width="320" x="0" y="20" />
        <rect fill="var(--gold)" height="14" width="320" x="0" y="34" />
        <rect fill="var(--teal)" height="14" width="320" x="0" y="48" />
        <rect fill="var(--patina)" height="14" width="320" x="0" y="62" />
        <rect fill="var(--orange)" height="14" width="320" x="0" y="76" />
        <rect fill="var(--gold-deep)" height="14" width="320" x="0" y="90" />
        <rect fill="var(--cyan)" height="14" width="320" x="0" y="104" />
        <rect fill="var(--pink)" height="14" width="320" x="0" y="118" />
        <rect fill="var(--teal-dark)" height="14" width="320" x="0" y="132" />
        <rect fill="var(--brown)" height="14" width="320" x="0" y="146" />
      </g>

      {/* outline */}
      <use
        fill="none"
        href="#burro"
        stroke="var(--black)"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      {/* eye */}
      <circle cx="112" cy="72" fill="var(--black)" r="3" />
    </svg>
  );
}
