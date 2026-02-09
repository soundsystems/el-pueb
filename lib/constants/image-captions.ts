// Image Captions - Simple structure for easy editing
// Each image object contains filename, mobile menu page number (1-7), and dish name

// MOBILE STRUCTURE:
// 8 tabs total after adding DOTM at tab 0.
// Menu pages map to tabs 1-6:
// Tab 1: Starters & Sides (Page 1)
// Tab 2: Especialdades (Page 2)
// Tab 3: Tacos, Burritos & Fajitas (Page 3)
// Tab 4: A La Parilla (Page 4)
// Tab 5: Lunch, Combos & Kids (Pages 5 & 6 - shows 2 pages)
// Tab 6: Deserts & Drinks (Page 7)

// DESKTOP TAB STRUCTURE (what you see on desktop):
// Tab 0: DOTM
// Tab 1: Starters, Sides & Especialdades (combines pages 1 & 2)
// Tab 2: Platos (combines pages 3 & 4)
// Tab 3: Lunch, Combos & Kids (pages 5 & 6 shown together)
// Tab 4: Deserts & Drinks (page 7)

// Helper: converts page number to mobile tab index
export function pageToMobileTab(pageNumber: number): number {
  if (pageNumber === 1) return 1; // Starters & Sides -> Tab 1
  if (pageNumber === 2) return 2; // Especialdades -> Tab 2
  if (pageNumber === 3) return 3; // Tacos/Fajitas -> Tab 3
  if (pageNumber === 4) return 4; // A La Parilla -> Tab 4
  if (pageNumber === 5 || pageNumber === 6) return 5; // Lunch (both pages) -> Tab 5
  if (pageNumber === 7) return 6; // Deserts & Drinks -> Tab 6
  return 1; // Default to starters
}

// Helper: converts page number to desktop tab index
export function pageToDesktopTab(pageNumber: number): number {
  if (pageNumber === 1 || pageNumber === 2) return 1; // Starters & Especialdades -> Tab 1
  if (pageNumber === 3 || pageNumber === 4) return 2; // Tacos/Fajitas & A La Parilla -> Tab 2
  if (pageNumber === 5 || pageNumber === 6) return 3; // Lunch (both pages) -> Tab 3
  if (pageNumber === 7) return 4; // Deserts & Drinks -> Tab 4
  return 1; // Default to starters
}

// Simple structure: filename, menu page number (1-7), and dish or drink name all in one object
export const DISH_CAPTIONS = {
  // Featured Food Images - just add filename, page number, and dish name
  featuredFood: [
    { filename: "DSC05867.jpg", pageNumber: 4, name: "Taquitos Mexicanos" },
    { filename: "DSC05980.jpg", pageNumber: 3, name: "Burritos Mexicanos" },
    { filename: "DSC06133.jpg", pageNumber: 1, name: "Choriqueso" },
    { filename: "DSC06141.jpg", pageNumber: 1, name: "Razorback Nachos" },
    { filename: "DSC06149.jpg", pageNumber: 1, name: "Chicken Soup" },
    { filename: "DSC06155.jpg", pageNumber: 1, name: "El Pueblito Bowl" },
    { filename: "DSC06163.jpg", pageNumber: 2, name: "El Toro" },
    { filename: "DSC06175.jpg", pageNumber: 3, name: "Molcajete" },
    { filename: "DSC06190.jpg", pageNumber: 3, name: "Parillada" },
    { filename: "DSC06195.jpg", pageNumber: 4, name: "Tilapia Mario" },
    { filename: "DSC06200.jpg", pageNumber: 3, name: "T-Bone Pancho Villa" },
    { filename: "DSC06206.jpg", pageNumber: 4, name: "Roadside Tacos" },
    { filename: "DSC06216.jpg", pageNumber: 4, name: "Enchiladas Mesquite" },
    {
      filename: "DSC06225.jpg",
      pageNumber: 7,
      name: "Chocolate Strawberry Nachos",
    },
    { filename: "DSC06231.jpg", pageNumber: 4, name: "Wally Special" },
    { filename: "DSC06245.jpg", pageNumber: 5, name: "Jason Special" },
    { filename: "DSC06261.jpg", pageNumber: 4, name: "Pollo El Pueblito" },
  ],

  // Daily Specials - just add filename, page number, and dish name
  dailySpecials: [
    { filename: "Mixed_Fajita.jpg", pageNumber: 2, name: "MON: Fajitas" },
    {
      filename: "Two_Taco_RB.jpg",
      pageNumber: 2,
      name: "TUE: 2 Tacos + Rice + Beans",
    },
    {
      filename: "Enchilada_Supremas.jpg",
      pageNumber: 3,
      name: "WED: Enchiladas Supremas",
    },
    {
      filename: "Emily_Special.jpg",
      pageNumber: 5,
      name: "THU: Emily Special",
    }, // Lunch page 1
    {
      filename: "Steven_Special.jpg",
      pageNumber: 6,
      name: "FRI: Steven Special",
    }, // Lunch page 1
    {
      filename: "Burrito_Pueblito_1.jpg",
      pageNumber: 6,
      name: "SAT: Burrito El Pueblito",
    }, // Lunch page 2 (kids)
    {
      filename: "Taco_Salad_Pueblito.jpg",
      pageNumber: 5,
      name: "SUN: Taco Salad",
    }, // Lunch page 1
  ],

  // Featured Drinks - just add filename, page number, and drink name
  featuredDrinks: [
    {
      filename: "Margarita.jpg",
      pageNumber: 7,
      name: "MON: 12oz Margaritas - $2.99",
    },
    {
      filename: "Blue_Marg_Jaz.jpg",
      pageNumber: 7,
      name: "TUE: 16oz Blue Margaritas - $5.99",
    },
    {
      filename: "DSC03251.jpg",
      pageNumber: 7,
      name: "WED: 32oz Draft Beer - Domestic $5.99, Import $6.25",
    },
    {
      filename: "20oz_Beer.jpg",
      pageNumber: 7,
      name: "THU: 20oz Draft Beer - Domestic $4.75, Import $5.25",
    },
    {
      filename: "DSC01270.jpg",
      pageNumber: 7,
      name: "FRI: 12oz Draft Beer - Domestic $2.25, Import $2.99",
    },
    {
      filename: "DSC01260.jpg",
      pageNumber: 7,
      name: "SAT: 20oz Draft Beer - $4.75 + 16oz Margaritas - $5.99",
    },
    {
      filename: "Wine.jpg",
      pageNumber: 7,
      name: "SUN: Wine by the Glass - $4.99",
    },
    { filename: "Mexican_Mule.jpg", pageNumber: 7, name: "Mexican Mule" },
    { filename: "Cantarito.jpg", pageNumber: 7, name: "Cantarito" },
    { filename: "Spicy_Margarita.jpg", pageNumber: 7, name: "Spicy Margarita" },
    { filename: "Beer-ita.jpg", pageNumber: 7, name: "Beerita" },
  ],
};

