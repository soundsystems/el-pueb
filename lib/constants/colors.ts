export const CONFETTI_COLORS = [
  '#F8C839', // yellow
  '#006847', // green
  '#5B9D88', // patina
  '#CE1125', // crimson
  '#FF0000', // red
  '#EF6A4B', // orange
  '#F9AA51', // gold
  '#088589', // teal
  '#065955', // deep sea green
  '#8E4620', // chestnut
  '#D2A467', // tan
  '#78732D', // moss
  '#9CA169', // olive
  '#F15670', // dark pink
  '#F690A1', // pink
  '#EDA8AF', // peach
  '#FBCAD3', // pale pink
  '#D42D40', // brick
  '#30C2DC', // cyan
  '#8DBEC0', // pale blue
  '#0972A6', // navy
] as const;

// Helper function to get random marker colors
export const getRandomMarkerColors = (count = 4): string[] => {
  return [...CONFETTI_COLORS].sort(() => Math.random() - 0.5).slice(0, count);
};
