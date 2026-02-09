type DiamondBorderProps = {
  className?: string;
};

const DiamondBorder = ({ className = "" }: DiamondBorderProps) => {
  return (
    <div className={className}>
      <svg
        aria-label="Geometric textile divider"
        height="40"
        role="img"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`
          :root {
            --bg: #E3D6C3;     /* page background */
            --primary: #0B8489;/* motif color */
            --accent: #02534E; /* secondary */
          }
        `}
        </style>
        <defs>
          {/* 64px-wide repeating tile */}
          <pattern
            height="40"
            id="mx-border"
            patternUnits="userSpaceOnUse"
            width="64"
            x="0"
            y="0"
          >
            <rect fill="var(--bg)" height="40" width="64" />
            {/* Top band */}
            <rect fill="var(--primary)" height="4" width="64" x="0" y="0" />
            <rect fill="var(--accent)" height="2" width="64" x="0" y="4" />
            {/* Bottom band */}
            <rect fill="var(--accent)" height="2" width="64" x="0" y="34" />
            <rect fill="var(--primary)" height="4" width="64" x="0" y="36" />

            {/* Center stepped-diamond motif */}
            <g transform="translate(32,20)">
              {/* outer step */}
              <path
                d="M0-14 L6-8 L14 0 L6 8 L0 14 L-6 8 L-14 0 L-6 -8 Z"
                fill="none"
                shapeRendering="crispEdges"
                stroke="var(--primary)"
                strokeWidth="3"
              />
              {/* inner step */}
              <path
                d="M0-9 L4-5 L9 0 L4 5 L0 9 L-4 5 L-9 0 L-4 -5 Z"
                fill="none"
                shapeRendering="crispEdges"
                stroke="var(--accent)"
                strokeWidth="3"
              />
            </g>

            {/* Tiny corner stitches to give 'woven' vibe */}
            <rect fill="var(--accent)" height="4" width="4" x="4" y="8" />
            <rect fill="var(--accent)" height="4" width="4" x="56" y="8" />
            <rect fill="var(--accent)" height="4" width="4" x="4" y="28" />
            <rect fill="var(--accent)" height="4" width="4" x="56" y="28" />
          </pattern>
        </defs>
        <rect fill="url(#mx-border)" height="40" width="100%" />
      </svg>
    </div>
  );
};

export default DiamondBorder;
