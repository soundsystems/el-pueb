type ChevronBorderProps = {
  className?: string;
};

const ChevronBorder = ({ className = "" }: ChevronBorderProps) => {
  return (
    <div className={className}>
      <svg
        aria-label="Chevron textile divider"
        height="44"
        role="img"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`
          :root {
            --bg: #E3D6C3;
            --primary: #0B8489;
            --accent: #7AA5A6; /* lighter tint */
          }
        `}
        </style>
        <defs>
          <pattern
            height="44"
            id="chevron-blanket"
            patternUnits="userSpaceOnUse"
            width="48"
            x="0"
            y="0"
          >
            <rect fill="var(--bg)" height="44" width="48" />
            {/* top stitch lines */}
            <rect fill="var(--primary)" height="2" width="48" x="0" y="0" />
            <rect fill="var(--accent)" height="2" width="48" x="0" y="4" />

            {/* repeating chevron */}
            <path
              d="M0,28 L8,20 L16,28 L24,20 L32,28 L40,20 L48,28"
              fill="none"
              shapeRendering="crispEdges"
              stroke="var(--primary)"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth="4"
            />
            <path
              d="M0,34 L8,26 L16,34 L24,26 L32,34 L40,26 L48,34"
              fill="none"
              shapeRendering="crispEdges"
              stroke="var(--accent)"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth="2"
            />

            {/* bottom stitch lines */}
            <rect fill="var(--accent)" height="2" width="48" x="0" y="38" />
            <rect fill="var(--primary)" height="2" width="48" x="0" y="42" />
          </pattern>
        </defs>
        <rect fill="url(#chevron-blanket)" height="44" width="100%" />
      </svg>
    </div>
  );
};

export default ChevronBorder;
