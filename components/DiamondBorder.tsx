import TextileBorder from "@/components/TextileBorder";

interface DiamondBorderProps {
  className?: string;
}

const DiamondBorder = ({ className = "" }: DiamondBorderProps) => {
  return (
    <TextileBorder
      accent="#FCCA3D"
      className={className}
      dark="#02534E"
      height={40}
      label="Textile divider"
      light="#FDEAAF"
    />
  );
};

export default DiamondBorder;
