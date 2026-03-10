import TextileBorder from "@/components/TextileBorder";

interface ChevronBorderProps {
  className?: string;
}

const ChevronBorder = ({ className = "" }: ChevronBorderProps) => {
  return (
    <TextileBorder
      accent="#F15670"
      className={className}
      dark="#CF0822"
      height={44}
      label="Textile divider"
      light="#FBCAD3"
    />
  );
};

export default ChevronBorder;
