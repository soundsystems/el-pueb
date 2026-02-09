// Menu item type with page number and category
export type MenuItem = {
  name: string;
  pageNumber: number;
  category: string;
  variations?: string[]; // Alternative names for the same item
};

// Complete menu items mapping with page numbers and categories
export const MENU_ITEMS_MAPPING: MenuItem[] = [
  // PAGE 1: APPETIZERS & SIDES
  { name: "Bean Dip", pageNumber: 1, category: "Appetizers" },
  { name: "Guacamole", pageNumber: 1, category: "Appetizers" },
  { name: "Cheese Dip", pageNumber: 1, category: "Appetizers" },
  { name: "Choriqueso", pageNumber: 1, category: "Appetizers" },
  { name: "Mezcal Dip", pageNumber: 1, category: "Appetizers" },
  { name: "5 Layer Dip", pageNumber: 1, category: "Appetizers" },
  { name: "6 Layer Dip", pageNumber: 1, category: "Appetizers" },
  { name: "Pueblito Dip", pageNumber: 1, category: "Appetizers" },
  { name: "Camarones a la Plancha", pageNumber: 1, category: "Appetizers" },
  { name: "Razorback Nachos", pageNumber: 1, category: "Appetizers" },
  {
    name: "Nachos",
    pageNumber: 1,
    category: "Appetizers",
    variations: ["nachos", "NACHOS"],
  },
  { name: "Fajita Nachos", pageNumber: 1, category: "Appetizers" },
  { name: "Nachos Fajita Supreme", pageNumber: 1, category: "Appetizers" },
  { name: "Homemade Guacamole", pageNumber: 1, category: "Appetizers" },
  { name: "Chips", pageNumber: 1, category: "Sides" },
  { name: "Salsa", pageNumber: 1, category: "Sides" },
  { name: "Chips and Salsa", pageNumber: 1, category: "Sides" },
  { name: "Chicken Soup", pageNumber: 1, category: "Soups & Salads" },
  { name: "Shrimp Soup", pageNumber: 1, category: "Soups & Salads" },
  { name: "Fajita Taco Salad", pageNumber: 1, category: "Soups & Salads" },
  { name: "Taco Salad", pageNumber: 1, category: "Soups & Salads" },
  { name: "Cowboy Salad", pageNumber: 1, category: "Soups & Salads" },
  { name: "El Pueblito Bowl", pageNumber: 1, category: "Soups & Salads" },
  { name: "Guacamole Salad", pageNumber: 1, category: "Soups & Salads" },
  { name: "Mexican Rice", pageNumber: 1, category: "Sides" },
  { name: "Refried Beans", pageNumber: 1, category: "Sides" },
  { name: "Sour Cream", pageNumber: 1, category: "Sides" },
  { name: "Pico de Gallo", pageNumber: 1, category: "Sides" },
  { name: "Shredded Cheese", pageNumber: 1, category: "Sides" },
  { name: "French Fries", pageNumber: 1, category: "Sides" },
  { name: "Tortillas", pageNumber: 1, category: "Sides" },

  { name: "Jalapeños", pageNumber: 1, category: "Sides" },
  { name: "Avocado", pageNumber: 1, category: "Sides" },

  // PAGE 2: ESPECIALIDADES
  { name: "El Toro", pageNumber: 2, category: "Especialidades" },
  {
    name: "Mexican Pizza",
    pageNumber: 2,
    category: "Especialidades",
    variations: ["Pizza Mexican"],
  },
  { name: "Special Dinner", pageNumber: 2, category: "Especialidades" },
  { name: "Chimichanga", pageNumber: 2, category: "Especialidades" },
  {
    name: "Chimichanga Veracruzana",
    pageNumber: 2,
    category: "Especialidades",
  },
  { name: "Enchiladas Potosinas", pageNumber: 2, category: "Especialidades" },
  { name: "Enchiladas Mesquite", pageNumber: 2, category: "Especialidades" },
  { name: "Enchiladas Supremas", pageNumber: 2, category: "Especialidades" },
  { name: "Enchiladas Verdes", pageNumber: 2, category: "Especialidades" },
  { name: "Enchiladas Mexicanas", pageNumber: 2, category: "Especialidades" },
  { name: "Taquitos Mexicanos", pageNumber: 2, category: "Especialidades" },
  { name: "Flautas", pageNumber: 2, category: "Especialidades" },
  {
    name: "Jack Special",
    pageNumber: 2,
    category: "Especialidades",
    variations: [
      "the Jack Special",
      "The Jack Special",
      "the jack special",
      "jack special",
      "jacks special",
      "JACKS SPECIAL",
    ],
  },
  { name: "Chile Colorado", pageNumber: 2, category: "Especialidades" },
  { name: "Nachos El Pueblito", pageNumber: 2, category: "Especialidades" },
  { name: "Quesadilla Rellena", pageNumber: 2, category: "Especialidades" },
  {
    name: "Quesadilla Fajita",
    pageNumber: 2,
    category: "Especialidades",
    variations: ["Fajita Quesadilla"],
  },
  { name: "Wally Special", pageNumber: 2, category: "Especialidades" },
  {
    name: "Jaime Special",
    pageNumber: 2,
    category: "Especialidades",
    variations: [
      "Jamie Special",
      "the Jaime Special",
      "The Jaime Special",
      "the jaime special",
      "jaime special",
    ],
  },
  { name: "Fajita Tacos", pageNumber: 2, category: "Especialidades" },
  {
    name: "Jason Special",
    pageNumber: 2,
    category: "Especialidades",
    variations: [
      "the Jason Special",
      "The Jason Special",
      "the jason special",
      "jason special",
    ],
  },

  // PAGE 3: TACOS, BURRITOS & FAJITAS
  {
    name: "Taco Carne Asada",
    pageNumber: 3,
    category: "Street Tacos",
    variations: ["Carne Asada Taco"],
  },
  {
    name: "Taco Carnitas",
    pageNumber: 3,
    category: "Street Tacos",
    variations: ["Carnitas Taco"],
  },
  {
    name: "Taco Chorizo",
    pageNumber: 3,
    category: "Street Tacos",
    variations: ["Chorizo Taco"],
  },
  {
    name: "Taco Pollo Asado",
    pageNumber: 3,
    category: "Street Tacos",
    variations: ["Pollo Asado Taco"],
  },
  {
    name: "Taco Al Pastor",
    pageNumber: 3,
    category: "Street Tacos",
    variations: ["Al Pastor Taco"],
  },
  {
    name: "Street Tacos",
    pageNumber: 3,
    category: "Street Tacos",
    variations: ["Al Pastor Street Tacos", "AL PASTOR STREET TACOS"],
  },
  { name: "Burrito El Pueblito", pageNumber: 3, category: "Burritos" },
  { name: "La Frontera Burrito", pageNumber: 3, category: "Burritos" },
  {
    name: "Burrito California",
    pageNumber: 3,
    category: "Burritos",
    variations: ["California Burrito"],
  },
  { name: "Burrito Ranchero", pageNumber: 3, category: "Burritos" },
  {
    name: "Burrito Fajita",
    pageNumber: 3,
    category: "Burritos",
    variations: ["Fajita Burrito"],
  },
  { name: "Burrito Camaron", pageNumber: 3, category: "Burritos" },
  {
    name: "Burrito Santa Fe",
    pageNumber: 3,
    category: "Burritos",
    variations: ["Santa Fe Burrito"],
  },
  {
    name: "Burrito Mexicano",
    pageNumber: 3,
    category: "Burritos",
    variations: ["Mexicano Burrito"],
  },
  { name: "Burrito con Chile Verde", pageNumber: 3, category: "Burritos" },
  { name: "Carne Asada Burrito", pageNumber: 3, category: "Burritos" },
  { name: "Al Pastor Burrito", pageNumber: 3, category: "Burritos" },
  { name: "Fajitas", pageNumber: 3, category: "Fajitas" },
  { name: "Fajitas Jalisco", pageNumber: 3, category: "Fajitas" },
  {
    name: "Fajitas Hawaiian",
    pageNumber: 3,
    category: "Fajitas",
    variations: ["Hawaiian Fajitas"],
  },
  {
    name: "Vegetarian Fajitas",
    pageNumber: 3,
    category: "Fajitas",
    variations: ["Veggie Fajitas"],
  },
  { name: "Seafood Fajitas", pageNumber: 3, category: "Fajitas" },
  { name: "Shrimp Fajitas", pageNumber: 3, category: "Fajitas" },
  {
    name: "Fajitas Carnitas",
    pageNumber: 3,
    category: "Fajitas",
    variations: ["Carnitas Fajitas"],
  },
  { name: "Especial El Pueblito", pageNumber: 3, category: "Fajitas" },
  { name: "Molcajete", pageNumber: 3, category: "Fajitas" },
  { name: "Parrillada", pageNumber: 3, category: "Fajitas" },
  { name: "Alambres", pageNumber: 3, category: "Fajitas" },
  { name: "Seth Special", pageNumber: 3, category: "Fajitas" },
  { name: "Chalupa", pageNumber: 3, category: "Vegetarian Combinations" },
  { name: "Bean Burrito", pageNumber: 3, category: "Vegetarian Combinations" },
  { name: "Bean Tostada", pageNumber: 3, category: "Vegetarian Combinations" },
  {
    name: "Cheese Enchilada",
    pageNumber: 3,
    category: "Vegetarian Combinations",
  },
  {
    name: "Cheese Quesadilla",
    pageNumber: 3,
    category: "Vegetarian Combinations",
  },
  {
    name: "Spinach Enchilada",
    pageNumber: 3,
    category: "Vegetarian Combinations",
  },

  // PAGE 4: A LA PARILLA (GRILLED ITEMS)
  { name: "Camarones a la Mexicana", pageNumber: 4, category: "Seafood" },
  { name: "Camarones a la Diabla", pageNumber: 4, category: "Seafood" },
  { name: "Shrimp Chimichanga", pageNumber: 4, category: "Seafood" },
  { name: "Chicken Chimichanga", pageNumber: 4, category: "Seafood" },
  { name: "Camarones al Mojo de Ajo", pageNumber: 4, category: "Seafood" },
  { name: "Quesadilla Camarones", pageNumber: 4, category: "Seafood" },
  { name: "Grilled Shrimp", pageNumber: 4, category: "Seafood" },
  { name: "Shrimp Cocktail", pageNumber: 4, category: "Seafood" },
  { name: "Tilapia El Pueblito", pageNumber: 4, category: "Seafood" },
  { name: "Tilapia San Jose", pageNumber: 4, category: "Seafood" },
  { name: "Tilapia a la Diabla", pageNumber: 4, category: "Seafood" },
  { name: "Tilapia Mario", pageNumber: 4, category: "Seafood" },
  { name: "Baja Tacos", pageNumber: 4, category: "Seafood" },
  { name: "Shrimp Ceviche", pageNumber: 4, category: "Seafood" },
  { name: "Quesabirrias", pageNumber: 4, category: "Steaks" },
  { name: "Pancho Villa", pageNumber: 4, category: "Steaks" },
  { name: "Steak Tampiqueno", pageNumber: 4, category: "Steaks" },
  { name: "Carne Asada", pageNumber: 4, category: "Steaks" },
  { name: "Tacos Carne Asada", pageNumber: 4, category: "Steaks" },
  { name: "Roadside Tacos", pageNumber: 4, category: "Steaks" },
  { name: "Pollo Loco", pageNumber: 4, category: "Chicken" },
  { name: "Chori-Pollo", pageNumber: 4, category: "Chicken" },
  { name: "Pollo a la Crema", pageNumber: 4, category: "Chicken" },
  { name: "Pollo Fundido", pageNumber: 4, category: "Chicken" },
  {
    name: "Pollo Tapatio",
    pageNumber: 4,
    category: "Chicken",
    variations: ["Chicken Tapatio", "CHICKEN TAPATIO"],
  },
  { 
    name: "Pollo El Pueblito", 
    pageNumber: 4, 
    category: "Chicken",
    variations: ["Pollo Pueblito", "Pueblito Chicken, El Pueblito Chicken"]
  },
  {
    name: "Steven Special",
    pageNumber: 4,
    category: "Chicken",
    variations: [
      "Steven's Special",
      "steven special",
      "the Steven Special",
      "The Steven Special",
      "the steven special",
    ],
  },
  {
    name: "Emily Special",
    pageNumber: 4,
    category: "Chicken",
    variations: [
      "Emily's Special",
      "emily special",
      "the Emily Special",
      "The Emily Special",
      "the emily special",
      "Emily Chicken",
    ],
  },
  {
    name: "Wally's Special",
    pageNumber: 4,
    category: "Chicken",
    variations: [
      "wally special",
      "the Wally Special",
      "The Wally Special",
      "the wally special",
    ],
  },
  { name: "Enchiladas Razorback", pageNumber: 4, category: "Pork" },
  { name: "Carnitas", pageNumber: 4, category: "Pork" },
  {
    name: "Chile Verde",
    pageNumber: 4,
    category: "Pork",
    variations: [
      "Pork Chile Verde",
      "chile verde",
      "CHILE VERDE",
      "Chile verde",
    ],
  },

  // PAGE 5: LUNCH SPECIALS
  {
    name: "Quesadilla with Spinach & Cheese",
    pageNumber: 5,
    category: "Lunch Specials",
  },
  { name: "Speedy Gonzalez", pageNumber: 5, category: "Lunch Specials" },
  { name: "Huevos Rancheros", pageNumber: 5, category: "Lunch Specials" },
  {
    name: "Special Lunch #1",
    pageNumber: 5,
    category: "Lunch Specials",
    variations: ["Lunch Special Number One"],
  },
  { name: "Huevos con Chorizo", pageNumber: 5, category: "Lunch Specials" },
  { name: "Sophia Special", pageNumber: 5, category: "Lunch Specials" },

  // PAGE 6: KIDS MENU
  { name: "Hamburger", pageNumber: 6, category: "Kids Menu" },
  { name: "Cheeseburger", pageNumber: 6, category: "Kids Menu" },
  { name: "Pizza", pageNumber: 6, category: "Kids Menu" },
  { name: "Chicken Nuggets", pageNumber: 6, category: "Kids Menu" },

  // PAGE 7: DESSERTS & DRINKS
  { name: "Flan", pageNumber: 7, category: "Desserts" },
  { name: "Sopapilla", pageNumber: 7, category: "Desserts" },
  { name: "Chocolate Strawberry Nachos", pageNumber: 7, category: "Desserts" },
  { name: "Fried Ice Cream", pageNumber: 7, category: "Desserts" },
  { name: "Churros", pageNumber: 7, category: "Desserts" },

  // COMBINATION PLATES (can appear on multiple pages)
  { name: "Taco", pageNumber: 3, category: "Combination Plates" },
  { name: "Burrito", pageNumber: 3, category: "Combination Plates" },
  { name: "Tostada", pageNumber: 3, category: "Combination Plates" },
  { name: "Enchilada", pageNumber: 3, category: "Combination Plates" },
  { name: "Chile Relleno", pageNumber: 3, category: "Combination Plates" },
  { name: "Tamale", pageNumber: 3, category: "Combination Plates" },

  // ADDITIONAL MENU ITEMS FOR TESTIMONIAL HIGHLIGHTING
  { name: "Quesadillas", pageNumber: 2, category: "Especialidades" },
  { name: "Rice and Beans", pageNumber: 1, category: "Sides" },
  { name: "Beans and Rice", pageNumber: 1, category: "Sides" },
  { name: "Chorizo Queso", pageNumber: 1, category: "Appetizers" },
  { name: "Choriqueso", pageNumber: 1, category: "Appetizers" },
  { name: "Chori Pollo", pageNumber: 4, category: "Chicken" },
  { name: "Chile Rellenos", pageNumber: 3, category: "Combination Plates" },
  { name: "Beef Chimichangas", pageNumber: 2, category: "Especialidades" },
  {
    name: "Beef and Cheese Enchilada",
    pageNumber: 3,
    category: "Combination Plates",
  },
  { name: "Dips", pageNumber: 1, category: "Appetizers" },
  { name: "Tostadas", pageNumber: 3, category: "Combination Plates" },
  { name: "Tacos", pageNumber: 3, category: "Street Tacos" },
  { name: "Street Tacos", pageNumber: 3, category: "Street Tacos" },
  { name: "Razorback Enchiladas", pageNumber: 4, category: "Pork" },
  { name: "Appetizers", pageNumber: 1, category: "Appetizers" },
  { name: "Drinks", pageNumber: 7, category: "Drinks" },
  { name: "Scorpion Salsa", pageNumber: 1, category: "Sides" },
  { name: "Tomatillo Salsa", pageNumber: 1, category: "Sides" },
  { name: "The Emily", pageNumber: 4, category: "Chicken" },
  { name: "The Wally", pageNumber: 4, category: "Chicken" },
  { name: "The Mario", pageNumber: 4, category: "Seafood" },
  { name: "Salad", pageNumber: 1, category: "Soups & Salads" },
  { name: "Burritos", pageNumber: 3, category: "Burritos" },
  { name: "Queso", pageNumber: 1, category: "Appetizers" },
  { name: "Fajita", pageNumber: 3, category: "Fajitas" },
  { name: "Quesadilla", pageNumber: 2, category: "Especialidades" },
  { name: "Shrimp Tacos", pageNumber: 4, category: "Seafood" },
  { name: "The Poncho Villa", pageNumber: 4, category: "Steaks" },
  { name: "Steak Fajitas", pageNumber: 3, category: "Fajitas" },
  { name: "Shrimp Fajitas", pageNumber: 3, category: "Fajitas" },
  { name: "Chicken Fajitas", pageNumber: 3, category: "Fajitas" },
  { name: "Rice", pageNumber: 1, category: "Sides" },
  { name: "Beans", pageNumber: 1, category: "Sides" },
  { name: "Chimichanga", pageNumber: 2, category: "Especialidades" },
  { name: "Flautas", pageNumber: 2, category: "Especialidades" },
  { name: "Enchiladas", pageNumber: 3, category: "Combination Plates" },
  { name: "Tamales", pageNumber: 3, category: "Combination Plates" },
  { name: "Nachos", pageNumber: 1, category: "Appetizers" },
  { name: "Guacamole", pageNumber: 1, category: "Appetizers" },
  { name: "Salsa", pageNumber: 1, category: "Sides" },
  { name: "Chips", pageNumber: 1, category: "Sides" },
  { name: "Carnitas", pageNumber: 4, category: "Pork" },
  { name: "Carne Asada", pageNumber: 4, category: "Steaks" },
  { name: "Pollo", pageNumber: 4, category: "Chicken" },
  { name: "Chicken", pageNumber: 4, category: "Chicken" },
  { name: "Steak", pageNumber: 4, category: "Steaks" },
  { name: "Shrimp", pageNumber: 4, category: "Seafood" },
  { name: "Tilapia", pageNumber: 4, category: "Seafood" },
  { name: "Camarones", pageNumber: 4, category: "Seafood" },
  { name: "Burrito", pageNumber: 3, category: "Combination Plates" },
  { name: "Fajitas", pageNumber: 3, category: "Fajitas" },
  { name: "Molcajete", pageNumber: 3, category: "Fajitas" },
  { name: "Alambres", pageNumber: 3, category: "Fajitas" },
  { name: "Parrillada", pageNumber: 3, category: "Fajitas" },
  { name: "Chalupa", pageNumber: 3, category: "Vegetarian Combinations" },
  { name: "Tostada", pageNumber: 3, category: "Combination Plates" },
  { name: "Taco", pageNumber: 3, category: "Combination Plates" },
  { name: "Soup", pageNumber: 1, category: "Soups & Salads" },
  { name: "Desserts", pageNumber: 7, category: "Desserts" },
  { name: "Flan", pageNumber: 7, category: "Desserts" },
  { name: "Sopapilla", pageNumber: 7, category: "Desserts" },
  { name: "Churros", pageNumber: 7, category: "Desserts" },
  { name: "Fried Ice Cream", pageNumber: 7, category: "Desserts" },
];

// Helper function to get menu item by name (case-insensitive)
export function getMenuItemByName(name: string): MenuItem | undefined {
  const normalizedName = name.toLowerCase().trim();

  return MENU_ITEMS_MAPPING.find(
    (item) =>
      item.name.toLowerCase() === normalizedName ||
      item.variations?.some(
        (variation) => variation.toLowerCase() === normalizedName
      )
  );
}

// Helper function to get page number for a menu item
export function getPageNumberForMenuItem(name: string): number {
  const menuItem = getMenuItemByName(name);
  return menuItem?.pageNumber || 1; // Default to page 1 if not found
}

// Helper function to get category for a menu item
export function getCategoryForMenuItem(name: string): string {
  const menuItem = getMenuItemByName(name);
  return menuItem?.category || "Unknown";
}

// Legacy flat array for backward compatibility
export const MENU_ITEMS = MENU_ITEMS_MAPPING.flatMap((item) => [
  item.name,
  ...(item.variations || []),
]);
