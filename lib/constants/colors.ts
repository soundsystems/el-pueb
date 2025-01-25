export const CONFETTI_COLORS = [
  '#F8C839', // yellow
  '#FCCA3D', // eagle beak gold
  '#FDEAAF', // eagle beak gold hilight
  '#006847', // green
  '#5B9D88', // patina
  '#CF0822', // crimson
  '#FF0000', // red
  '#EF6A4B', // orange
  '#F9AA51', // gold
  '#F1A720', // snake tooth gold hilight
  '#AA8C30', // leaf gold accent
  '#F16E15', // orange
  '#065955', // deep sea green
  '#B07229', // eagle tail feather brown
  '#8F4620', // eagle feather brown
  '#953220', // dark brown
  '#DBAD6C', // eagle hilight tan
  '#717732', // leaf green
  '#9CA169', // leaf hilight
  '#F15670', // dark pink
  '#F690A1', // pink
  '#EDA8AF', // peach
  '#FBCAD3', // pale pink
  '#D42D40', // brick
  '#30C2DC', // cyan
  '#8BBEBF', // cacti teal hilight
  '#0B8489', // cacti teal
  '#02534E', // cacti teal dark
  '#0972A6', // navy
  '#202020', // eagle talon black
  '#231F20', // cacti black
  '#1F2121', // eagle feather black
  '#FFFFFF', // white
  '#FDF2D2', // pale yellow hilight
] as const;

// Helper function to get random marker colors
export const getRandomMarkerColors = (count = 4): string[] => {
  return [...CONFETTI_COLORS].sort(() => Math.random() - 0.5).slice(0, count);
};
