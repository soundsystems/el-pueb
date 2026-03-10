import { useId } from "react";

interface TextileBorderProps {
  accent: string;
  background?: string;
  className?: string;
  dark: string;
  height?: number;
  label: string;
  light: string;
}

const TILE_WIDTH = 24;

const TextileBorder = ({
  accent,
  background = "#E4D5C3",
  className = "",
  dark,
  height = 40,
  label,
  light,
}: TextileBorderProps) => {
  const patternId = useId();
  const middleY = Math.round(height / 2);

  return (
    <div className={className}>
      <svg
        aria-label={label}
        height={height}
        role="img"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            height={height}
            id={patternId}
            patternUnits="userSpaceOnUse"
            width={TILE_WIDTH}
            x="0"
            y="0"
          >
            <rect fill={background} height={height} width={TILE_WIDTH} />
            <rect fill={dark} height="3" width={TILE_WIDTH} x="0" y="0" />
            <rect fill={light} height="1.5" width={TILE_WIDTH} x="0" y="4.5" />
            <path
              d={`M2 ${middleY}L7 ${middleY - 5}L12 ${middleY - 10}L17 ${
                middleY - 5
              }L22 ${middleY}L17 ${middleY + 5}L12 ${middleY + 10}L7 ${
                middleY + 5
              }Z`}
              fill={dark}
            />
            <path
              d={`M5 ${middleY}L8 ${middleY - 3}L12 ${middleY - 7}L16 ${
                middleY - 3
              }L19 ${middleY}L16 ${middleY + 3}L12 ${middleY + 7}L8 ${
                middleY + 3
              }Z`}
              fill={accent}
            />
            <path
              d={`M9 ${middleY}L12 ${middleY - 3}L15 ${middleY}L12 ${
                middleY + 3
              }Z`}
              fill={light}
            />
            <path
              d={`M0 ${middleY}L3 ${middleY - 3}L6 ${middleY}L3 ${
                middleY + 3
              }Z`}
              fill={dark}
            />
            <path
              d={`M18 ${middleY}L21 ${middleY - 3}L24 ${middleY}L21 ${
                middleY + 3
              }Z`}
              fill={dark}
            />
            <path
              d={`M2 ${middleY - 9}L5 ${middleY - 12}L8 ${middleY - 9}L5 ${
                middleY - 6
              }Z`}
              fill={accent}
            />
            <path
              d={`M16 ${middleY - 9}L19 ${middleY - 12}L22 ${middleY - 9}L19 ${
                middleY - 6
              }Z`}
              fill={accent}
            />
            <path
              d={`M2 ${middleY + 9}L5 ${middleY + 6}L8 ${middleY + 9}L5 ${
                middleY + 12
              }Z`}
              fill={accent}
            />
            <path
              d={`M16 ${middleY + 9}L19 ${middleY + 6}L22 ${middleY + 9}L19 ${
                middleY + 12
              }Z`}
              fill={accent}
            />
            <rect
              fill={light}
              height="1.5"
              width={TILE_WIDTH}
              x="0"
              y={height - 6}
            />
            <rect
              fill={dark}
              height="3"
              width={TILE_WIDTH}
              x="0"
              y={height - 3}
            />
          </pattern>
        </defs>
        <rect
          fill={`url(#${patternId})`}
          height={height}
          shapeRendering="crispEdges"
          width="100%"
        />
      </svg>
    </div>
  );
};

export default TextileBorder;