// Helper function to get caption by filename
export function getCaptionByFilename(
  filename: string,
  category: keyof typeof DISH_CAPTIONS
): string {
  const captions = DISH_CAPTIONS[category];
  const image = captions.find((item) => item.filename === filename);
  return image?.name || "Delicious Mexican Cuisine";
}

// Helper function to get page number by filename
export function getPageNumberByFilename(
  filename: string,
  category: keyof typeof DISH_CAPTIONS
): number {
  const captions = DISH_CAPTIONS[category];
  const image = captions.find((item) => item.filename === filename);
  return image?.pageNumber ?? 1;
}

// Helper function to get mobile tab index by filename (0-5)
export function getMobileTabIndexByFilename(
  filename: string,
  category: keyof typeof DISH_CAPTIONS
): number {
  const pageNumber = getPageNumberByFilename(filename, category);
  return pageToMobileTab(pageNumber);
}

// Helper function to get desktop tab index by filename (0-3)
export function getDesktopTabIndexByFilename(
  filename: string,
  category: keyof typeof DISH_CAPTIONS
): number {
  const pageNumber = getPageNumberByFilename(filename, category);
  return pageToDesktopTab(pageNumber);
}

// Helper function to get menu link by filename - now generates correct tab-based URLs
export function getMenuLinkByFilename(
  filename: string,
  category: keyof typeof DISH_CAPTIONS
): string {
  const mobileTabIndex = getMobileTabIndexByFilename(filename, category);
  return `/menu?tab=${mobileTabIndex}`;
}

// Helper function to get dynamic caption based on current day
export function getDynamicCaption(
  caption: string,
  category: "dailySpecials" | "featuredDrinks" | "featuredFood",
  index: number,
  isMobile = false
): string {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentIndex = today === 0 ? 6 : today - 1; // Map to our array index

  // If this is today's special, show "Today:" instead of the day name
  if (index === currentIndex) {
    if (category === "dailySpecials") {
      return caption.replace(/^[A-Z]+: /, "TODAY: ");
    }
    if (category === "featuredDrinks") {
      return caption.replace(/^[A-Z]+: /, "TODAY: ");
    }
  }

  return caption;
}

// Legacy support - keeping these for backward compatibility
export const IMAGE_CAPTIONS = {
  featuredFood: DISH_CAPTIONS.featuredFood.map((item) => item.name),
  dailySpecials: DISH_CAPTIONS.dailySpecials.map((item) => item.name),
  featuredDrinks: DISH_CAPTIONS.featuredDrinks.map((item) => item.name),
};

export const MENU_LINKS = {
  featuredFood: DISH_CAPTIONS.featuredFood.map(
    (item) => `/menu?tab=${pageToMobileTab(item.pageNumber)}`
  ),
  dailySpecials: DISH_CAPTIONS.dailySpecials.map(
    (item) => `/menu?tab=${pageToMobileTab(item.pageNumber)}`
  ),
  featuredDrinks: DISH_CAPTIONS.featuredDrinks.map(
    (item) => `/menu?tab=${pageToMobileTab(item.pageNumber)}`
  ),
};
