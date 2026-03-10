import { isRecentReview } from "../utils/dateFormatter";
import { pageToMobileTab } from "./image-captions";
// Import menu items mapping and page conversion functions
import { getPageNumberForMenuItem, MENU_ITEMS } from "./menu-items";

export interface Review {
  name: string;
  text: string;
  rating?: number;
  location: string;
  source: "Google" | "Yelp";
  date: string;
}

export const SENTENCE_SPLITTER = /(?<=[.!?])\s+/;

// Review length tiers for consistent height loading
export type ReviewTier = "tiny-1" | "tiny-2" | "short" | "medium" | "long";

// Length thresholds for review categorization
const TINY_1_MAX_LENGTH = 25; // 30% - "Great!", "Food was great."
const TINY_2_MAX_LENGTH = 50; // 17.5% - "Great food and awesome service."
const SHORT_MAX_LENGTH = 120; // 22.5% - 2-3 sentence reviews
const MEDIUM_MAX_LENGTH = 250; // 12.5% - Multi-point reviews
const _LONG_MAX_LENGTH = 400; // 10% - Detailed experiences

export interface ReviewWithTier extends Review {
  tier: ReviewTier;
  length: number;
}

// Function to categorize reviews by length into tiers
// Helper function to check if a review should be deprioritized
function isDeprioritizedReview(review: Review): boolean {
  // Justin G's review appears less frequently (30% chance to be included vs 100% for others)
  if (review.name === "Justin G." && Math.random() > 0.3) {
    return true;
  }
  return false;
}

export function categorizeReviewsByLength(reviews: Review[]): ReviewWithTier[] {
  return reviews.map((review) => {
    const length = review.text.length;
    let tier: ReviewTier;

    if (length <= TINY_1_MAX_LENGTH) {
      tier = "tiny-1";
    } else if (length <= TINY_2_MAX_LENGTH) {
      tier = "tiny-2";
    } else if (length <= SHORT_MAX_LENGTH) {
      tier = "short";
    } else if (length <= MEDIUM_MAX_LENGTH) {
      tier = "medium";
    } else {
      tier = "long";
    }

    return {
      ...review,
      tier,
      length,
    };
  });
}

// Cache for tier categorization to avoid repeated processing
let tierCache: Record<ReviewTier, ReviewWithTier[]> | null = null;

// Function to get reviews by tier (with caching)
export function getReviewsByTier(
  reviews: Review[]
): Record<ReviewTier, ReviewWithTier[]> {
  // Return cached result if available
  if (tierCache) {
    return tierCache;
  }

  const categorizedReviews = categorizeReviewsByLength(reviews);

  tierCache = {
    "tiny-1": categorizedReviews.filter((r) => r.tier === "tiny-1"),
    "tiny-2": categorizedReviews.filter((r) => r.tier === "tiny-2"),
    short: categorizedReviews.filter((r) => r.tier === "short"),
    medium: categorizedReviews.filter((r) => r.tier === "medium"),
    long: categorizedReviews.filter((r) => r.tier === "long"),
  };

  return tierCache;
}

// Helper function to select reviews from debug mode
function selectDebugReviews(
  reviewsByTier: Record<ReviewTier, ReviewWithTier[]>,
  count: number,
  allReviews: Review[]
): Review[] {
  const longTierReviews = reviewsByTier.long || [];
  const selectedReviews: Review[] = [];
  const usedDates = new Set<string>();

  if (longTierReviews.length > 0) {
    const shuffled = [...longTierReviews].sort(() => Math.random() - 0.5);

    // Select reviews with unique dates
    for (const review of shuffled) {
      if (selectedReviews.length >= count) {
        break;
      }
      // Skip deprioritized reviews
      if (isDeprioritizedReview(review)) {
        continue;
      }
      const reviewDate = review.date;
      if (!usedDates.has(reviewDate)) {
        selectedReviews.push(review);
        usedDates.add(reviewDate);
      }
    }
  }

  // Fill remaining slots with any available reviews (ensuring unique dates)
  if (selectedReviews.length < count) {
    const shuffledAll = [...allReviews].sort(() => Math.random() - 0.5);

    for (const review of shuffledAll) {
      if (selectedReviews.length >= count) {
        break;
      }
      // Skip deprioritized reviews
      if (isDeprioritizedReview(review)) {
        continue;
      }
      const reviewDate = review.date;
      if (!(usedDates.has(reviewDate) || selectedReviews.includes(review))) {
        selectedReviews.push(review);
        usedDates.add(reviewDate);
      }
    }
  }

  return selectedReviews;
}

// Helper function to select reviews from normal mode
function selectNormalReviews(
  reviewsByTier: Record<ReviewTier, ReviewWithTier[]>,
  availableTiers: ReviewTier[],
  count: number
): Review[] {
  const selectedTier =
    availableTiers[Math.floor(Math.random() * availableTiers.length)];
  const tierReviews = reviewsByTier[selectedTier];

  // Shuffle and select from the chosen tier with unique dates
  const shuffled = [...tierReviews].sort(() => Math.random() - 0.5);
  const usedDates = new Set<string>();
  const selectedReviews: Review[] = [];

  // Select reviews with unique dates from the primary tier
  for (const review of shuffled) {
    if (selectedReviews.length >= count) {
      break;
    }
    // Skip deprioritized reviews
    if (isDeprioritizedReview(review)) {
      continue;
    }
    const reviewDate = review.date;
    if (!usedDates.has(reviewDate)) {
      selectedReviews.push(review);
      usedDates.add(reviewDate);
    }
  }

  // If we need more reviews and the tier doesn't have enough, fill from other tiers
  if (selectedReviews.length < count) {
    const remainingTiers = availableTiers.filter(
      (tier) => tier !== selectedTier
    );
    const shuffledRemaining = [...remainingTiers].sort(
      () => Math.random() - 0.5
    );

    for (const tier of shuffledRemaining) {
      if (selectedReviews.length >= count) {
        break;
      }

      const tierReviews = reviewsByTier[tier];
      const shuffled = [...tierReviews].sort(() => Math.random() - 0.5);

      // Select reviews with unique dates from other tiers
      for (const review of shuffled) {
        if (selectedReviews.length >= count) {
          break;
        }
        // Skip deprioritized reviews
        if (isDeprioritizedReview(review)) {
          continue;
        }
        const reviewDate = review.date;
        if (!usedDates.has(reviewDate)) {
          selectedReviews.push(review);
          usedDates.add(reviewDate);
        }
      }
    }
  }

  return selectedReviews;
}

// Function to create interleaved selection with recent reviews dispersed
function createInterleavedSelection(
  reviewsByTier: Record<ReviewTier, ReviewWithTier[]>,
  availableTiers: ReviewTier[],
  recentReviews: Review[],
  count: number
): Review[] {
  const minRecentReviews = 4;

  // Select a primary tier to maintain size consistency
  const selectedTier =
    availableTiers[Math.floor(Math.random() * availableTiers.length)];
  const tierReviews = reviewsByTier[selectedTier];

  // Get recent reviews from the selected tier
  const recentInTier = recentReviews.filter((review) => {
    const reviewWithTier = tierReviews.find(
      (tr) => tr.date === review.date && tr.name === review.name
    );
    return reviewWithTier !== undefined;
  });

  // Ensure we have enough recent reviews in this tier
  if (recentInTier.length < minRecentReviews) {
    // Not enough recent reviews in this tier, fall back to normal selection
    return selectNormalReviews(reviewsByTier, availableTiers, count);
  }

  // Select recent reviews with unique dates from the chosen tier
  const shuffledRecent = [...recentInTier].sort(() => Math.random() - 0.5);
  const uniqueDateRecent: Review[] = [];
  const usedDates = new Set<string>();

  for (const review of shuffledRecent) {
    // Skip deprioritized reviews
    if (isDeprioritizedReview(review)) {
      continue;
    }
    const reviewDate = review.date;
    if (!usedDates.has(reviewDate)) {
      uniqueDateRecent.push(review);
      usedDates.add(reviewDate);
      if (uniqueDateRecent.length >= minRecentReviews) {
        break;
      }
    }
  }

  // If we don't have enough after filtering, fall back
  if (uniqueDateRecent.length < minRecentReviews) {
    return selectNormalReviews(reviewsByTier, availableTiers, count);
  }

  const selectedRecent = uniqueDateRecent.slice(0, minRecentReviews);

  // Get older reviews from the SAME tier for consistency
  const availableInTier = tierReviews.filter(
    (review) =>
      !recentInTier.some(
        (recent) => recent.date === review.date && recent.name === review.name
      )
  );

  // Select older reviews with unique dates from the same tier
  const remainingSlots = count - minRecentReviews;
  const shuffledOlder = [...availableInTier].sort(() => Math.random() - 0.5);

  const selectedOlder: Review[] = [];
  for (const review of shuffledOlder) {
    if (selectedOlder.length >= remainingSlots) {
      break;
    }
    // Skip deprioritized reviews
    if (isDeprioritizedReview(review)) {
      continue;
    }
    const reviewDate = review.date;
    if (!usedDates.has(reviewDate)) {
      selectedOlder.push(review);
      usedDates.add(reviewDate);
    }
  }

  // Create interleaved pattern: recent, older, recent, older...
  const interleaved: Review[] = [];
  const maxLength = Math.max(selectedRecent.length, selectedOlder.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < selectedRecent.length) {
      interleaved.push(selectedRecent[i]);
    }
    if (i < selectedOlder.length) {
      interleaved.push(selectedOlder[i]);
    }
  }

  // If we still need more reviews from this tier (ensuring unique dates)
  if (interleaved.length < count) {
    let additionalIndex = remainingSlots;

    while (
      interleaved.length < count &&
      additionalIndex < shuffledOlder.length
    ) {
      const review = shuffledOlder[additionalIndex];

      // Skip deprioritized reviews
      if (!isDeprioritizedReview(review)) {
        const reviewDate = review.date;

        if (!usedDates.has(reviewDate)) {
          interleaved.push(review);
          usedDates.add(reviewDate);
        }
      }

      additionalIndex++;
    }
  }

  // Trim to exact count if we have too many
  return interleaved.slice(0, count);
}

// Function to select reviews using tiered system
export function selectReviewsByTier(
  reviews: Review[],
  count = 8,
  debugMode = false,
  isMobile = false
): { selectedReviews: Review[]; selectedColors: string[] } {
  const reviewsByTier = getReviewsByTier(reviews);
  const tiers: ReviewTier[] = ["tiny-1", "tiny-2", "short", "medium", "long"];

  // Mobile: exclude long (>250 chars). Desktop: only medium and long
  const tiersToUse = isMobile
    ? tiers.filter((tier) => tier !== "long")
    : tiers.filter((tier) => tier === "medium" || tier === "long");

  // Filter out empty tiers
  const availableTiers = tiersToUse.filter(
    (tier) => reviewsByTier[tier].length > 0
  );

  if (availableTiers.length === 0) {
    return { selectedReviews: [], selectedColors: [] };
  }

  // Get recent reviews (using consistent logic with date formatting)
  const recentReviews = reviews.filter((review) => isRecentReview(review.date));

  let selectedReviews: Review[];

  if (debugMode) {
    selectedReviews = selectDebugReviews(reviewsByTier, count, reviews);
  } else {
    // Create interleaved selection with recent reviews dispersed
    selectedReviews = createInterleavedSelection(
      reviewsByTier,
      availableTiers,
      recentReviews,
      count
    );
  }

  // Generate visually distinct colors for the selected reviews
  const selectedColors = getVisuallyDistinctColors(selectedReviews.length);

  return { selectedReviews, selectedColors };
}

// Function to get visually distinct colors by grouping similar hues
function getVisuallyDistinctColors(count: number): string[] {
  const RandomSortOffset = 0.5;

  // Group similar colors together
  const colorGroups = {
    yellows: ["#F8C839", "#FCCA3D", "#F9AA51", "#F1A720", "#AA8C30"],
    paleYellows: ["#FDEAAF", "#FDF2D2"],
    oranges: ["#EF6A4B", "#F16E15"],
    reds: ["#CF0822", "#FF0000", "#D42D40"],
    pinks: ["#F15670", "#F690A1", "#EDA8AF", "#FBCAD3"],
    greens: ["#006847", "#5B9D88", "#065955", "#717732", "#9CA169"],
    teals: ["#30C2DC", "#8BBEBF", "#0B8489", "#02534E"],
    blues: ["#0972A6"],
    browns: ["#B07229", "#8F4620", "#953220", "#DBAD6C"],
    blacks: ["#202020", "#231F20", "#1F2121"],
    whites: ["#FFFFFF"],
  };

  const selectedColors: string[] = [];
  const groupKeys = Object.keys(colorGroups) as Array<keyof typeof colorGroups>;

  // Shuffle the groups to get random selection order
  const shuffledGroups = [...groupKeys].sort(
    () => Math.random() - RandomSortOffset
  );

  // Select one color from each group until we have enough
  for (const groupKey of shuffledGroups) {
    if (selectedColors.length >= count) {
      break;
    }

    const group = colorGroups[groupKey];
    const randomColor = group[Math.floor(Math.random() * group.length)];
    selectedColors.push(randomColor);
  }

  // If we still need more colors, fill with remaining colors
  if (selectedColors.length < count) {
    const allColors = Object.values(colorGroups).flat();
    const remainingColors = allColors.filter(
      (color) => !selectedColors.includes(color)
    );
    const shuffledRemaining = [...remainingColors].sort(
      () => Math.random() - RandomSortOffset
    );

    while (selectedColors.length < count && shuffledRemaining.length > 0) {
      const nextColor = shuffledRemaining.shift();
      if (nextColor) {
        selectedColors.push(nextColor);
      }
    }
  }

  return selectedColors;
}

export const reviews: Review[] = [
  {
    name: "Jesse P.",
    location: "Bella Vista",
    text: "Wandered in for lunch and it was great. Quick service, great value and delicious food. Highly recommend!",
    source: "Yelp",
    date: "2025-05-01",
  },
  {
    name: "Cienna G.",
    location: "Bella Vista",
    text: "Nice atmosphere, great service, and amazing food!! I didn't catch our servers name, but he was perfect! Everyone who helped at our table super helpful and had a big smile on their face. I got Hawaiian fajitas and it was BOMB!! Carter got the Steven's special, he crushed that. Great portions, fair prices, tastes PHENOMENAL! So flavorful, everything cooked to perfection, just perfect perfect perfect! I wish I had room for dessert, definitely have to come back! Best Mexican food around here. Highly, highly recommend!!! If I could give more than 5 stars I would!",
    source: "Yelp",
    date: "2025-05-25",
  },
  {
    name: "Stephen K.",
    location: "Bella Vista",
    text: "Ambiance was great. Salsa and chips were also great. I had Carnitas, best I've had in a long time. My wife had the veggie fajitas, which she said were really tasty. Service was awesome. We'll be back for sure.",
    source: "Yelp",
    date: "2025-03-23",
  },
  {
    name: "Laura M.",
    location: "Bella Vista",
    text: "Super yummy food! We stopped in to this place visiting family in Bella Vista. It was very tasty!",
    source: "Yelp",
    date: "2024-02-03",
  },
  {
    name: "Karen M.",
    location: "Bella Vista",
    text: "Inexpensive tasty food with a variety of choices on the menu, Great drinks, strong margaritas and great service.",
    source: "Yelp",
    date: "2025-03-19",
  },
  {
    name: "Justin G.",
    location: "Bella Vista",
    text: "Fire burritos! great service. good vibes. love taking my family here. affordable and good quality.",
    source: "Yelp",
    date: "2025-01-15",
  },
  {
    name: "Kristi O.",
    location: "Bella Vista",
    text: "Went here today and had a new thing. I got the Wally Special and it was crab, shrimp, and scallops in enchiladas with white sauce and rice and guacamole salad. ...overall was the best enchiladas I have ever had.",
    source: "Yelp",
    date: "2021-12-27",
  },
  {
    name: "Cedric K.",
    location: "Bella Vista",
    text: "They are open longer hours most days than any other restaurant in the area. I order the same thing (chicken fajita burrito) every time. I usually order it take out style. It's always ready in 15 minutes, and consistently good every time. The staff is very friendly.",
    source: "Yelp",
    date: "2023-11-02",
  },
  {
    name: "Amy T.",
    location: "Bella Vista",
    text: "The food & service are excellent. We eat there every week and it is very consistent. If you haven't tried the fajitas you should and the beer is always cold",
    source: "Yelp",
    date: "2024-07-09",
  },
  {
    name: "Kelly R.",
    location: "Bella Vista",
    text: "The food was excellent, the service was great! I enjoyed this little place on my birthday and it was a great treat! There is always time for Hispanic food! The restrooms and restaurant were very clean... The food was very fresh and right on time. The service was so friendly. We will definitely be back when in the area again!",
    source: "Yelp",
    date: "2022-01-02",
  },
  {
    name: "Michele G.",
    location: "Bella Vista",
    text: "At the recommendation of a friend I tried this restaurant and was really impressed at how great the food was. It's really close to the Mexican food we have in California. Next time I'm in the area I will for sure go back! It was craveably great",
    source: "Yelp",
    date: "2023-03-31",
  },
  {
    name: "Jimmy D.",
    location: "Bella Vista",
    text: "Tucked away in a small shopping mall. Worth the effort. Tasty jalapeños margaritas, creamy guacamole and fresh chips. Yeah you should try them out.",
    source: "Yelp",
    date: "2023-05-21",
  },
  {
    name: "Alaina F.",
    location: "Bella Vista",
    text: "My favorite Mexican Restaurant in all of Arkansas! They treat us like family, the food is delicious, and Mario has done so well taking this place and expanding it all over NWA",
    source: "Yelp",
    date: "2023-12-15",
  },
  {
    name: "Eric C.",
    location: "Bella Vista",
    text: "We were in Pineville Missouri to camp this year and needed a break from cooking food over the camp stove. The owner of the camp ground told us about their favorite Mexican place in Bella Vista AR so we made plans to head down there that evening. Our party of 8 were seated quickly even though the place was somewhat busy. Our very efficient waiter came over and got our drink order, asked us if we wanted additional appetizers, as another server brought over chips and salsa. The food and service was most excellent!! They fawned all over us making sure our drinks were refilled and gave us more chips. The food portions were enormous and most of us ended up taking the rest in a to go container. This will be another favorite when we make the trip from Omaha to Bella Vista again!",
    source: "Yelp",
    date: "2022-07-20",
  },
  {
    name: "Jake D.",
    location: "Bella Vista",
    text: "Our first time here. Food was amazing, prices were very reasonable, servings were huge, and super friendly server. I can't recommend this place enough! Enjoying a great meal with the family. This place is awesome!",
    source: "Yelp",
    date: "2022-06-03",
  },
  {
    name: "Melissa H.",
    location: "Bella Vista",
    text: "Great food and fast service. Not many places have Mexican pizza. I had the chicken. It was amazing. My husband had the steak on our next visit. He said it was great too. We will definitely be back.",
    source: "Yelp",
    date: "2023-06-23",
  },
  {
    name: "Jeanette L.",
    location: "Bella Vista",
    text: "We generally love going here. The service is great. The food is excellent and we're in and out pretty quickly! Between the two Mexican restaurants in Bella Vista, I will pick this one.",
    source: "Yelp",
    date: "2018-07-18",
  },
  {
    name: "Sheri D.",
    location: "Bella Vista",
    text: "Food is good and portions are nice too! The staff is fast and very friendly! Love the atmosphere-very convenient and easy to get in to!",
    source: "Yelp",
    date: "2023-04-05",
  },
  {
    name: "C U.",
    location: "Bella Vista",
    text: "We visit Bella Vista for a week every year and this is a regular stop. Great food, great drinks, great people. Can't wait for the next visit.",
    source: "Yelp",
    date: "2023-06-04",
  },
  {
    name: "Ethan S.",
    location: "Bella Vista",
    text: "Awesome no cap my G would recommend the food was good but the service top tier. I would bring all your homies. The ambiance is amazing. I mean if you're not foaming at the mouth, I don't know what you're doing with your life.",
    source: "Yelp",
    date: "2023-04-26",
  },
  {
    name: "Sabrina M.",
    location: "Bella Vista",
    text: "Great Mexican food, the prices can't be beat and the service is wonderful. I have been working my way through the menu and so far everything is delicious. Even my picky kids finished their whole plate.",
    source: "Yelp",
    date: "2019-06-26",
  },
  {
    name: "Denise E.",
    location: "Bella Vista",
    text: "We stopped in on a Wednesday, right at 1100. The place smelled incredible. It is small but very clean. We were greeted with great smiles from the host. The menu is varied. Lots of options. The drink glasses are HUGE. I had 2 Street Tacos, al pastor. They were delicious. Packed with meat. My husband had the Mexican Pizza and he really enjoyed it. The Guacamole was chunky and flavorful. We would definitely go back.",
    source: "Yelp",
    date: "2022-08-03",
  },
  {
    name: "Meagan S.",
    location: "Bella Vista",
    text: "We were passing thru and stopped here for lunch. Service was impeccable. Food was reasonably priced and good.",
    source: "Yelp",
    date: "2022-07-27",
  },
  {
    name: "Kristen D.",
    location: "Bella Vista",
    text: "Fantastic food and attentive staff. We've been coming here for the past few years and they never disappointed us.",
    source: "Yelp",
    date: "2022-06-25",
  },
  {
    name: "Wendy B.",
    location: "Bella Vista",
    text: "Today was our first time to eat at El Pueblito. The food and service was amazing. Everything was fresh and authentic Mexican. My Chicken Chimichanga was so good and my husband loved the Pollo Fundido. We will be regulars from now on.",
    source: "Yelp",
    date: "2017-11-05",
  },
  {
    name: "Julia D.",
    location: "Bella Vista",
    text: "My favorite meal at El Pueblito is the 'Emily Special'-chicken. Always delicious. The service is quick and the food is served hot. They also do take out and food is ready for pick up in just 15 minutes. Great job El Pueblito!!!",
    source: "Yelp",
    date: "2017-07-23",
  },
  {
    name: "Nina D.",
    location: "Bella Vista",
    text: "Great food with excellent service. Family owned and operated. Prices are very reasonable for the great Mexican food.",
    source: "Yelp",
    date: "2021-11-21",
  },
  {
    name: "Steve B.",
    location: "Bella Vista",
    text: "This is a great little Mexican food restaurant in Bella Vista. They have good food, good service and a convenient location. They have daily specials on food and drinks that are a great value. A solid place to go when you are hungry for Mexican food!",
    source: "Yelp",
    date: "2019-07-25",
  },
  {
    name: "41",
    location: "Bella Vista",
    text: "Delicious food and super fast service! What more could you ask for?! You get free chips and salsa right away ( the salsa has a little bit of heat to it). I've had the 'burrito supreme' 2 times now and it's always perfect… Can't wait to try more things on the menu.",
    source: "Yelp",
    date: "2019-01-25",
  },
  {
    name: "Bill R.",
    location: "Bella Vista",
    text: "The best Mexican food in NWA. Consistent quality food. Fast friendly service. Nice atmosphere.",
    source: "Yelp",
    date: "2021-07-01",
  },
  {
    name: "Katie G.",
    location: "Bella Vista",
    text: "Great veggie fajitas! Great salsa! Great service. They have a big menu, and I love that they have a vegetarian section. My boys all liked their kids' meals, my dad loved his fajitas also. It was a quick pick after going around Tanyard Creek Nature Trail. There were quite a few people there during our late lunch at 3 pm in the afternoon. Everyone left impressed with how good it was.",
    source: "Yelp",
    date: "2018-07-29",
  },
  {
    name: "Lorna P.",
    location: "Bella Vista",
    text: "I love El Pueblito. As a person who has Alpha Gal Allergies, I have been able to eat here several times. Each time I have had the Shrimp and Chicken Fajitas. Thank you to El Pueblito for giving me at least one restaurant I can eat at.",
    source: "Yelp",
    date: "2019-01-06",
  },
  {
    name: "George C.",
    location: "Bella Vista",
    text: "This is one of the best Mexican restaurants in the area. They are fast, friendly and the price is great.",
    source: "Yelp",
    date: "2020-03-21",
  },
  {
    name: "Robin W.",
    location: "Bella Vista",
    text: "The best Mexican food we have had in a very long time. Bella Vista has a gem here. So glad it is close to our new home.",
    source: "Yelp",
    date: "2021-03-18",
  },
  {
    name: "Juan M.",
    location: "Bella Vista",
    text: "Large variety of amazing food! We had the Pollo El Pueblito and an El Toro, phenomenal! Very prompt service, staff is very friendly, and wait times were minimal despite it being a Friday evening. Also, many delicious drinks to choose from, highly recommend!",
    source: "Yelp",
    date: "2020-09-04",
  },
  {
    name: "Leroy B.",
    location: "Bella Vista",
    text: "100% best authentic Mexican food around. Got the Enchiladas Verdes and it was phenomenal. Great atmosphere and the staff is very helpful. If you're looking for a good place to eat out, this is the place to be.",
    source: "Yelp",
    date: "2019-02-24",
  },
  {
    name: "Mike L.",
    location: "Bella Vista",
    text: "Our favorite Mexican in the area. We even drive out of the way now that we don't live in Bella Vista just to eat here. Prices are reasonable and service is usually excellent. Expect a wait at rush times.",
    source: "Yelp",
    date: "2017-10-08",
  },
  {
    name: "Brenda M.",
    location: "Bella Vista",
    text: "My husband and I have eaten here twice now. and we have enjoyed the food very much. The atmosphere is comfortable and inviting and the wait staff is great. The chips and salsa are the best I've had in Northwest Arkansas.",
    source: "Yelp",
    date: "2018-02-20",
  },
  {
    name: "Casey C.",
    location: "Bella Vista",
    text: "Best Mexican food in the area by far. Prices are excellent and the staff is well trained and friendly.",
    source: "Yelp",
    date: "2020-07-01",
  },
  {
    name: "Marisa C.",
    location: "Bella Vista",
    text: "We have been here 4 times and not one bad meal! All the entrees have been delicious. I will say my favorite is Wally's Special!! The servers have all been really good to my family too.",
    source: "Yelp",
    date: "2019-03-21",
  },
  {
    name: "Ian R.",
    location: "Bella Vista",
    text: "Awesome restaurant, great food and great service. Very well kept and the staff is awesome.",
    source: "Yelp",
    date: "2016-03-20",
  },
  {
    name: "John T.",
    location: "Bella Vista",
    text: "Tucked away on the West side of Bella Vista, AR. Very good food. good service and reasonably priced. It's about a 25 minute drive for us to get there. But the meal is worth it. We try to go once a month or so. It's a great place for lunch, as well. Avoid the obvious dinner hour and you will get in faster, that is go a little early or a little late.",
    source: "Yelp",
    date: "2016-01-26",
  },
  {
    name: "Ron P.",
    location: "Bella Vista",
    text: "This restaurant was a great find and we'll surely be going back regularly after this excellent visit. We went on a Friday night and it was very busy; we didn't have to wait for a table because the place is very big. I ordered Shrimp Fajitas and my wife ordered Chicken Fajitas. They were excellent and the serving was huge. The service was great and every staff member that we interacted with was extremely welcoming and friendly! An added bonus is the great prices!",
    source: "Yelp",
    date: "2016-05-14",
  },
  {
    name: "Dave G.",
    location: "Bella Vista",
    text: "This is the best kept secret in Bella Vista. Love the tomatillo salsa. Prices are very reasonable and the place is pretty clean...",
    source: "Yelp",
    date: "2017-11-01",
  },
  {
    name: "Cindy L.",
    location: "Bella Vista",
    text: "Always busy, El Pueblito is our favorite Mexican food restaurant in the area of (Benton County and Washington County). There is another one in Rogers that is good too, but El Pueblito is wonderful! The servers are friendly and always give great service. I've tried many dishes there and have not been disappointed in any! The chips and salsa are very good. So far nothing is lacking! We will be back time and time again!",
    source: "Yelp",
    date: "2016-04-27",
  },
  {
    name: "Bruce F.",
    location: "Bella Vista",
    text: "There is no better Mexican food, service, or Margaritas in Northwest Arkansas. The staff is friendly, the menu is extensive, and the atmosphere is enjoyable. Big screen TV's everywhere for sports. We eat there a minimum of once a week.",
    source: "Yelp",
    date: "2014-12-31",
  },
  {
    name: "Frank S.",
    location: "Bella Vista",
    text: "Yes, yes, yes! Great food, friendly people, consistently good experience. Large portions so you should have lunch the next day, too. Low prices - just don't know of anything I could complain about. Go off-hours if you don't want to wait - locals know this place well and frequent it often.",
    source: "Yelp",
    date: "2017-08-26",
  },
  {
    name: "Jamie W.",
    location: "Bella Vista",
    text: "My favorite Mexican Restaurant in Bella Vista! the White Queso is delicious. Love the Burrito El Pueblito! The staff is so flippin' friendly, too! I'm always greeted and treated like a regular even though I don't go nearly as often as I'd like! Check this place out!",
    source: "Yelp",
    date: "2016-11-15",
  },
  {
    name: "Marcia N.",
    location: "Bella Vista",
    text: "Our favorite Mexican restaurant of all time. Service is always good and the food is so tasty. Chips and salsa are the best. We live close by so eat here several times a month. Burrito Ranchero and Jamie Special are two of my favorites. You won't be disappointed!",
    source: "Yelp",
    date: "2016-08-22",
  },
  {
    name: "Matt B.",
    location: "Bella Vista",
    text: "Great food, great service and great atmosphere! This side of Bella Vista has definitely needed a quality Mexican restaurant for a while now. Highly recommend this place! A lot of menu options to include your basics and their own special plates.",
    source: "Yelp",
    date: "2015-02-14",
  },
  {
    name: "Nick B.",
    location: "Bella Vista",
    text: "Just the best little Mexican restaurant around!! Not a bad thing to say about it we love coming here it's a regular visit for us... great food and Margaritas and the staff is amazing!!!",
    source: "Yelp",
    date: "2016-06-25",
  },
  {
    name: "Cherri R.",
    location: "Bella Vista",
    text: "We go to El Pueblito probably every other Sunday because it's right next to our church. That's just part of the reason we love it. The food is excellent, priced very well, the atmosphere is great, the place is clean (even the bathrooms), the staff is friendly and the food comes out FAST! The waiters have taken a liking to our baby and they always remember us and ask us how we've been when we come in. I wouldn't give any less than 5 stars to this great restaurant. Wish more eateries in BV conducted business like they do.",
    source: "Yelp",
    date: "2015-10-03",
  },
  {
    name: "Ken H.",
    location: "Bella Vista",
    text: "We were expecting a 'normal' mexican restaurant. We were disappointed. El Pueblito was maybe the greatest mexican restaurant we have ever been. Food was excellent and plentiful. Service was attentive. Prices were great. Two meals and two drinks were slightly above $30.00. Would we recommend it? Definitely. Any restaurant with no empty tables at 7 on a Wednesday evening is doing everything right.",
    source: "Yelp",
    date: "2015-12-09",
  },
  {
    name: "Paula Y.",
    location: "Bella Vista",
    text: "We love this Mexican restaurant. So authentic, clean,delicious we cannot say enough good things about it! The staff is so friendly and helpful. A member of our family is from Mexico City and she said it is the most authentic Mexican food since she was there! We have been eating here since the restaurant opened and we will continue to do so. We recommend it to others.",
    source: "Yelp",
    date: "2015-10-05",
  },
  {
    name: "Sue O.",
    location: "Bella Vista",
    text: "This is a favorite place of mine--good food, great service and selection on menu is different from other area Mexican restaurants. Family owned and run. High praise, but well deserved!",
    source: "Yelp",
    date: "2016-01-08",
  },
  {
    name: "Caitlin Williams",
    location: "Bella Vista",
    text: "This is the best Mexican restaurant around! We got 2 combos and 2 drinks with upcharge for fajita meat instead and it was only $24 for both of us. Large portions, incredible food, and friendly service. I definitely recommend trying the Alambres Special! It was chicken, peppers, bacon, onions, and cheese with rice, beans, side salad, and pico de gallo, Guacamole, and sour cream for $10.50. It's my favorite thing there. They give you plenty to eat so I've never gotten around to eating dessert; I've always been too full, but I'm looking forward to trying their Flan one of these days.",
    source: "Google",
    date: "2020-08-01",
  },
  {
    name: "Kyla Brunetti",
    location: "Bella Vista",
    text: "Food was delicious and service was great. The queso was one of the tastier ones I've had before.",
    source: "Google",
    date: "2021-08-01",
  },
  {
    name: "FrothyKick",
    location: "Bella Vista",
    text: "Festive Latino music, fun and friendly servers create an authentic flavored Mexico atmosphere. Addicted to their Chile Relleno dish 'Lunch Special Number One' with their red sauce. We eat there weekly.",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Jerry Chapman",
    location: "Bella Vista",
    text: "The food here is fantastic and the staff is friendly.",
    source: "Google",
    date: "2024-05-01",
  },
  {
    name: "Ross Ellerbe",
    location: "Bella Vista",
    text: "We called an order in for pickup (4 people) and it was ready within 15 minutes. Service was friendly and fast. Our order was correct, and more importantly delicious! 5/5!",
    source: "Google",
    date: "2023-12-01",
  },
  {
    name: "Russell Capps",
    location: "Bella Vista",
    text: "Lots of good reviews, and I see why! Great service, serving sizes were enormous and an excellent value, food was delicious. We will definitely be back!",
    source: "Google",
    date: "2023-11-01",
  },
  {
    name: "Sherry Pankau",
    location: "Bella Vista",
    text: "We celebrated a friend's birthday and had such a good time. Especially when they sang to her 😅😆",
    source: "Google",
    date: "2024-03-01",
  },
  {
    name: "Carol Karlowski",
    location: "Bella Vista",
    text: "Really enjoyed the food. Chili relleños were great. Had them leave the shrimp off so my spouse could try it. The chicken and shrimp aren't actually stuffed in the chili but are served on either side of the rellenos. Spouse had street tacos and enjoyed those as well. The salsa was good as well had just enough kick without being overwhelming.",
    source: "Google",
    date: "2023-09-01",
  },
  {
    name: "Trevor Flanagan",
    location: "Bella Vista",
    text: "Good food and service! We will be back! Edit: it's been 4 years and we came back again. Still great food and service.",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Scot Egg",
    location: "Bella Vista",
    text: "Tasty Tacos 🌮 with quick service, ample seating and atmosphere.",
    source: "Google",
    date: "2023-08-01",
  },
  {
    name: "Harry Blumberg",
    location: "Bella Vista",
    text: "We had a great experience there for dinner on a Thursday night. We arrived at about 7 PM and it was very busy when we got there. The restaurant was clean and maintained. There were lots of employees there and they were all working very hard. The food was good, I got Emily's special and was very happy with it. I was glad this place was here because this is one of the few restaurants in Bella Vista.",
    source: "Google",
    date: "2023-08-01",
  },
  {
    name: "Ramon Portilla",
    location: "Bella Vista",
    text: "Taco Salad is best in town. El Pueblito does a great job with food quality and consistency across all their NWA restaurants.",
    source: "Google",
    date: "2023-02-01",
  },
  {
    name: "Drew Curren",
    location: "Bella Vista",
    text: "This is a great place for all your Tex-Mex desires. I appreciate their specialty dishes that you can't find elsewhere. They have a great most appealing menu that makes you want to order one of everything.",
    source: "Google",
    date: "2023-12-01",
  },
  {
    name: "Katrena MacDonald",
    location: "Bella Vista",
    text: "The food is always amazing. We love how everything is authentic. This is real Mexican food. It's the only place we've found since we've moved here ten years ago.",
    source: "Google",
    date: "2023-11-01",
  },
  {
    name: "Michaela Crase",
    location: "Bella Vista",
    text: "Great food and not to mention the drinks!",
    source: "Google",
    date: "2020-08-01",
  },
  {
    name: "Amber Ivers",
    location: "Bella Vista",
    text: "I loved it here. They were busy when we first arrived. There were ten of us and half of us showed up early to make sure we can get a table without rushing them. They were very courteous and patient. The food was great and at an affordable price.",
    source: "Google",
    date: "2023-08-01",
  },
  {
    name: "Dan",
    location: "Bella Vista",
    text: "Still good. Nobody else has El Toro, and I haven't had anyone else offer scorpion salsa. It was impressive to see something truly local grow.",
    source: "Google",
    date: "2023-10-01",
  },
  {
    name: "brigitte flanagan",
    location: "Bella Vista",
    text: "Quick, clean and great service. Need a beer or three? Order a large - it's no joke. Salsa and razorback enchiladas are very good.",
    source: "Google",
    date: "2017-08-01",
  },
  {
    name: "Jarryd Hawley",
    location: "Bella Vista",
    text: "We had a large group and the service was incredible. Everyone's food came out great and we were well taken care of the whole time.",
    source: "Google",
    date: "2023-10-01",
  },
  {
    name: "Jean Hase",
    location: "Bella Vista",
    text: "Excellent food with reasonable lunch prices.",
    source: "Google",
    date: "2024-03-01",
  },
  {
    name: "Rob Schmoo",
    location: "Bella Vista",
    text: "Great Mexican food and awesome service.",
    source: "Google",
    date: "2024-06-01",
  },
  {
    name: "Rory Sheridan",
    location: "Bella Vista",
    text: "Awesome food and atmosphere after a hard day hanging Christmas lights.",
    source: "Google",
    date: "2023-12-01",
  },
  {
    name: "L K",
    location: "Bella Vista",
    text: "This is our family's favorite Mexican restaurant. I believe we get takeout at least once a wk. Everyone is friendly, the food is delicious.",
    source: "Google",
    date: "2023-10-01",
  },
  {
    name: "Clint King",
    location: "Bella Vista",
    text: "Always thoroughly enjoy eating here. Warm chips, good salsa, queso, and the Wally Special!",
    source: "Google",
    date: "2023-12-01",
  },
  {
    name: "Shane Vaughan",
    location: "Bella Vista",
    text: "This is our go to spot for Mexican food. Order the 'handmade' fresh Guacamole! Best ever!",
    source: "Google",
    date: "2019-08-01",
  },
  {
    name: "Justin Eaton",
    location: "Bella Vista",
    text: "Our favorite place to sat in Bella Vista. Service is great. Food is awesome.",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "DJ & Tucker",
    location: "Bella Vista",
    text: "A delicious little lunch joint. Beef fajitas and queso are solid choices.",
    source: "Google",
    date: "2024-01-01",
  },
  {
    name: "Jamie Beesley",
    location: "Bella Vista",
    text: "Love coming here. Closest we can get to our Taqueria in Dallas!!",
    source: "Google",
    date: "2024-03-01",
  },
  {
    name: "sharon kuhl",
    location: "Bella Vista",
    text: "We come here once a year while on our Float Trip at Gracies campground on the Elk River! We love coming here! Everything from the chips and salsa, entrées, MARGARITAS are excellent! Can't wait to come back next year! Thanks for the great service to our BIG party! Love from Kansas City, MO!",
    source: "Google",
    date: "2023-08-01",
  },
  {
    name: "Savannah Goebel",
    location: "Bella Vista",
    text: "Loved this place! Not too fancy but still very nice. started out with the best salsa and ended with fantastic food. Our waitress was very sweet and good at her job and the prices were very reasonable. They serve coke products and a wide selection of adult beverages. Def 5 stars 😉",
    source: "Google",
    date: "2019-08-01",
  },
  {
    name: "Terry Traylor",
    location: "Bella Vista",
    text: "Went there on Cinco de Mayo and the parking lot was full and the placed was packed at 4:40. They had extra staff, more than normal. We got seated quickly and did not have to wait long for our meal. The staff was really hustling and I was amazed at how well they operated. Food was excellent as always. When we left, they must have been 15 people waiting outside.",
    source: "Google",
    date: "2022-05-05",
  },
  {
    name: "Laurie Marugo",
    location: "Bella Vista",
    text: "We love this place, food price and service are amazing. Best salsa in miles.",
    source: "Google",
    date: "2023-10-01",
  },
  {
    name: "Neal Maguire",
    location: "Bella Vista",
    text: "This is the Bella Vista location. They do a very good job of consistently providing very good food and service at good prices. The Centerton location is our 'go to' fox Mexican food.",
    source: "Google",
    date: "2023-08-01",
  },
  {
    name: "Reece Taylor",
    location: "Bella Vista",
    text: "Me and my family absolutely Love this place good food fair prices and quick service absolutely recommended",
    source: "Google",
    date: "2023-09-01",
  },
  {
    name: "Tracie Irvine",
    location: "Bella Vista",
    text: "The food tastes great and the presentation is good too. The prices are appropriate for high quality Mexican food, you can download the menu and see for yourself. Everyone at our table liked what they ordered. The cilantro sauce on my dish was amazing and unique.\n\nWe are thrilled that we have a great restaurant here in Bella Vista and that they have a full parking lot at lunch and dinner when we drive bye. Keep up the great work guys!",
    source: "Google",
    date: "2013-07-01",
  },
  {
    name: "yevgeniy tereshchenko",
    location: "Bella Vista",
    text: "Great food. Service was great. Prices are very affordable. Menu has plenty to choose from. Masks, dine in available, no wait for seating, food was cooked quickly and well served hot. Chips and salsa free, place is clean. Also serves alcohol... I enjoyed the food and service thanks...",
    source: "Google",
    date: "2020-08-01",
  },
  {
    name: "Vince Terry",
    location: "Bella Vista",
    text: "I was really impressed with El pueblito. first time visiting and I'm with a group of older people celebrating birthdays and there's nothing that is harder on a server than having to deal with a bunch of cantankerous old people. Service was great our waiter took care of us made sure extras were gotten for the older couples who needed this and that. Food was excellent and the prices were more than reasonable I expected to drop in the neighborhood of around forty $50 and walked away having spent a little over 25. I plan on making this place a regular visit.",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "Isabella Earl",
    location: "Bella Vista",
    text: "I very much enjoyed our visit here. Not only was our food delicious, but the service was spot on. Our waitress was attentive, polite, and knew what she was doing. Because she did it well. We will definitely be coming back!",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "Jan H.",
    location: "Bella Vista",
    text: "El Pueblito has continued to consistently deliver flavorful Mexican food ever since they opened in Bella Vista many years ago.We've never left disappointed or still hungry! I usually have leftovers to bring home. Their chips have always been served soon after being seated and have been crisp and fresh. They bring several small bottles of their fresh salsa along with a bowl for each person. (No double dipping worries!) Their full menu has a wide variety of dishes to choose from and they have a lunch menu; all reasonably priced. The atmosphere is friendly, pleasant and upbeat. They've expanded in two more NWA locations, Centerton and on Hwy 12, Rogers. I encourage you to give El Pueblito a try. I'm pretty sure you'll be glad you did and become a repeat customer!!",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Kris Washington",
    location: "Bella Vista",
    text: "This venue used to change restaurants like most folks change socks, but when El Pueblito came in, I was hoping they'd stick around after just the first visit (and they have!). We go so often that the wait staff recognizes us and knows what we usually order. Super friendly group of folks, always smiling - or singing! The food is amazing and if I could eat it every day I still wouldn't get tired of it. Love this place!",
    source: "Google",
    date: "2015-07-01",
  },
  {
    name: "Matt Pukas",
    location: "Bella Vista",
    text: "One of my favorites is the Fajita Hawaiian. Ordered it on two consecutive visits. The second time I asked for extra tortillas. Huge portion! I normally eat all my food while it's fresh, but had to get a to-go box. My family comes here about once a month.",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Efren Rodriguez",
    location: "Bella Vista",
    text: "This place is great! Food tastes awesome, salsa, I'm told, is very tasty, and they have a very good selection of items to order. I had the chicken burrito and it was delicious. Choripollo is my new favorite and margaritas are tasty 🙂",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Richard Schwarz",
    location: "Bella Vista",
    text: "Great food, good prices, and great services. Always enjoy a meal here.",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Heather Coverdell",
    location: "Bella Vista",
    text: "Great food great service will recommend to friends and family.",
    source: "Google",
    date: "2024-06-01",
  },
  {
    name: "G.B. Wright",
    location: "Bella Vista",
    text: "Took my family here and had a great time! Delicious food!",
    source: "Google",
    date: "2023-10-01",
  },
  {
    name: "Lilith B.",
    location: "Bella Vista",
    text: "Very good food and prices. I like their beef fajita and queso dip.",
    source: "Google",
    date: "2023-11-01",
  },
  {
    name: "K Kirby",
    location: "Bella Vista",
    text: "Tried this place out for the first time tonight. The service was great and the chips, salsa and entrees were delicious! This will definitely be one of our go to restaurants.",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Bethany Cutler",
    location: "Bella Vista",
    text: "Such amazing service, food and really yummy margaritas! I would definitely go back!",
    source: "Google",
    date: "2023-09-01",
  },
  {
    name: "Robert Vitztum",
    location: "Bella Vista",
    text: "We love eating here. We are from out of town but are getting married in Bella Vista and will have them cater our reception. The service is always spot on. Our chips were never empty and our glasses were always full. Even when they are slammed the owners step in to make sure everyone is taken care of.",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "Emily LaVoice",
    location: "Bella Vista",
    text: "The food was very good, the staff was friendly and pretty impressive in my opinion. One waiter carried about 6 plates on one arm. Prices were very reasonable also. Will definitely come here again. 😊",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "Madison Whiting",
    location: "Bella Vista",
    text: "The food here is SOOOOO yummy! Haven't had something that we didn't like! The service is great too! We love eating here",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Ozzy Baldwin",
    location: "Bella Vista",
    text: "This place is hands down my favorite Mexican restaurant. The service is always nice even when they're busy. Roadside Tacos are so good. And don't pass up the Street Tacos either! Also get the strawberry cheesecake chichanga and thank me later!",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Ronda Wiltfong",
    location: "Bella Vista",
    text: "this place was the greatest place of el pueblitos that I've eaten in years the waiters and waitresses were so kind, understanding, and were there for you at all times. The restaurant itself was beautiful, the designs were great, and colorful. everyone seemed to be having a great time laughing and doing their thing. The atmosphere was calm and cheerful. I will be back there real soon.",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "Naomi Irene Zammit",
    location: "Bella Vista",
    text: "This was a fanstastic gem I found in Bella Vista and just minutes from my home. The staff there are all so sweet and accommodating. The food is just delicious! I try something new every time I go, however the Choriqueso and the Chicken Quesadilla is a constant! The quesadilla is so full of cheese and meat, it's almost like a burrito! I would absolutely recommend this place to any hungry person! Oh yeah, and the price is super affordable.",
    source: "Google",
    date: "2023-08-01",
  },
  {
    name: "Sam Davis",
    location: "Bella Vista",
    text: "This is the BEST Mexican restaurant in Bella Vista! Clean, staff is friendly and fast, and the food is great! Their Steven Special is loaded with meat, no one beats it!",
    source: "Google",
    date: "2023-08-01",
  },
  {
    name: "Tony M.",
    location: "Bella Vista",
    text: "This place is great. Their food is treated to leave an impression and to having you walking out satisfied. This is definitely now my favorite Mexican restaurant. Well done folks!",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Neil Lambert",
    location: "Bella Vista",
    text: "We eat here 2-3 times a month and have never had a bad experience. Stopped in before I had to work today slightly pressed for time. 20 minutes start to finish, with great food as usual. Staff is always friendly and fast.",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "TJ",
    location: "Bella Vista",
    text: "In from out of town and enjoyed the best mex food in the area. Staff was very friendly and service was fast. Recommend the Burrito Fajita and Street Tacos -steak with cilantro n onion!",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Tim Elliott",
    location: "Bella Vista",
    text: "Really good food and a nice atmosphere. The service was fast and friendly and an endless supply of chips and really good salsa. The nacho plate was in the top ten for me with more than a enough food, I didn't leave hungry.",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "David Carlton",
    location: "Bella Vista",
    text: "I've been eaten at El Pueblito for years. Bella Vista and Centerton locations. One of the best mexican restaurants around! Hands down! If you enjoy Al Pastor? Their's will melt in your mouth. Street Taco's? Truly amazing! Everything they offer is fantastic!",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Jason Hudsonpillar",
    location: "Bella Vista",
    text: "We love this place. Food is great. Salsa is great. Staff is great. And, the manager running the place is amazing. He is extremely customer oriented and his passion to serve is ver apparent. Highly recommend visiting El Pueblito, Bella Vista.",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "Kyle Hacker",
    location: "Bella Vista",
    text: "Wonderful food at an amazing price!! The servers were all very friendly. The portions were very generous. I had never had a spinach enchilada before but I was very pleasantly surprised.",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "Jai Henson",
    location: "Bella Vista",
    text: "Fantastic food. The El Toro was the best! Great service. My new favorite Mexican food restaurant 😋",
    source: "Google",
    date: "2023-08-01",
  },
  {
    name: "Shanna Sells",
    location: "Bella Vista",
    text: "Seriously the BEST Mexican good I've had in NWA!! The place was packed, so I was a bit concerned about staying to eat, but the food was worth the wait!! I'll do it again next time I'm in the area! It is a must try for everyone!!",
    source: "Google",
    date: "2020-08-01",
  },
  {
    name: "Nancie Carter",
    location: "Bella Vista",
    text: "Had lunch here yesterday. As always, great food and fast service. Would recommend to anyone looking for great food and good prices. Mario is always quick to remember his returning customers and gives top notch service to everyone.",
    source: "Google",
    date: "2017-08-01",
  },
  {
    name: "David Hudak",
    location: "Bella Vista",
    text: "We always enjoy our experience here. The food and service are always great. Never had a bad meal at El Pueblito and the prices will not break the budget! We love dining here.",
    source: "Google",
    date: "2019-08-01",
  },
  {
    name: "Liz Bassler",
    location: "Bella Vista",
    text: "Great atmosphere wonderful food and it's very decent price. Some of the best homemade salsa around for sure!",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "Lisa Rose",
    location: "Bella Vista",
    text: "Incredibly flavorful food and everything I have eaten has been wonderful. Everyone I have taken with me will wholeheartedly agree. Amazing food/drinks and great prices.",
    source: "Google",
    date: "2020-08-01",
  },
  {
    name: "Louis Schilberg",
    location: "Bella Vista",
    text: "Absolutely one of my favorite Hispanic restaurants I've eaten at in the last few years! Extremely friendly service, amazing chips and salsa, and great food that they make a lightning speeds. I highly recommend this place.",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Elizabeth Ferrari",
    location: "Bella Vista",
    text: "Delicious food, great prices and friendly staff. My family and I come here regularly and always get the best service. Our go to Bella Vista restaurant.",
    source: "Google",
    date: "2020-08-01",
  },
  {
    name: "peggy murray",
    location: "Bella Vista",
    text: "Great food, great service. This restaurant is clean and the staff is excellent. We highly recommend it.",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Jef Curlin",
    location: "Bella Vista",
    text: "Our favorite Mexican food place and, bonus, it's only 2-3 miles from where we live. Everything I've had there is good, but I'm especially fond of their Enchiladas Razorback, 3 cheese enchiladas topped with a delicious, tender, spicy pork.",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "James Thompson",
    location: "Bella Vista",
    text: "Very huge amounts of mild Tex-Mex style food served up fast at very reasonable prices. Been there three times now. Nothing to complain about and I can usually find something.",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Ralph Raugust",
    location: "Bella Vista",
    text: "Always good food, fast service. Food is authentic Sonoran Mexican style with some unique dishes from elsewhere in Mexico. Everyone I know has been able to find a “favorite”.",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "dj watts",
    location: "Bella Vista",
    text: "The food was excellent. Service was great. We will eat here again.",
    source: "Google",
    date: "2020-08-01",
  },
  {
    name: "Stephen Bailey",
    location: "Bella Vista",
    text: "Went in about 3pm. Food was great! The chili relleño was the best I've had in years. The service was beautiful! Could not have been better! Thank you",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Phyllis Pirolo",
    location: "Bella Vista",
    text: "Food is consistently great at this restaurant and the wait staff always seems to be happy to see and serve you",
    source: "Google",
    date: "2023-09-01",
  },
  {
    name: "Mary Middleton",
    location: "Bella Vista",
    text: "Plenty of great food at reasonable prices along with a full bar; many local's favorite place to eat. Family owned and operated, they all provide friendly customer service - even when real busy, wait is never long. You can also call in and order take out. The menu has a variety and spice level of dishes.",
    source: "Google",
    date: "2014-08-01",
  },
  {
    name: "Shannon",
    location: "Bella Vista",
    text: "Food and service is great. Have always had a good time.",
    source: "Google",
    date: "2023-08-01",
  },
  {
    name: "Sharon Butcher",
    location: "Bella Vista",
    text: "El Pueblito was a wonderful experience. Yum I had Spinach Enchiladas and rice and beans. Waiter was kind, nice and polite.",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Shelle Wood",
    location: "Bella Vista",
    text: "The Emily Chicken was awesome! Great service too.",
    source: "Google",
    date: "2023-11-01",
  },
  {
    name: "Camie Corbino",
    location: "Bella Vista",
    text: "Delicious food and fantastic service! Try the El Toro if you like stuffed spicy chilies. It's one of my favorite dishes.",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Julie Hull",
    location: "Bella Vista",
    text: "Great service and atmosphere! Most importantly - Food is made to order, fresh, hot, and full of yummy goodness! When asked about a must stop at restaurant - I always recommend El. Pueblito!",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Shelby M",
    location: "Bella Vista",
    text: "Everything tasted SO SO good!!! The salsa was super flavorful, chips were perfect, our entrees super, and the drinks great! Will definitely come here again.",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Sand D",
    location: "Bella Vista",
    text: "This is the best Mexican restaurant around. I live in the Rogers area and I drive when I'm hungry for Mexican food. Great service! They make the food just the way you order it!",
    source: "Google",
    date: "2019-08-01",
  },
  {
    name: "Jiggy Puff",
    location: "Bella Vista",
    text: "Got the hugest tastiest portions! Friendly too",
    source: "Google",
    date: "2023-12-01",
  },
  {
    name: "Thomas Tuttass",
    location: "Bella Vista",
    text: "Very great place! Nice people, delicious food, reasonable prices... what else do you want? The Fajita Hawaii was unusual but very good.",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Paul Wilson",
    location: "Bella Vista",
    text: "Great service, speed and quality of food. Prices are very reasonable. We pass a number of other Latino restaurants to come to El Pueblito, and it's worth it every time.",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Brenda Callahan",
    location: "Bella Vista",
    text: "The food is cooked fresh to order and it's always delicious! The wait staff is quick and always courteous. The restaurant is always clean. We love El Pueblito!",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Gary McCarty",
    location: "Bella Vista",
    text: "Had the Burrito California today. It was excellent and HUGE! Only finished half of it and brought the rest home for later. First time I'd had this dish at El Pueb - might be the best around here!",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "John Kidd",
    location: "Bella Vista",
    text: "Our favorite Mexican restaurant in Bella Vista! Shrimp dishes are particularly well done; fajitas are excellent! The Quesadilla Camarones are our favorite dish, nicely presented. Great food, great service, reasonably priced.",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Cesar Torres",
    location: "Bella Vista",
    text: "Best damn Mexican restaurant in the NWA. I want to tell you, you got to seriously try this place! Best Carne Asada, Cheese Dip, tacos, burritos, fajita and quesadillas that make maravillas!! People are super attentive to your order! Agustin the restaurant manager is outstanding person. He leads that restaurant with a passion!",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "Julie Fitzpatrick",
    location: "Bella Vista",
    text: "The service was outstanding and the food was delicious!",
    source: "Google",
    date: "2023-09-01",
  },
  {
    name: "Amy Thiele",
    location: "Bella Vista",
    text: "They were very busy but the staff still had a great attitude. The service was impeccable and the food was delicious!",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Em Colston",
    location: "Bella Vista",
    text: "Great food, good prices & friendly staff. One of our favorite places to eat!",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Circus Golfer",
    location: "Bella Vista",
    text: "Best Mexican restaurant I have had in the whole four state area! Bar none! Everything wuz fresh and awesome service. My family will definitely be back and we're an hour travel time there!",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Clinton Welch",
    location: "Bella Vista",
    text: "My wife really loves this place and the prices don't seem to have gone up much unlike most all the other restaurants.",
    source: "Google",
    date: "2023-09-01",
  },
  {
    name: "Stacy Anazagasty",
    location: "Bella Vista",
    text: "We love it here. Always great food and wonderful atmosphere",
    source: "Google",
    date: "2023-08-01",
  },
  {
    name: "L E R I U M",
    location: "Bella Vista",
    text: "I come here all of the time. Love their chips and salsa. They have very friendly service. The food is the best Mexican food around!",
    source: "Google",
    date: "2016-08-01",
  },
  {
    name: "Cesar Torres",
    location: "Centerton",
    text: "There's always awesome food and friendly people here. They really make you feel at home! The chile relleno was amazing—so delicious! Definitely hit this place up when you're in Centerton!",
    source: "Google",
    date: "2024-03-01",
  },
  {
    name: "Ryan Barber",
    location: "Centerton",
    text: "We live in Centerton and I kept meaning to stop here. Tonight was the night, and what a great choice it was! The food was excellent, the service was impeccable, and the price was great, too. I had Street Tacos, my wife had Carnitas, and the kids got quesadillas with rice and beans. We decided to splurge by getting Fried Ice Cream and dessert nachos to finish out our meal and all that food worked out to be less than $20 a head. Drink refills were plenty, the street tacos were legitimately the best tacos I've ever had from a restaurant (I tried the carnitas as well, and it was SO good), and the staff was all kind, courteous, prompt, and thorough. The place was packed, and I can understand why! Absolutely will be back!",
    source: "Google",
    date: "2024-01-01",
  },
  {
    name: "Rinku Master",
    location: "Centerton",
    text: "Food portions are good size. Food and drink menu is good too. Friendly, courteous and attentive staff. Staff is accommodating as well. Love their homemade spicy salsa which you have to ask for with chips and salsa. If you like spicy ask for roasted whole jalapeño and extra crispy fried onions to have with your dishes, chips and salsa.",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Bruce K.",
    location: "Centerton",
    text: "Staying on a keto diet at a Mexican restaurant can be a challenge but I did okay by not going deep into the chips and salsa. That was tough because the chips were pretty darned awesome — just the right thickness and salt...the salsa was not too wet. I chose the carne asada as my main, skipping the tortillas and getting extra salad instead of rice and beans. A really good portion of thin skirt steak, seasoned nicely. Delicious and very filling! A clean restaurant with great service. I'm really glad my friend picked this one!",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Santosh Kotyankar",
    location: "Centerton",
    text: "My favorite Mexican restaurant in Northwest Arkansas. The food is tasty and the serving sizes are very generous! The staff is humble and serves up patrons pretty quickly. The second best thing after the tasty food here is the price! Tasty food with generous portions at a very affordable price!",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Rabidbear Spirit",
    location: "Centerton",
    text: "Got off work late - they were the only Mexican open until 10, and boy did their team deliver. One heck of a magnificent feast, and some of the best prices around.",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Malcolm Landrum",
    location: "Centerton",
    text: "Love this place. Travel from Texas to visit my grandchildren every month or so. The second best thing about coming to Centerton is this place. Better than any Mexican food in Texas or when I travel around the country for work.",
    source: "Google",
    date: "2024-06-01",
  },
  {
    name: "Mattress Clearance Center of NWA",
    location: "Centerton",
    text: "The best Mexican food in NorthWest Arkansas! We love this place so much, that we order it almost daily. The owners are absolutely incredible and the staff is unmatched. The food is so incredible!",
    source: "Google",
    date: "2024-03-01",
  },
  {
    name: "Billie Jean Windel",
    location: "Centerton",
    text: "This is one of my favorite Mexican restaurants. They have really good chips and salsa, the food is phenomenal, plus the margaritas are always on point.",
    source: "Google",
    date: "2024-03-01",
  },
  {
    name: "Susy Reyes",
    location: "Centerton",
    text: "We had a Family Group about 11 of us, and plenty of Food served. The price of the food for the BIG AMOUNT is AWESOME. WE'RE HAPPY CAMPER.",
    source: "Google",
    date: "2018-01-01",
  },
  {
    name: "Oscar Neuville",
    location: "Centerton",
    text: "We celebrated a birthday here and it was superb... service was great as well as food and drinks... 100% recommended.",
    source: "Google",
    date: "2024-04-01",
  },
  {
    name: "Bernadette Secrest",
    location: "Centerton",
    text: "Very sweet & polite staff. We had the Wally Special which you can get with either flour or corn tortillas - excellent! They were not serving pitchers of margaritas, so we got a large and a 'monster' size margarita...you will get drunk. ALSO, I appreciated that masks were required and that the restrooms were clean. I will be back to try more menu items!",
    source: "Google",
    date: "2020-01-01",
  },
  {
    name: "Joel McEwan",
    location: "Centerton",
    text: "Our new go to Mexican restaurant we've been there about 7 times. There are a few locations we've been to the one on Beaver lake successfully a few times also. Monday through Friday they have fajitas for lunch $11.99. the salsa and the chips are very fresh. Very quick delivery of food and service.",
    source: "Google",
    date: "2023-07-01",
  },
  {
    name: "Nicholas Jones",
    location: "Centerton",
    text: "By far my favorite Mexican restaurant in the area and I'm stoked it's just right down the road. I highly recommend the Burrito California...AMAZING!",
    source: "Google",
    date: "2018-01-01",
  },
  {
    name: "Teresa Marie",
    location: "Centerton",
    text: "I love going here with my hubby, they have so many options you can choose from.",
    source: "Google",
    date: "2024-05-01",
  },
  {
    name: "IL James",
    location: "Centerton",
    text: "Six of us celebrating a birthday enjoy delicious food including Emily special, Steven special, California burrito, chimichanga, Hawaiian fajitas, and enchiladas. The food was fresh and hot with a lovely presentation and tasted delicious!",
    source: "Google",
    date: "2023-07-01",
  },
  {
    name: "Timothy Adams Jr",
    location: "Centerton",
    text: "Very nice restaurant! Great menu selections with decent pricing! Food came hot and was very good! Future visits a must!",
    source: "Google",
    date: "2022-01-01",
  },
  {
    name: "Jarret Miller",
    location: "Centerton",
    text: "From the moment my family and I walked into El Pueblito Mexican Restaurant in Centerton for a Cinco de Mayo celebration, it was clear we were in for a treat. Despite the bustling weekend crowd, the atmosphere was inviting, and the staff handled everything with remarkable efficiency and professionalism. The star of my meal was definitely the Fajita Tacos. Packed with flavorful, sizzling meats and just the right blend of spices and fresh toppings, each bite was a delightful experience. My daughter opted for the California Burrito, and it was a hit—stuffed with a generous amount of ingredients, making it both tasty and satisfying. What truly set our dining experience apart were the mixed drinks and margaritas. Each was expertly mixed, boasting bold flavors that complemented our meals perfectly. The margaritas, in particular, were a standout, striking the ideal balance between tequila and fresh lime, rimmed with just enough salt. Despite having a large party, the service was quick and never skipped a beat. The waitstaff was attentive without being intrusive, ensuring our glasses were never empty and all our dining needs were met promptly. Their ability to maintain such high standards on a busy holiday was impressive. El Pueblito's commitment to quality food and exceptional service makes it a top choice in Centerton. Whether you’re craving authentic Mexican fare or just a place to unwind with a great drink, this restaurant promises a memorable dining experience. Hats off to the entire team for making our visit especially enjoyable!",
    source: "Google",
    date: "2023-05-01",
  },
  {
    name: "Kristy Antonacci",
    location: "Centerton",
    text: "One of the best Mexican food places around here. Nice staff, good prices, large portions. Great top shelf margaritas.",
    source: "Google",
    date: "2018-01-01",
  },
  {
    name: "Michael Harris",
    location: "Centerton",
    text: "Had a lunch business meeting. Service was quick and pleasant. Each of us (3) chose the special of the day. The burrito was cooked to perfection and presentation was very nice. Taste was excellent and I am not a real mexican food fan. Great place for a quick and tasty meal.",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Doug Thompson",
    location: "Centerton",
    text: "Fast Service, lip smacking food and it's good. If you like Mexican food or Tex-Mex this place is good. It's not too expensive at all so in this economy, it rocks!! Dude, try the cheese dip!!!!",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Anne Turner",
    location: "Centerton",
    text: "My favorite place to eat! Never disappointed with there food, service and atmosphere. It's the best!",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Bdg Vang",
    location: "Centerton",
    text: "Great deals! Good food! Drinks and meals comes out fast especially on a busy hour for most places. Really great service from start to finish! Enjoy coming here for the last 4yrs!",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Skyler Eagle",
    location: "Centerton",
    text: "Very fast and diligent service, polite and considerate staff. The food came out quickly and was still steaming hot, smelt and tasted delicious. Would definitely recommend and will be back again, 10/10!",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Sylvia Smith",
    location: "Centerton",
    text: "I was craving some good Mexican food and I am so glad we went here. The food was delicious. My extremely picky daughter also loved her food, she loved the Stevens special and chicken nachos. The hubs, whom is also picky said the pollo loco was amazing. We will definitely be making this place a regular!",
    source: "Google",
    date: "2022-06-01",
  },
  {
    name: "Justin Worrell",
    location: "Centerton",
    text: "First off, the employees were very friendly and the atmosphere was clean and relaxing. My son and I ordered the chorizo queso and both agreed it was the best we’ve ever had. (We eat a lot of chorizo queso at multiple restaurants). We ordered the chori pollo meal and it was equally as delicious. Absolutely will be back!!",
    source: "Google",
    date: "2022-06-01",
  },
  {
    name: "Jon Rustad",
    location: "Centerton",
    text: "Always great Mexican food and in person dining experience!",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Nick Nichols",
    location: "Centerton",
    text: "This is a solid Mexican restaurant with good food and friendly service. We always feel at home with the familiar smiles and the warm welcomes. If you are looking for a good clean Mexican restaurant experience, this is your place.",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Jonathan Sasse",
    location: "Centerton",
    text: "So far, this place has been excellent on nearly everything we've tried.\n\nGreat burritos, great nachos, the carne asada fries were completely on point and the salsa is great, too!\n\nHighly recommend, ESPECIALLY if you're an out of towner and want a truly good Mexican fix.",
    source: "Google",
    date: "2022-06-01",
  },
  {
    name: "Ráhel Barr",
    location: "Centerton",
    text: "This place is never empty and it’s for good reason! The food is sooooo good and the servers are always friendly and helpful. The menu is big but simple, and it’s easy to find something you’ll love. I’ve never had a bad time coming here! :)",
    source: "Google",
    date: "2022-06-01",
  },
  {
    name: "Juan Mora",
    location: "Centerton",
    text: "Large variety of amazing food! We had the Pollo El Pueblito and an El Toro, phenomenal! Very prompt service, staff is very friendly, and wait time were minimal despite it being a Friday evening. Also, many delicious drinks to chose from, highly recommend!",
    source: "Google",
    date: "2020-06-01",
  },
  {
    name: "itsjst biz itsjstbiz",
    location: "Centerton",
    text: "Enjoyed my visit here. Great spot for lunch. Great menu selections, food was fresh and excellent flavor. Nice atmosphere. Clean and plenty of seating. Also nice patio dining area. Definitely recommend",
    source: "Google",
    date: "2021-06-01",
  },
  {
    name: "Karl Kreulach",
    location: "Centerton",
    text: "The food is very good, and the proportions are very generous. The service staff is always fast, polite and professional. And the manager, Andres is absolutely magical. And if you happen to be lucky enough to eat there during the week where Mario is cooking, it's even better.",
    source: "Google",
    date: "2019-06-01",
  },
  {
    name: "Kara Koontz",
    location: "Centerton",
    text: "Every time I have been here the staff has been friendly and polite. The delicious food arrives in good time and our drinks are always full. When speaking to us the waiters/waitress seem genuine in their concern that we are enjoying ourselves, and have a friendly, inviting demeanor that makes you want to sit and chat with them.\n\nI will definitely continue going here whenever possible.",
    source: "Google",
    date: "2018-06-01",
  },
  {
    name: "Austin Cirincione",
    location: "Centerton",
    text: "By far the best Mexican food I've had around especially for the prices. Fresh delicious salsa everytime! Fresh chips still warm and crunchy. The food is just amazing! I've been to both locations and NEVER been disappointed. If you want Great mexican food and great prices go here! It's just fantastic.",
    source: "Google",
    date: "2019-06-01",
  },
  {
    name: "Kevin Usery",
    location: "Centerton",
    text: "Jose gave us excellent service, were seated quickly and requested our drinks quickly. Food was very delicious, and as this was our first time here, we were very pleased and will be returning! Wait staff were very prompt and friendly! Restaurant is clean and has a fun atmosphere.",
    source: "Google",
    date: "2018-06-01",
  },
  {
    name: "Erin Polack",
    location: "Centerton",
    text: "Came in a family 6 at 9:20 they close at 10:00. We got our drinks, and our food by 9:40. To me that is great service. Never had to ask for our drinks to be filled, the waiter was awesome! Great place to eat!",
    source: "Google",
    date: "2019-06-01",
  },
  {
    name: "Melissa Coffee",
    location: "Centerton",
    text: "Great cheese dip. Loved the texture of their chips. Salsa is a little spicy, delicious 😋",
    source: "Google",
    date: "2023-01-01",
  },
  {
    name: "Hank Fuller",
    location: "Centerton",
    text: "Very nice neighborhood eatery. Staff is all smiles and good at their jobs. We had chicken tacos and chili Colorado. Both excellent dishes. Meal comes with chips and salsa. We'll be back!😊😊😊😃😃",
    source: "Google",
    date: "2021-04-01",
  },
  {
    name: "Michael Shaver",
    location: "Centerton",
    text: "Can't say enough about how much I love a good Steven's Special. Very tasty. Great service. You can even order large family packs for a great price too.",
    source: "Google",
    date: "2021-03-01",
  },
  {
    name: "Bailey Alexander",
    location: "Centerton",
    text: "This is my favorite Mexican food place in NWA. Both their Centerton and Bella Vista locations are some go to’s for my family!!",
    source: "Google",
    date: "2023-01-01",
  },
  {
    name: "FrAnC mErCaDo",
    location: "Centerton",
    text: "OMG! Moved to NWA 5 years ago...I wish I had discovered this place before. The food is the best Mexican food I've had recently. I had the steak Burrito Fajita while my wife had the Steak Carnitas...wow!!! The chips and salsa, loved them...I could have these alone! Staff is super kind, and the prices are reasonable. There are so many options to choose from that we will be back to try'em for sure!",
    source: "Google",
    date: "2022-06-01",
  },
  {
    name: "K. M",
    location: "Centerton",
    text: "Very good food. So exciting the Centerton has this relatively new addition to its food offerings. Food here is incredibly good. The chimichanga is one of my favorites around. Always friendly service and they run a good business. Glad they were able to procure their liquor license and have become part of the community.",
    source: "Google",
    date: "2018-10-01",
  },
  {
    name: "Lettie Maguire",
    location: "Centerton",
    text: "A great family owned restaurant. Very good food that is well priced. This is one of our consistent 'go to' places.",
    source: "Google",
    date: "2023-01-01",
  },
  {
    name: "Michael Gifford",
    location: "Centerton",
    text: "My family and I love this place. Fantastic food and service. Possibly the quickest restaurant I've ever ate at. They get the food to you quick, but never make you feel rushed at all. Kick back and relax. Centerton has needed a restaurant like this and thank goodness it is here!",
    source: "Google",
    date: "2019-03-01",
  },
  {
    name: "Brandee Spears",
    location: "Centerton",
    text: "The food is super fresh and delicious. Best salsa in the area. The service was great. We didn't have to wait long for anything. My husband and I had dinner for less than $20!",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Gail Cabot",
    location: "Centerton",
    text: "Excellent food. GREAT service!",
    source: "Google",
    date: "2022-10-01",
  },
  {
    name: "Joseph Clenney",
    location: "Centerton",
    text: "My FAVORITE Mexican joint by far. Awesome food, awesome service. Diverse menu, Authentic Mexican food, Tex-Mex, and Americanized options too. Kids menu, lunch specials, drink specials! It’s delicious!!! I recommend the fajitas, the chorri pollo, and the Emily special!",
    source: "Google",
    date: "2021-06-01",
  },
  {
    name: "Tam Tam",
    location: "Centerton",
    text: "Every time I come in here it's pleasant. Nice sneak away spot.",
    source: "Google",
    date: "2018-04-01",
  },
  {
    name: "Ashley Wieneke",
    location: "Centerton",
    text: "We have been sleeping on this place! We were craving some carnitas tacos so placed a pickup order quick, and WOW! These are probably the best ones we’ve had in NWA. Definitely recommend!",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Lacey Clawson",
    location: "Centerton",
    text: "I love everything about this restaurant. Awesome, always fresh food, and the service and servers are just as helpful with takeout as dine in! The best hidden gem between Centerton and Fayetteville for Mexican, in my opinion 💖",
    source: "Google",
    date: "2021-08-01",
  },
  {
    name: "James Hall",
    location: "Centerton",
    text: "Best Mexican food I’ve had around northwest arkansas. Quality of food is great and it’s always consistent. Their food never tastes like it’s been frozen and microwaved. Ingredients always seem fresh.",
    source: "Google",
    date: "2021-08-01",
  },
  {
    name: "Kimberly Lytle",
    location: "Centerton",
    text: "My order of Seafood Fajitas were supurb! The corn tortillas were soft & warm, the veggies were perfect with the shrimp, crab, etc. My refried beans were so delicious, especially with their pico! Guacamole, sour cream & rice rounded out my meal. The 16 oz Peach Margarita on the rocks made everything taste even better! Their chips and salsa had so much flavor.",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Chrisnlisa",
    location: "Centerton",
    text: "Food was hot and service was quick. Lime margaritas on the rocks will knock your socks off.",
    source: "Google",
    date: "2018-10-01",
  },
  {
    name: "Molly Mahmens",
    location: "Centerton",
    text: "Wider choice of delicious foods on a menu than in some other Mexican cuisine places. Good service and affordable pricing. I like their bar area, pretty cozy.",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Lynn Hahn",
    location: "Centerton",
    text: "My first time at this Mexican restaurant, and it was a very good experience. I loved the chips and salsa, as well as the chicken chimichanga. Service and atmosphere was superior. Will definitely eat there again.",
    source: "Google",
    date: "2021-08-01",
  },
  {
    name: "Sandy Williams",
    location: "Centerton",
    text: "Excellent Long Island Tea. Portions of food are large. Wait staff attentive and friendly. Been going here since they opened. Can't wait for warmer weather so I can enjoy the patio.",
    source: "Google",
    date: "2021-06-01",
  },
  {
    name: "Mia Buckman",
    location: "Centerton",
    text: "Always quick to get us our food and server always keeps our drinks and chips full! I live on the opposite side of bentonville and will ALWAYS choose to drive out to Centerton to eat at my favorite Mexican restaurant. You guys are the best!",
    source: "Google",
    date: "2020-09-01",
  },
  {
    name: "Steven Swope",
    location: "Centerton",
    text: "Nice place, great service and the food was great. We will visit again when we're back in NWA.",
    source: "Google",
    date: "2023-10-01",
  },
  {
    name: "Tina Goforth",
    location: "Centerton",
    text: "Couldn't be more pleased. We used to drive to Bella Vista to eat, now we don't have to. Delicious! Be brave and try their hot salsa, you'll be glad you did.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Erin Flettre",
    location: "Centerton",
    text: "Best Mexican food I’ve had in a while!! Staff was super friendly & accommodating. Service was fast, and food was fresh! I think i found my new favorite restaurant.",
    source: "Google",
    date: "2017-08-01",
  },
  {
    name: "William B",
    location: "Centerton",
    text: "This is my favorite restaurant to eat at the food is always good and excellent service each time I go.",
    source: "Google",
    date: "2023-03-01",
  },
  {
    name: "Michelle Howard",
    location: "Centerton",
    text: "Delicious, fresh food. Great service, chip bowl refilled, drinks in huge glasses no need for refills, always smiling. Clean restaurant tables and chairs.",
    source: "Google",
    date: "2021-06-01",
  },
  {
    name: "Michelle L",
    location: "Centerton",
    text: "The food is always good. The servers are quick and friendly. We've been here multiple times as a family and never had a bad experience.",
    source: "Google",
    date: "2017-06-01",
  },
  {
    name: "Dennis Lee",
    location: "Centerton",
    text: "I have eaten here a couple of times now. The food and service has been great everytime. Very rare to find a restaurant that is consistently very good each visit.",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Madilynn Clark",
    location: "Centerton",
    text: "The food is amazing and the service is phenomenal. They get what you need in a timely matter and they have the best spicy salsa ever. I love this place.",
    source: "Google",
    date: "2017-07-01",
  },
  // {
  //   name: "Ben Baker",
  //   location: "Centerton",
  //   text: "Just great, cheap Mexican food!",
  //   source: "Google",
  //   date: "2023-02-01",
  // },
  {
    name: "Alecia Trentham",
    location: "Centerton",
    text: "What you need to know about this place of business... Is the excellent service, Hometown feel, excellent fresh fast food. An unforgettable waiters and waitresses! Will definitely be returning.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Lynne Campo",
    location: "Centerton",
    text: "Great chili rellenos! Oh and great chimichanga! And my daughter said her flautas were great too! So basically El Plueblito’s has great Mexican food! Seriously though, we did order a large variety of food, sampling taco, cheese and guacamole dips, tacos, tostadas, beef and cheese enchiladas, ground beef chimichangas, flautas, beans and rice. Every bit was fantastic. We got our food to go and they gave us a large bag of chips and salsa to go also. HIGHLY recommend! The prices are reasonable as well.",
    source: "Google",
    date: "2021-06-01",
  },
  {
    name: "Joy McDonner",
    location: "Centerton",
    text: "We had a great experience, fantastic food, and loved it! Thank you for great food.",
    source: "Google",
    date: "2023-03-01",
  },
  {
    name: "Kerrie Lenkerd",
    location: "Centerton",
    text: "The food is plentiful and affordable. The staff is amazing! They make us feel like family. It is my favorite place to eat out!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "nunya b",
    location: "Centerton",
    text: "I liked the place. The chili reléno was not frozen which is in itself exceptional. Good food. Pleasant service. I highly recommend that you give them a try.",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Les Desavedo",
    location: "Centerton",
    text: "We love this place!! Food is amazing and the staff is so friendly. I can't wait for the weather to get nice so we can sit out on the patio. Thank you for coming to Centerton!!",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Wesley Robinson",
    location: "Centerton",
    text: "Just look at the crowds. There's a reason it's so ding dang popular. Good value too!",
    source: "Google",
    date: "2023-10-01",
  },
  {
    name: "Michael 'Reed' Brooks (MReedB)",
    location: "Centerton",
    text: "I love the place. The staff love their place, and it shows. Good for families, business people, working lunches. Great bar area. Outside cafe. Great lunch specials. Awesome drinks. I relax here!",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "Jordan Karasek",
    location: "Centerton",
    text: "Great food, great place! Family loves visiting here. I ordered takeout for 3, when I showed up, it was ready in like 8 minutes!",
    source: "Google",
    date: "2019-08-01",
  },
  {
    name: "Matt Bolding",
    location: "Centerton",
    text: "From coastal Mexican to Border Town Mexican , this place has it. Everyone got a bit of something different and it was all great. Very friendly staff as well. MUST order the bean dip with your chips. Unique and everyone loved it as well.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Chan Davis",
    location: "Centerton",
    text: "Yolanda was a super sweet server. Pleasant personality and great smile. Good food. Glad to have you guys across the street!",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Susy Reyes",
    location: "Centerton",
    text: "The food was awesome, and they served lot of food. Service was quick too. Rodrigo was our waitress and he was amazing! He served us with respect and high manners.",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "Whitney Bowen",
    location: "Centerton",
    text: "Delicious food and nice staff. Our favorite menu item is the Steven special. You can’t go wrong with anything you order here honestly. This is our go to restaurant on the weekend.",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "Calvin Greenway",
    location: "Centerton",
    text: "Absoutely the best! I eat here at least once a week. Cheap and amazing! Never screwed up a single order. Best Mexican around.",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "Jimmy Cline",
    location: "Centerton",
    text: "$31 for three kids and two adults at lunch! Tea was only $1.98! And you get enough to eat. Salsa was pretty good too.",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "John Resig",
    location: "Centerton",
    text: "This is a great place to grab a quick lunch. I always go here to grab a lunch with my friends. No matter what kind of conversation I am having at lunch this is the place I want to go. Everyone always walks out happy, full, and satisfied.",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Colin C",
    location: "Centerton",
    text: "Great food, great prices, great atmosphere. Wife and I went there for lunch and the food was amazing, they brought it out quickly. Will be going back.",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Elverna Pollard",
    location: "Centerton",
    text: "Best Mexican food I’ve had in NWA so far.",
    source: "Google",
    date: "2023-10-01",
  },
  {
    name: "Brandon Banks",
    location: "Centerton",
    text: "Great service. They specially made me a grilled chicken burrito when I learned that their meats are cooked with onion (I'm allergic).",
    source: "Google",
    date: "2022-06-01",
  },
  {
    name: "Traveling Hope",
    location: "Centerton",
    text: "Amazing food at great prices! We come at least weekly. Very consistent - always great! Great customer service!",
    source: "Google",
    date: "2023-09-01",
  },
  {
    name: "Dawn Carson",
    location: "Centerton",
    text: "Was very good! The staff was so nice and the portion sizes were great for the prices! Will definitely go back!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Steven Forbes",
    location: "Centerton",
    text: "Wonderful food and great service even though it was super busy. Highly recommend it, fajita steak chimichanga is wonderful.",
    source: "Google",
    date: "2021-08-01",
  },
  {
    name: "Josh Garrison",
    location: "Centerton",
    text: "Great Mexican place located in centerton one of the only places I can find with Carne asada fries that I miss soo much from San Diego! Very reasonably priced which is a huge plus nowadays.",
    source: "Google",
    date: "2022-09-01",
  },
  {
    name: "Ashton Wyatt",
    location: "Centerton",
    text: "Didn’t think I’d find a Mexican restaurant that could compare to la Chiquita in Russellville, but after eating here I can say for certain that it is it’s equal or better. Just great food at well deserved prices and fast service makes this a top notch place to eat.",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Bolding Matt",
    location: "Centerton",
    text: "This is not your typical Border style Mexican, although 'traditional' Mexican can still be found. Lots of seafood, skirt steaks, and if you're eating healthy like I am, you can get all kinds of options. The bean dip is a must have appetizer, it's not your typical bean dip either.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Stan Gover",
    location: "Centerton",
    text: "Really liked this place, it's a bit different then the Las Palmas/La Huerta/Mojitos family and it was refreshing to see some different offerings. I had the enchiladas razorback and it was amazing. I will definitely be back.",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Daniel Hanson",
    location: "Centerton",
    text: "Great food for the price. Friendly staff.",
    source: "Google",
    date: "2023-10-01",
  },
  {
    name: "Glenda Stowers",
    location: "Centerton",
    text: "Great food and large portions. Got seated quick and food came real quick. We will definitely be going back.",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Felicia Mendez",
    location: "Centerton",
    text: "Yum Yum Yum!!! I have only been there once, but what I did eat was very good. Good service and I will be going there more.",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Rebecca Rice",
    location: "Centerton",
    text: "This is the most delicious michelada, margarita and pollo con crema I've ever tasted. Yum!",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Michael McAlexander",
    location: "Centerton",
    text: "Tried El Pueblito today for lunch; never had the one in Bella Vista. Great flavor; very different from El Farolito. Had a Burrito Verde, and my better half tried the Carnitas. Great food and flavor; will be back sometime.",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Em Lou",
    location: "Centerton",
    text: "Switched from our usual to this restaurant and we were really happy with the flavor and quality of our food, the staff and the overall experience! We will stick with these guys!",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Bart Beason",
    location: "Centerton",
    text: "The best place to eat in the area! Hands down! Friendly staff excellent management!!!! Fast service and food is excellent!!!!!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Audra Lowery",
    location: "Centerton",
    text: "Very accommodating and delicious. The quesadilla rellena reminded me of a long since closed place from back home.",
    source: "Google",
    date: "2023-03-01",
  },
  {
    name: "Judith Rodriguez",
    location: "Centerton",
    text: "I'm from Austin, TX and have access to great Mexican food all the time. I LOVE El Pueblito and eat there whenever I'm in the area. Try the Enchiladas Potosinas.",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Sharelle Robertson",
    location: "Centerton",
    text: "Great place for authentic Mexican food in NWA. The service was great and the food was fresh and hot!",
    source: "Google",
    date: "2023-03-01",
  },
  {
    name: "Isaac Badgerow",
    location: "Centerton",
    text: "Best Mexican food I've had since I left Denver.",
    source: "Google",
    date: "2023-03-01",
  },
  {
    name: "Kurt Southworth",
    location: "Centerton",
    text: "Had a very nice lunch with my son and granddaughter. The food was great the service was good all in all I'd recommend it to anyone",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Christina Barnes",
    location: "Centerton",
    text: "If you're looking for authentic Mexican food that's amazing, this should be your go to place! We got our food pretty fast and it was delicious!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Donna Duncan",
    location: "Centerton",
    text: "Good food, friendly service and really reasonable prices!!! I have a Mexican food spot at the end of my road and I think I like El Pueblito better, especially the prices!!!!",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Scott Comstock",
    location: "Centerton",
    text: "Food was really good and reasonably priced. The staff was very friendly. I will be eating there again.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Vishal Gandhi",
    location: "Centerton",
    text: "Great food with great Service!! Very friendly atmosphere!! Cool place for hang out as well!! Will recommend for sure!!!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Lisa Taylor",
    location: "Centerton",
    text: "Just moved to Centerton and tried El Pueblito tonight for the first time! It was quick and delicious! 10/10 will eat here again!",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "Elvia Escoto",
    location: "Centerton",
    text: "Awesome food!!!! Had the shrimp Baja tacos, XX equis, so delicious!! Great date night! We will be back!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Jeanette Potter",
    location: "Centerton",
    text: "Relaxed and always amazing food",
    source: "Google",
    date: "2024-01-01",
  },
  {
    name: "Ruth Thomas",
    location: "Centerton",
    text: "Great food with big portions and great prices... very busy but still got great service",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Preston Toombs",
    location: "Centerton",
    text: "Was really good! Salsa was basic which is how I usually judge a Mexican restaurant but I was happy enough with my food to give a 5*",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Roy Lee",
    location: "Centerton",
    text: "Great food, great service, always a pleasure to eat here. Tamales are fantastic!!",
    source: "Google",
    date: "2023-07-01",
  },
  {
    name: "Patricia Payne",
    location: "Centerton",
    text: "Not fancy but food is excellent. Had the Tilapia Jalesco. So good Mike had Carnival burrito which he loved.",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "Roland Pinault",
    location: "Centerton",
    text: "El Pueblito is one of the best , if not the best mexican restaurants in NWA. the family owned business features classic mexican fare and some creative custom dishes. Pollo El Publito is phenomenal !",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Steve",
    location: "Centerton",
    text: "Food was GREAT.. Margaritas were good. Fun and friendly staff. Affordable prices.",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "William Knox",
    location: "Centerton",
    text: "Great service, excellent price, great food. Biggest plate of fajita anywhere in the area at am amazing price.",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "John Gorgas",
    location: "Centerton",
    text: "1st time in. The food was delicious and the prices where great! The staff was also great",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Brandon Just Brandon",
    location: "Centerton",
    text: "First time here, we were pretty impressed. Salsa was good, food was good. Service was spot on. We'll be back!",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Levi R'Something",
    location: "Centerton",
    text: "The food here is so good... and the bar is not timid with its drinks haha. Love this place!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Frank Jameson",
    location: "Centerton",
    text: "Great hot food, with unique takes on traditional plates. I had the El Toro and it was so good.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Bray Winchester",
    location: "Centerton",
    text: "This place was absolutely amazing. It's one of my new favorites. My burrito was amazing! I think u should totally try the jacks special!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Richard Chelson",
    location: "Centerton",
    text: "An excellent place to eat with great food and amazing waitstaff. The prices are reasonable just an overall great experience.",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Mercedes Grigsby",
    location: "Centerton",
    text: "Wonderful food, wonderful service, good price 10/10 will be going back.",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "Mark Begrin",
    location: "Centerton",
    text: "Always quick, consistent service and food. Great food and alcohol prices. My go to Mexican restaurant.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Tate Courtney",
    location: "Centerton",
    text: "Great food and great service every time I go there.",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "David Ball",
    location: "Centerton",
    text: "Love this place. Great food and margaritas. Very friendly staff.",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Nathan Sutherland",
    location: "Centerton",
    text: "Awesome waitstaff and great food. The drink menu is pretty good too.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Jon Seay",
    location: "Centerton",
    text: "Absolutely fantastic food, will definitely go back. Try the Street Tacos and Margaritas!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Joe Force",
    location: "Centerton",
    text: "Excellent service and food. Huge pile of fajitas!!",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Beth Malone",
    location: "Centerton",
    text: "Always fast, affordable, pleasant experience. Awesome portions for the price. Our choice for Mexican in Centerton.",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Becky Lewis",
    location: "Centerton",
    text: "We don't eat a lot of Mexican, but this is one of our favorite restaurants. It's premium texmex, where everything is not just covered in cheese and sauce.",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Tracy Stith",
    location: "Centerton",
    text: "From entering to exiting was a fabulous dining experience! Icing on the cake.... price is right!!! My new fav Mex!!!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Robert Hurley",
    location: "Centerton",
    text: "I had the El Toro that amazing, I have never eaten a Chilli Relleno stuffed with chicken, shrimp & bacon. WOW !!!!!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Jason Davis",
    location: "Centerton",
    text: "I was expecting just another mexican restaurant... I was really surprised when the food wasn’t just a repeat of everyone else’s dishes. Go take a look and see for yourself!",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Chris Adams",
    location: "Centerton",
    text: "I love my Mexican food and this was probably the most flavorful I've tasted around here. Definitely top of my list!",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Amanda Bosley",
    location: "Centerton",
    text: "We ordered take out yesterday and it was so delicious! Highly recommend!!",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "Syam M",
    location: "Centerton",
    text: "I love this place, you have so many choices. Taste is good. Reasonable price.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Aaron Thurber",
    location: "Centerton",
    text: "Amazing food, price and service every single time! Above and beyond!",
    source: "Google",
    date: "2021-07-01",
  },
  {
    name: "Richard George",
    location: "Centerton",
    text: "Really good food. Friendly people.",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "Alex Hartley",
    location: "Centerton",
    text: "Good food, well prepared good portions excellent price.",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Kevin P",
    location: "Centerton",
    text: "Excellent. Nice clean restaurant. Staff was friendly. Lots of choices on the menu.",
    source: "Google",
    date: "2020-07-01",
  },
  {
    name: "Shelly",
    location: "Centerton",
    text: "Food is fantastic! Service is quick and friendly! And very good margaritas!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Greg Crawford",
    location: "Centerton",
    text: "Absolutely love this place",
    source: "Google",
    date: "2024-04-01",
  },
  {
    name: "Rachel Oaks",
    location: "Centerton",
    text: "Great new restaurant in Centerton! Friendly staff, the for was delicious, and it's a family friendly atmosphere.",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Jason Fielding",
    location: "Centerton",
    text: "Nice C-town spot for Mexican food. Got the special enchilada plate. Food was hot. Would eat here again.",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Kristi Rowe",
    location: "Centerton",
    text: "Food is delicious. I highly recommend it.",
    source: "Google",
    date: "2023-07-01",
  },
  {
    name: "Makenzie Wesley",
    location: "Centerton",
    text: "Go to for takeout, consistently delicious meals. Ask for the spicy tomatillo salsa!",
    source: "Google",
    date: "2023-07-01",
  },
  {
    name: "Craig Hale",
    location: "Centerton",
    text: "Always great! The El Toro or Razorback is Awesome! Best Mexican food in Benton Co",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "JohnLawIII",
    location: "Centerton",
    text: "Good food, friendly service, cold beer. A very nice alternative for local food.",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Morgan Holly",
    location: "Centerton",
    text: "Will be back! I had the carnitas and they were crispy on the outside and juicy inside. Delicious!",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Dennis Gattis (Cachehog)",
    location: "Centerton",
    text: "Outstanding food and service! Highly recommended.",
    source: "Google",
    date: "2023-07-01",
  },
  {
    name: "Phil Sciumbato",
    location: "Centerton",
    text: "Best I've been treated at a restaurant in ages... When you go in ask for Eddy... Very good waiter.!!!",
    source: "Google",
    date: "2021-05-01",
  },
  {
    name: "Myron Jackson",
    location: "Centerton",
    text: "Good food with good service and very clean restaurant.",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "David Simpson",
    location: "Centerton",
    text: "Great Mexican food, never had to wait for a table, food service and reasonable pricing.",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Benin Chellamthara Job",
    location: "Centerton",
    text: "Enjoyed the food. Great service as well. Reasonable price.",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Brandon Garcia",
    location: "Centerton",
    text: "The food and service is always top notch! Update: Still the best!",
    source: "Google",
    date: "2023-07-01",
  },
  {
    name: "Mason Von Ritchie",
    location: "Centerton",
    text: "Great food, fast and friendly service. 10/10 would recommend.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Dharini Jayaraman",
    location: "Centerton",
    text: "Lot of veggie options, tasty food and quick service . Family friendly and affordable",
    source: "Google",
    date: "2021-05-01",
  },
  {
    name: "J M",
    location: "Centerton",
    text: "Excellent service. The servers here are very tentative and always make sure you are taken care of. I highly recommend.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Lori Whitehead",
    location: "Centerton",
    text: "Generous servings, food was delicious.",
    source: "Google",
    date: "2023-09-01",
  },
  {
    name: "Fred Fanning",
    location: "Centerton",
    text: "The food is very good and the service is great.",
    source: "Google",
    date: "2022-10-01",
  },
  {
    name: "Julie Waggoner",
    location: "Centerton",
    text: "Shrimp tacos are a delight! Service was beyond fantastic!",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Josh Varner",
    location: "Centerton",
    text: "Good service and great food with equally nice prices and portions",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "Karrah Kramer",
    location: "Centerton",
    text: "Best Carnitas in NWA. No really, the best. I've never tried anything I didn't like here.",
    source: "Google",
    date: "2020-10-01",
  },
  {
    name: "Justin Weston",
    location: "Centerton",
    text: "Really good place to eat. Very clean and a good value!",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "mahmens76",
    location: "Centerton",
    text: "Great food, Great service. Nice place to eat.",
    source: "Google",
    date: "2018-10-01",
  },
  {
    name: "Mallery Smith",
    location: "Centerton",
    text: "The seating was quick, the waitress was great, and the food was so good!",
    source: "Google",
    date: "2020-08-01",
  },
  {
    name: "Nick Moore",
    location: "Centerton",
    text: "Great little Mexican joint that's convenient, has great food, and good service.",
    source: "Google",
    date: "2017-09-01",
  },
  {
    name: "Candice Easley",
    location: "Centerton",
    text: "Wonderful food, great prices, attentive staff.",
    source: "Google",
    date: "2018-10-01",
  },
  {
    name: "Jonathan Jost",
    location: "Centerton",
    text: "Great food and service. Nice to finally have the Centerton location open.",
    source: "Google",
    date: "2017-11-01",
  },
  {
    name: "Adam Jewell",
    location: "Centerton",
    text: "Good service great food. Very reasonably priced.",
    source: "Google",
    date: "2018-10-01",
  },
  {
    name: "checotah price",
    location: "Centerton",
    text: "Excellent food. Fantastic service. Great environment.",
    source: "Google",
    date: "2017-10-01",
  },
  {
    name: "Paul Vital",
    location: "Centerton",
    text: "Food is good and reasonable",
    source: "Google",
    date: "2024-01-01",
  },
  {
    name: "Susan Litch",
    location: "Centerton",
    text: "Good food. Open on Sundays.",
    source: "Google",
    date: "2023-06-01",
  },
  {
    name: "Canon Spurlock",
    location: "Centerton",
    text: "Ive gone there for a while and the food always tastes great",
    source: "Google",
    date: "2017-11-01",
  },
  {
    name: "Tyler Seidel",
    location: "Centerton",
    text: "Favorite Mexican restaurant in the area and good prices too!",
    source: "Google",
    date: "2022-06-01",
  },
  {
    name: "Arianna Ortega",
    location: "Centerton",
    text: "Great food great service the margaritas were amazing",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Devin Anderson",
    location: "Centerton",
    text: "Eat here sometimes everyday. Great food and service",
    source: "Google",
    date: "2021-09-01",
  },
  {
    name: "ivan rivera",
    location: "Centerton",
    text: "Food was delicious probably my new go to Mexican restaurant.",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "Rebecca",
    location: "Centerton",
    text: "Everyone's food was great. Good service!",
    source: "Google",
    date: "2020-10-01",
  },
  {
    name: "Marshall Conner",
    location: "Centerton",
    text: "My favorite Mexican restaurant in the area. ORDER AL PASTOR STREET TACOS. Employees are very friendly.",
    source: "Google",
    date: "2022-10-01",
  },
  {
    name: "Mark Pavlak",
    location: "Centerton",
    text: "Really good food with lower than expected pricing.",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "Jackie Guyer (JJ)",
    location: "Centerton",
    text: "The carnitas were to die for. Great food. Great service.",
    source: "Google",
    date: "2020-10-01",
  },
  {
    name: "Raven Harmon",
    location: "Centerton",
    text: "Food was great and didn't have to wait long.",
    source: "Google",
    date: "2018-10-01",
  },
  {
    name: "Kerri Ogle-Griff",
    location: "Centerton",
    text: "Great food, nice staff, fast service.",
    source: "Google",
    date: "2017-08-01",
  },
  {
    name: "John Q",
    location: "Centerton",
    text: "Great Mexican food and I'm from El Paso Tx.",
    source: "Google",
    date: "2022-05-01",
  },
  {
    name: "Sharon Pennington",
    location: "Centerton",
    text: "Great food, great variety. Very clean.",
    source: "Google",
    date: "2018-06-01",
  },
  {
    name: "Bert Chapman",
    location: "Centerton",
    text: "Absolutely excellent !!!! Our opinion. We try to make it to El Pueblito once a week.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "A Nelson",
    location: "Centerton",
    text: "Great food, great staff. Stop in for lunch and see for yourself.",
    source: "Google",
    date: "2020-08-01",
  },
  {
    name: "David Jones",
    location: "Centerton",
    text: "Consistent quality, good service, large portions.",
    source: "Google",
    date: "2018-05-01",
  },
  {
    name: "Andrew A",
    location: "Centerton",
    text: "Very nice place to eat a quick lunch! Fajitas A++",
    source: "Google",
    date: "2020-05-01",
  },
  {
    name: "Jennifer Chapman",
    location: "Centerton",
    text: "Excellent Mexican food. Best place in Arkansas we have found.",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "Michael Regilio",
    location: "Centerton",
    text: "The food was great and the prices are reasonable.",
    source: "Google",
    date: "2022-08-01",
  },
  {
    name: "Joshua S",
    location: "Centerton",
    text: "Great prices and food is real Mexican food.",
    source: "Google",
    date: "2023-01-01",
  },
  {
    name: "George Eldridge",
    location: "Centerton",
    text: "Food is amazing!! Service is great!!!! Margaritas are good too!!!!",
    source: "Google",
    date: "2017-05-01",
  },
  {
    name: "Montreall Hair",
    location: "Centerton",
    text: "Great place I went there and had the El Toro and i been back like 10 times. For that El toro.",
    source: "Google",
    date: "2019-06-01",
  },
  {
    name: "dj watts",
    location: "Centerton",
    text: "Loved there food and service. Great place.",
    source: "Google",
    date: "2020-04-01",
  },
  {
    name: "Lisa Holtquist",
    location: "Centerton",
    text: "Always great food and awesome service!",
    source: "Google",
    date: "2018-10-01",
  },
  {
    name: "anastasia sholar",
    location: "Centerton",
    text: "Great place to grab a meal, even a pickup order.",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "Chris",
    location: "Centerton",
    text: "Good service and the chicken chimichanga was delicious!",
    source: "Google",
    date: "2022-02-01",
  },
  {
    name: "Josh Bowers",
    location: "Centerton",
    text: "The service is always excellent and the food is as well.",
    source: "Google",
    date: "2018-06-01",
  },
  {
    name: "Kimberly Jenae",
    location: "Centerton",
    text: "Food was great and the margaritas were amazing.",
    source: "Google",
    date: "2018-05-01",
  },
  {
    name: "Devin",
    location: "Centerton",
    text: "The fajitas for two turned into fajitas for two days for two. Good price for good food.",
    source: "Google",
    date: "2017-09-01",
  },
  {
    name: "Chris Brown",
    location: "Centerton",
    text: "It's a great place for lunch if you're in the mood for Mexican food.",
    source: "Google",
    date: "2021-10-01",
  },
  {
    name: "david james",
    location: "Centerton",
    text: "Amazing food! Fastest services in this area.",
    source: "Google",
    date: "2020-02-01",
  },
  {
    name: "karolann parks",
    location: "Centerton",
    text: "It's the only Mexican food restaurant I will eat at... Omg good.",
    source: "Google",
    date: "2018-10-01",
  },
  {
    name: "Jasson Henderson",
    location: "Centerton",
    text: "Great Margarita and good food!",
    source: "Google",
    date: "2022-07-01",
  },
  {
    name: "Russell Rowe",
    location: "Centerton",
    text: "Great food, good prices.",
    source: "Google",
    date: "2017-05-01",
  },
  {
    name: "willie baker",
    location: "Centerton",
    text: "Nice atmosphere, food was delicious, fellowship was great!!!!",
    source: "Google",
    date: "2018-08-01",
  },
  {
    name: "Linda S. Martin",
    location: "Centerton",
    text: "Food good. Excellent service. Clean",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "Becky Tucker",
    location: "Centerton",
    text: "Delicious as always. Chips and Salsa are the best . . . .",
    source: "Google",
    date: "2021-11-01",
  },
  {
    name: "Steve Mank",
    location: "Centerton",
    text: "Excellent lunch menu and excellent mexican food!",
    source: "Google",
    date: "2020-02-01",
  },
  {
    name: "Kristi Sparks",
    location: "Centerton",
    text: "Good food, good service — can't complain.",
    source: "Google",
    date: "2021-10-01",
  },
  {
    name: "Ricardo Estrada",
    location: "Centerton",
    text: "They got the best chicken soup ever.",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "David Hubbard",
    location: "Centerton",
    text: "Great food and super fast service.",
    source: "Google",
    date: "2019-08-01",
  },
  {
    name: "Michael Vanhook",
    location: "Centerton",
    text: "Always get good service and great food",
    source: "Google",
    date: "2019-07-01",
  },
  {
    name: "Linda Nelsen",
    location: "Centerton",
    text: "Very delicious food and great service",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "Ronna Crosby",
    location: "Centerton",
    text: "Great food. Good service.",
    source: "Google",
    date: "2019-10-01",
  },
  {
    name: "JOSEPH AVILA",
    location: "Centerton",
    text: "Weekly visits since it opened. My fav is The Enchiladas Razorback. (Pork)",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Marie Beloney",
    location: "Centerton",
    text: "Food was really good and enjoyed by family.",
    source: "Google",
    date: "2019-09-01",
  },
  {
    name: "Vamsi Korabathina",
    location: "Centerton",
    text: "Delicious food and courteous staff!",
    source: "Google",
    date: "2018-10-01",
  },
  {
    name: "zac goforth",
    location: "Centerton",
    text: "Great food and quick service!!",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Thaddaeus Chambers",
    location: "Centerton",
    text: "Great service and wonderful food!!!",
    source: "Google",
    date: "2021-04-01",
  },
  {
    name: "william evans",
    location: "Centerton",
    text: "Great food, Nice, professional servers",
    source: "Google",
    date: "2019-03-01",
  },
  {
    name: "Bill Gattis",
    location: "Centerton",
    text: "Great food and friendly staff.",
    source: "Google",
    date: "2021-06-01",
  },
  {
    name: "Rhoda Jantz",
    location: "Centerton",
    text: "Delicious Food and Friendly Staff😊",
    source: "Google",
    date: "2021-05-01",
  },
  {
    name: "Junior Cantu",
    location: "Centerton",
    text: "Excellent food and quality service",
    source: "Google",
    date: "2019-06-01",
  },
  {
    name: "KennyLRush",
    location: "Centerton",
    text: "Great food and quick as well.",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "Samantha Blevins",
    location: "Centerton",
    text: "New restaurant but is our new favorite Mexican restaurant",
    source: "Google",
    date: "2017-07-01",
  },
  {
    name: "Charlotte Blake",
    location: "Centerton",
    text: "Margaritas and Mexican pizza with chicken ALWAYS GOOD!!!!",
    source: "Google",
    date: "2018-05-01",
  },
  {
    name: "Kelly Hiller",
    location: "Centerton",
    text: "Great food and prices.",
    source: "Google",
    date: "2018-09-01",
  },
  {
    name: "Carol Harper",
    location: "Centerton",
    text: "Had fajitas carnitas very good",
    source: "Google",
    date: "2018-07-01",
  },
  {
    name: "Bea Herndon",
    location: "Centerton",
    text: "Outstanding. Our children enjoyed it as well",
    source: "Google",
    date: "2017-06-01",
  },
  {
    name: "Cara Dodd",
    location: "Centerton",
    text: "Great food and great service!",
    source: "Google",
    date: "2017-08-01",
  },
  {
    name: "Achintya Paul",
    location: "Centerton",
    text: "Good food, friendly staff",
    source: "Google",
    date: "2022-03-01",
  },
  {
    name: "Damon Wilson",
    location: "Centerton",
    text: "Good food cheap beer!",
    source: "Google",
    date: "2018-06-01",
  },
  {
    name: "Eileen B.",
    location: "Centerton",
    text: "This is a much needed addition to the growth in the area out here. Excellent atmosphere. Clean. Staff are attentive and service is excellent. Then there is the food! Chile Rellenos! Authentic and delicious. Everything we've tried has been exactly what we expected. Join the rewards program too. Don't forget to check in at the kiosk as you enter!",
    source: "Yelp",
    date: "2025-03-19",
  },
  {
    name: "Bruce K.",
    location: "Centerton",
    text: 'Staying on a keto diet at a Mexican restaurant can be a challenge but I did okay by not going deep into the chips and salsa. That was tough because the chips were pretty darned awesome - just the right thickness and salt.. It would have been easier to say "No" if they were bad and they were not! I chose the carne asada as my main, skipping the tortillas and getting extra salad instead of rice and beans. A really good portion of thin skirt steak, seasoned nicely. It did need the knife and fork. Delicious and very filling! A clean restaurant with great service. I\'m really glad my friend picked this one!',
    source: "Yelp",
    date: "2024-04-17",
  },
  {
    name: "Shauna B.",
    location: "Centerton",
    text: "Definitely the best Mexican food we've found in NWA. Love the Pollo El Pueblito, Steven special, Steak fajitas, and Mezcal dip. Also love the rewards program.",
    source: "Yelp",
    date: "2025-05-29",
  },
  {
    name: "Alejandra D.",
    location: "Centerton",
    text: "Food was absolutely delicious, I got the shrimp, chicken and steak fajitas definitely will be going again soon. Absolutamente delicioso. I got the chicken, shrimp and steak fajitas and highly recommend you try them out! 10/10",
    source: "Yelp",
    date: "2024-08-26",
  },
  {
    name: "Ray D.",
    location: "Centerton",
    text: "Always a great meal at El Pub. I go multiple time a month, and the service and food is super consistent. Our favorite server is Axony and her smile and service is always the best. Plus, she makes the best Paloma in the restaurant",
    source: "Yelp",
    date: "2025-05-19",
  },
  {
    name: "Nancy N.",
    location: "Centerton",
    text: "Fabulous as always! Outstanding service, and food at a very reasonable price! The ambience is delightful, and I certainly understand why it is such a popular destination in Bella Vista!",
    source: "Yelp",
    date: "2025-03-05",
  },
  {
    name: "Jannie B.",
    location: "Centerton",
    text: "Loved this little Tex mex place we visited yesterday. We did the combo fajitas for two-the meat was plenty and fresh. We also did 2 skinny margs and they were well done. My son ordered the Mexican pizza for lunch and ate the rest for dinner it was huge.",
    source: "Yelp",
    date: "2023-04-24",
  },
  {
    name: "Nicole H.",
    location: "Centerton",
    text: "We had great service and great food. We have been multiple times and are always pleased with what we order.",
    source: "Yelp",
    date: "2025-03-18",
  },
  {
    name: "Karen B.",
    location: "Centerton",
    text: "Good food! Great service! Usually don't go to this location but go to the one in Rogers, but my sister recently moved to Centerton and we went to this one. The food was really good.",
    source: "Yelp",
    date: "2024-05-14",
  },
  {
    name: "Jonathan M.",
    location: "Centerton",
    text: "We eat at El Pueblito regularly. They have on Monday that include margaritas for $2.99. Today I had chicken fajitas and they were delicious. The service is always very good. Highly recommend.",
    source: "Yelp",
    date: "2024-12-09",
  },
  {
    name: "R D.",
    location: "Centerton",
    text: "Excellent service and super friendly staff. Great ambiance with plenty of space. The food is home style Mexican and the quantity presented on the plates is more than filling. Prices are very reasonable and they serve alcohol. I ate here multiple times during my stay in NWA. It was that good!",
    source: "Yelp",
    date: "2024-05-05",
  },
  {
    name: "Regan L.",
    location: "Centerton",
    text: "Great food and exceptional service, we'll be back! Had the fajita burritos, delicious.",
    source: "Yelp",
    date: "2024-08-24",
  },
  {
    name: "Mike S.",
    location: "Centerton",
    text: "The food is so fresh and delicious. The staff is so courteous. Our favorite Mexican restaurant.",
    source: "Yelp",
    date: "2025-04-04",
  },
  {
    name: "Dennis M.",
    location: "Centerton",
    text: "Great margaritas, tacos and Avocado salad… Beans and rice are pretty darn good. The salsa is very good.",
    source: "Yelp",
    date: "2023-06-04",
  },
  {
    name: "Jonathan S.",
    location: "Centerton",
    text: "So far, this place has been excellent on nearly everything we've tried. Great burritos, great nachos, the carne asada fries were completely on point and the salsa is great, too! Highly recommend, ESPECIALLY if you're an out of towner and want a truly good Mexican fix.",
    source: "Yelp",
    date: "2023-06-06",
  },
  {
    name: "Ian C.",
    location: "Centerton",
    text: "I'm about to save you a piggy bank's worth of cash. If you're both a monstrous eater and a frugal man like myself, you ought to invest in El Pueblito's family-sized fajita platter. For some 30-odd dollars, one can get enough fajita meat and concomitant guac and veggies for a week's worth of eating. What's more, the platter is flavorful and fresh. For you family folks, this platter will certainly satisfy you and your little loved ones' need for grub and for leftovers. My quaint family has never conquered this behemoth, and the leftovers make for wonderful omlettes and salads and such. Their chips and salsa are also banging. 5/5",
    source: "Yelp",
    date: "2023-02-24",
  },
  {
    name: "Jenn C.",
    location: "Centerton",
    text: "Fast service. Nice staff. Chile Verde or Razorback enchiladas is my favorite. The margaritas are good too",
    source: "Yelp",
    date: "2023-10-04",
  },
  {
    name: "Leah J. K.",
    location: "Centerton",
    text: "I love this Mexican restaurant! It's my favorite! At least once a week I get their cheese dip and the Steven.",
    source: "Yelp",
    date: "2024-05-14",
  },
  {
    name: "Brian P.",
    location: "Centerton",
    text: "We really enjoyed the good service! The meal was delicious. They have one of the best margaritas in North West Arkansas. Always have a great time everytime we frequent this establishment! Great food great service love the atmosphere the owner of staff are very personable and friendly we go there at least once a week best margaritas in Benton County!!!",
    source: "Yelp",
    date: "2024-03-13",
  },
  {
    name: "Olivia M.",
    location: "Centerton",
    text: "We go here often, tastes great, love the chips and salsa, service is always great there too! The place looks amazing, I love all the paintings!",
    source: "Yelp",
    date: "2023-09-06",
  },
  {
    name: "Paul W.",
    location: "Centerton",
    text: "El Pueblito, and in particular the location in Bella Vista, is our FAVORITE place for Mexican food. We like FLAVORFUL Mexican food, not BLAH Mexican food.... Nothing BLAH here! The service is always good! My wife and I like to split the Special Dinner.... More than enough food for the two of us. I'll have to admit that the first time I ordered the Special Dinner I ate the WHOLE thing!",
    source: "Yelp",
    date: "2024-03-04",
  },
  {
    name: "Kim M.",
    location: "Centerton",
    text: "Dear Carne Asada - I've been loyal and to your delicious sliced steak, onions, cilantro and a few squeezes of lime. But tonight I met CARNITAS! I have a new crush. Me and my hubba hubba were craving the Mezcal cheese dip - layered with beef & beans. So we rolled into Centerton. Dinner time and we slipped into a booth and were met by Edgar (great waiter). I ordered my usual Carne Asada tacos & my husband ordered the ala carte street tacos including a Carnitas. Wow - my new favorite. Always Good food and friendly staff. Our go to for Mexican food.",
    source: "Yelp",
    date: "2020-12-01",
  },
  {
    name: "Debra W.",
    location: "Centerton",
    text: "Their Hawaiian fajitas, are our favorite! Service is great with a cheerful smiles. On Monday's from 6-8 they have live music, that's always good, plus a dance floor.",
    source: "Yelp",
    date: "2023-05-23",
  },
  {
    name: "Luck K.",
    location: "Centerton",
    text: "I don't order a lot, so I can't speak to the burritos and such, but I can tell you the ceviche in on-point! I'm so used to being served watery pre-made-in-bulk poorly balanced sushi that's way too many onions from Las Fajitas, so it's pleasurable to enjoy a fresh ceviche with a good ratio of shrimp to creamy avocado. I get it at least once a week now.",
    source: "Yelp",
    date: "2023-06-08",
  },
  {
    name: "Shannon Z.",
    location: "Centerton",
    text: "We've ordered take our during this COVID-19 pandemic. They were wonderful. It was quick and easy and they even brought it out to my car. I'm all about supporting our local businesses here in Centerton during this time. My husband had the chile verde and I had the camarones al mojo de ajo. It was delicious. We will def be back. During tough times, you've got to support your neighbors.",
    source: "Yelp",
    date: "2020-04-25",
  },
  {
    name: "Kelley S.",
    location: "Centerton",
    text: "We go to the El Pueblito in Centerton. We go at least once a month and the food and service are always delightful. Would recommend them for Mexican food anytime.",
    source: "Yelp",
    date: "2023-04-18",
  },
  {
    name: "Carole R.",
    location: "Centerton",
    text: "Was actually parking, didn't have to wait long. Food was hot, prepared how I liked, very enjoyable atmosphere. Tasted great. Staff was busy but all helping each other, awesome to see.",
    source: "Yelp",
    date: "2023-04-02",
  },
  {
    name: "Jonathan O.",
    location: "Centerton",
    text: "Man, I love this place! Excellent food, excellent service! Fast on the delivery and excellent margarita selections! I bring in a whole mess of kids and I know can be disruptive but they are always welcoming and provide excellent service! Go eat here at any of their locations! Enjoy a margarita and be prepared for your food to arrive minutes after the orders are placed!",
    source: "Yelp",
    date: "2022-03-01",
  },
  {
    name: "Julie S.",
    location: "Centerton",
    text: "I love the food, the fast service and the super nice staff. Everything that I've tried here has been wonderful!",
    source: "Yelp",
    date: "2022-07-23",
  },
  {
    name: "Bruce B.",
    location: "Centerton",
    text: "Great staff, atmosphere, menu and food. Love to support independent businesses and owners. A wonderful Mexican restaurant with great food, service and waiters and waitresses!",
    source: "Yelp",
    date: "2022-12-13",
  },
  {
    name: "Hannah O.",
    location: "Centerton",
    text: "The chicken cheese and rice of your dreams! Love the cowboy salad and Emily's Special. Good ole basic Mexican food. My favorite is Emily's Special with extra mushrooms. Always quick to be seated and service is timely.",
    source: "Yelp",
    date: "2023-09-01",
  },
  {
    name: "Hannah D.",
    location: "Centerton",
    text: "Whoever recommended this for out-of-towners was 100% correct in their recommendation. My bf and I had drove 10 hours from Wisconsin and were desperate for some good food. We are so pleased we chose this place. The salsa was phenomenal, perfect spice and texture for me. The service was quick and they were decently busy when we arrived. Plus, they were very kind. I had the Pollo Fundito and my bf had the Burrito El Pueblito. We could've licked the plates clean if we had room! Great serving size, could have taken some home had we been going there. Overall, great experience, great service, phenomenal food.",
    source: "Yelp",
    date: "2023-07-08",
  },
  {
    name: "Maria G.",
    location: "Centerton",
    text: "I really like the authentic Mexican food here! I enjoyed the service too! And have now visited this location 2 times and will be going back again soon.",
    source: "Yelp",
    date: "2022-01-13",
  },
  {
    name: "Samantha M.",
    location: "Centerton",
    text: "Good place to eat. I loved their Steven Special. I had really good service, thank you so much.",
    source: "Yelp",
    date: "2023-05-28",
  },
  {
    name: "Joe C.",
    location: "Centerton",
    text: "Delicious Mexican food, fast service! I recommend their fajitas and their street tacos. Their beer is ice cold and served in a frosty mug. And they always have food and drink specials on the marker board when you walk in. As soon as you're seated, they bring you complimentary chips and salsa. Yeah, you should check it out!",
    source: "Yelp",
    date: "2021-03-06",
  },
  {
    name: "Paschal C.",
    location: "Centerton",
    text: "A very family and finance friendly place. Service is always good, quick, and the food is good. Prices are very reasonable. Staff is very friendly. It is one of our go to restaurants.",
    source: "Yelp",
    date: "2022-05-06",
  },
  {
    name: "Cassandra Z.",
    location: "Centerton",
    text: "...absolutely delicious food! Definitely recommend the margaritas and blood Mary's! The service is wonderful and makes you feel so welcome, and you get your food super quick!",
    source: "Yelp",
    date: "2023-05-05",
  },
  {
    name: "Cory M.",
    location: "Centerton",
    text: "The best in town! Jason Special is great! Best fries at a Mexican place.",
    source: "Yelp",
    date: "2023-08-10",
  },
  {
    name: "C W.",
    location: "Centerton",
    text: "Our GO to Mexican restaurant! Always good food and good service! No complaints. Great place!",
    source: "Yelp",
    date: "2023-07-27",
  },
  {
    name: "Trisha G.",
    location: "Centerton",
    text: "Great meal and great service! Steak fajita taco salad was delicious. Mexican Pizza was like a taco salad but without the lettuce! I love the quick service!",
    source: "Yelp",
    date: "2022-03-30",
  },
  {
    name: "Cathy B.",
    location: "Centerton",
    text: "We just finished dining at El Pueblito. Monday night Margaritas and great food with dear friends have become a tradition for us. We have several favorites at this restaurant, but all the food we have tried has been wonderful! We will keep coming back. Thank you El Pueblito!",
    source: "Yelp",
    date: "2021-12-13",
  },
  {
    name: "Lori H.",
    location: "Centerton",
    text: "We love eating here. Great food for great prices! They keep it affordable, which means we get to eat there more often. And they are close to our home so it's a win-win for us! The staff is always very friendly, too!",
    source: "Yelp",
    date: "2021-03-05",
  },
  {
    name: "Josh W.",
    location: "Centerton",
    text: "Do yourself a favor and try the Molcajete and Carnitas. These two entrees are some of the best Mexican dishes I've ever had. Carnitas are so tender and flavorful and the Molcajete is out of this world. Get the steak and Chicken one. You'll thank me.",
    source: "Yelp",
    date: "2021-04-01",
  },
  {
    name: "Nicole B.",
    location: "Centerton",
    text: "Awesome restaurant! Spacious and accommodating for large parties. Food is great and fast. Reasonably priced.",
    source: "Yelp",
    date: "2022-09-23",
  },
  {
    name: "Karen E.",
    location: "Centerton",
    text: "Absolutely great quality... Mexican at its finest. Seriously affordable and delicious - if you're trying it for the first time start with the El Toro and a frozen margarita, I promise it won't disappoint! Cheers!",
    source: "Yelp",
    date: "2023-05-01",
  },
  {
    name: "Jennifer J.",
    location: "Centerton",
    text: "Wonderful service! We never had an empty chip bowl or low drink the entire visit there. The menu is extensive. We had Jack's Special and an Enchiladas with steak and potatoes in them covered in an avocado Verde sauce. No complaints here. We will return.",
    source: "Yelp",
    date: "2018-02-15",
  },
  {
    name: "Cindy A.",
    location: "Centerton",
    text: "As Centerton grows so does the amount of new businesses opening here. A New Mexican restaurant opened here about a year or so ago in a plaza near our Sonic and it has been a very delightful addition. Their pork chile verde is DELICIOSO and my friend has blessed me twice to the hard to find treat of my Old Hawaiian life -- FRIED FISH!!! I live and grew up with crispy fried fish and El Pueblito has satisfied that craving! It is crispy and fresh as if it was caught just that moment and cooked up!!! It is fabulous!!! I've yet to try other treats there but we did also have their steak burrito which is huge, delicious and filling. I've had to split the portions of both the verde and the burrito and so very blessed with leftovers! But the fish, though HUGE I finish that up because I can't stop eating it and I want to eat that up fresh and hot. Hope you all get to try it someday here in wonderful Centerton.",
    source: "Yelp",
    date: "2019-09-12",
  },
  {
    name: "Elizabeth E.",
    location: "Centerton",
    text: "We love this place. Great Mexican food and great service.",
    source: "Yelp",
    date: "2019-10-13",
  },
  {
    name: "Brad W.",
    location: "Centerton",
    text: "El Pueblito is the best Mexican food in NWA!! We love the food and the service. Locally owned and ran, and that's what NWA is all about. Whether it's a Sunday after church, or a quick dinner...we are always welcomed and filled up with some good food!",
    source: "Yelp",
    date: "2019-12-16",
  },
  {
    name: "Austin C.",
    location: "Centerton",
    text: "By far the best Mexican food I've had around especially for the prices. Fresh delicious salsa everytime! Fresh chips still warm and crunchy. The food is just amazing! I've been to both locations and NEVER been disappointed. If you want Great mexican food and great prices go here! It's just fantastic.",
    source: "Yelp",
    date: "2019-09-21",
  },
  {
    name: "Wendy H.",
    location: "Centerton",
    text: "We love El Pueblito. The food is wonderful, the service is awesome and the beer is so cold. So nice to have them in our community and to be treated by such friendly, smiling faces every time.",
    source: "Yelp",
    date: "2022-02-08",
  },
  {
    name: "Lindsay L.",
    location: "Centerton",
    text: "Delicious! Our favorite Mexican restaurant. Everything we have had is good. Service is always good too.",
    source: "Yelp",
    date: "2022-01-30",
  },
  {
    name: "Cheryl F.",
    location: "Centerton",
    text: "Love going here. Never have had an issue with the food. It's always good and the service is friendly. When I want a a good Margarita this is where I go. They make the best ones around.",
    source: "Yelp",
    date: "2020-07-13",
  },
  {
    name: "Demitra C.",
    location: "Centerton",
    text: "The absolute best Mexican food! Fresh and consistently good every time. Friendly staff, great prices.",
    source: "Yelp",
    date: "2020-06-04",
  },
  {
    name: "Joanna Alexis H.",
    location: "Centerton",
    text: "I love this place! It's got fresh pipping hot tortilla chips & salsa that come free. Popular Mexican beers on tap. You can get a lot of food for super cheap! We're a bit picky with our orders and it's been right every time! Crossing my fingers that I don't jinx myself. An easy go to dinner or happy hour after work.",
    source: "Yelp",
    date: "2019-05-26",
  },
  {
    name: "Mark W.",
    location: "Centerton",
    text: "Our favorite spot in NWA. This place is very unassuming... and the food is consistent, delicious, and comes out quick. I can also say that on the many occasions we have been here, we always have phenomenal service. Highly highly recommend.",
    source: "Yelp",
    date: "2021-08-21",
  },
  {
    name: "Deb D.",
    location: "Centerton",
    text: "I called in my order on our way home from town. Lady on phone was very cordial and helpful. We got there in 15 minutes and food was brought out and they were very efficient and courteous. When we arrived home, food was warm and delicious as always! Thank you El Pueblito!",
    source: "Yelp",
    date: "2020-04-14",
  },
  {
    name: "Jennifer V.",
    location: "Centerton",
    text: "Salsa is good. Service is good... It is our go to location for when we are craving Mexican food! I like that food is always served quickly and piping hot!",
    source: "Yelp",
    date: "2019-04-19",
  },
  {
    name: "Martha B.",
    location: "Centerton",
    text: "Killer food. I can always rely on them for a good meal. Best restaurant to be added to Centerton in the last 2 years.",
    source: "Yelp",
    date: "2020-02-23",
  },
  {
    name: "Kristen R.",
    location: "Centerton",
    text: "We love coming to El Pueblito-Bella Vista. The staff is always so friendly and the food is great.",
    source: "Yelp",
    date: "2021-11-06",
  },
  {
    name: "Sean C.",
    location: "Centerton",
    text: "El Pueblito is always awesome. Great food, great service, good prices. Awesome place to go!",
    source: "Yelp",
    date: "2019-12-08",
  },
  {
    name: "Michele G.",
    location: "Centerton",
    text: "Love this restaurant. Bella Vista location is our favorite! Great food and great prices and great service!",
    source: "Yelp",
    date: "2019-11-23",
  },
  {
    name: "The Makery N.",
    location: "Centerton",
    text: "Love coming to the Centerton El Pueblito. Food is always great. Staff is friendly and attentive. This is our favorite place for Mexican food.",
    source: "Yelp",
    date: "2019-11-19",
  },
  {
    name: "Chris A.",
    location: "Centerton",
    text: "We live nearby and love having a great option for Mexican food so close. Margaritas are solid, cheese dip is the bomb, and the fajitas are fire!",
    source: "Yelp",
    date: "2021-09-10",
  },
  {
    name: "William E.",
    location: "Centerton",
    text: "Really great food. Great fajitas. Great cheese dip, and salsa. Friendly staff. Prices are good.",
    source: "Yelp",
    date: "2019-09-16",
  },
  {
    name: "McKenna F.",
    location: "Centerton",
    text: "My favorite Mexican food place. The food is delicious, the staff is friendly, great for kids too.",
    source: "Yelp",
    date: "2019-05-16",
  },
  {
    name: "Laura R.",
    location: "Centerton",
    text: "Delicious authentic Mexican food. I'm Mexican and can truly say, the food is rich in flavor and perfect spice. Not to mention they have beer!",
    source: "Yelp",
    date: "2018-02-23",
  },
  {
    name: "Jenny D.",
    location: "Centerton",
    text: "I love this place! The food is always amazing, and the service is even better. We never get the same thing twice because it's all so good. They treat my toddler like a lil princess even though she leaves a giant mess. Yolanda is our favorite server. She is always so kind and takes extra care with us. Beer is cold, and margaritas are yummy. Can't say enough good things.",
    source: "Yelp",
    date: "2018-04-29",
  },
  {
    name: "Matt T.",
    location: "Centerton",
    text: "Very good food and service each and every time I have been there usually go once a week for dinner.",
    source: "Yelp",
    date: "2019-09-09",
  },
  {
    name: "Heather H.",
    location: "Centerton",
    text: "By far my favorite Mexican restaurant in northwest Arkansas. I am a creature of habit when I order food. But I try to pick something different here from time to time. And EVERY time I'm happy! I love this place!!!",
    source: "Yelp",
    date: "2019-10-10",
  },
  {
    name: "Mimi G.",
    location: "Centerton",
    text: "Glad to have ya in town! Good food, good service.",
    source: "Yelp",
    date: "2018-04-21",
  },
  {
    name: "Shawn H.",
    location: "Centerton",
    text: "This is a great local restaurant. Friendly staff and fast service. The food is top notch and consistent. My favorite.... El Toro!",
    source: "Yelp",
    date: "2019-12-28",
  },
  {
    name: "Monica R.",
    location: "Centerton",
    text: "By far the best Mexican food in Centerton and Bentonville. We have tried many of their dishes and have never been disappointed.",
    source: "Yelp",
    date: "2019-07-20",
  },
  {
    name: "Tracey Q.",
    location: "Centerton",
    text: "This place rocks! Great food and the prices are budget friendly. The service is great and the staff are always friendly. This is our 'go to' spot to eat out!",
    source: "Yelp",
    date: "2019-05-17",
  },
  {
    name: "Mike T.",
    location: "Centerton",
    text: "Had lunch today, service was good, and the food was great! I had the fajita Jalisco- this place gives more shrimp then the other similar restaurants in the area. Portion size is good, couldn't finish it. Would recommend!",
    source: "Yelp",
    date: "2019-04-06",
  },
  // {
  //   name: "Kirk J.",
  //   location: "Centerton",
  //   text: "Best cheap Tex Mex Restaurant in NWA",
  //   source: "Yelp",
  //   date: "2019-10-14",
  // },
  {
    name: "Maria D.",
    location: "Centerton",
    text: "We have had the opportunity to eat at this wonderful establishment on 2 occasions (so far :) ) and have been delighted with our orders! Their beef chimichanga has become an instant hit for my husband, and I have tried the fajitas (so much food!), and the El Toro was wonderful for a small appetite!",
    source: "Yelp",
    date: "2018-12-27",
  },
  {
    name: "Jersey D.",
    location: "Centerton",
    text: "Best authentic Mexican in NWA! The new location in Centerton is just as good as Bella Vista location. The best beer prices in NWA in an ice cold mug! The street tacos are delicious and service is fantastic. Good prices too.",
    source: "Yelp",
    date: "2018-05-18",
  },
  {
    name: "Brent J.",
    location: "Centerton",
    text: "Excellent food. Choriqueso is terrific. Food portions are huge so if you leave hungry, you did it wrong.",
    source: "Yelp",
    date: "2018-03-13",
  },
  {
    name: "Wesley S.",
    location: "Centerton",
    text: "So I've been in here twice now, both times have been really great. The service has been friendly and prompt. The food has been hot and fresh. Oh, and did I mention they've gotten their liquor license finally!! Honestly if you live in Centerton and want some pretty dang good Mexican food and one hell of a monster margarita, stop by and try this place out. I got the beef nachos last time (a standard) and the Wally special this time. Which is basically seafood enchiladas. Both were tasty. Really y'all, as Centerton grows I can only hope new places that pop up, run with as much focus on customer service and quality in food as El Pueblito.",
    source: "Yelp",
    date: "2018-04-23",
  },
  {
    name: "Normita J.",
    location: "Highfill",
    text: "Staff is friendly, ambiance is nice, food is good and don't have to wait long for it. The margaritas are delicious.",
    date: "2025-03-15",
    source: "Yelp",
  },
  {
    name: "Martin G.",
    location: "Highfill",
    text: "The food is very good and they have a great staff, atmosphere and service! Full bar and a good selection of beers on tap.",
    date: "2025-01-19",
    source: "Yelp",
  },
  {
    name: "Barbara B.",
    location: "Highfill",
    text: "Lovely inside, clean and the staff is on point. The prices were reasonable and the portions were good; the flavor was tasty. I had the El Pueblito Bowl: it's so nice to get your food hot! That is to say the shrimp I ordered for the protein in the bowl was hot. The salad and beans beneath: tasty and fresh - mucho yummy! I will be back for sure.",
    date: "2025-03-29",
    source: "Yelp",
  },
  {
    name: "Mark Freas",
    location: "Highfill",
    text: "A Hidden Gem You Can’t Miss – El Pueblito is Simply Outstanding! If you’re looking for the best Mexican food you’ve ever had, look no further than El Pueblito! This family-run restaurant is an absolute treasure, offering an incredible dining experience that will leave you wanting more. From the moment we walked in, the staff made us feel like family. Their service was impeccable—attentive, friendly, and genuinely passionate about making sure every guest has an amazing meal. The atmosphere? Perfect. Relaxed, easygoing, and welcoming—exactly what you want when you’re sitting down to enjoy authentic Mexican cuisine. Now, let’s talk about the food. Absolutely phenomenal! Every bite was bursting with flavor, expertly prepared, and hands down the best Mexican food I’ve ever had. Whether you’re a local or just passing through, this spot is a must-visit for lunch or dinner. And the best part? El Pueblito is conveniently located super close to the airport, as well as Gentry and Bentonville, making it an easy stop no matter where you’re coming from. Do yourself a favor—don’t just take my word for it. Go experience El Pueblito for yourself, and thank me later!",
    date: "2025-03-01",
    source: "Google",
  },
  {
    name: "Cristina Loyola",
    location: "Highfill",
    text: "Every time I come here I get the best dinner ever. The food is always amazing and staff is great! Definitely one of my favorite places to dine at. You must try the Parillada!!",
    date: "2025-06-15",
    source: "Google",
  },
  {
    name: "Lisa Lynn",
    location: "Highfill",
    text: "I really enjoyed my meal, and my grandson claimed his Steven special was the best ever!",
    date: "2025-01-20",
    source: "Google",
  },
  {
    name: "Mike Burnside",
    location: "Highfill",
    text: "We stopped in for a weekday lunch while traveling from XNA airport to Oklahoma, and it was great all the way around. The service and atmosphere were great, with the waiter checking if we needed anything multiple times. The food was very good, with really good portions. I would go back with no hesitation.",
    date: "2025-03-01",
    source: "Google",
  },
  {
    name: "Anna Negrete",
    location: "Highfill",
    text: "Loved our experience here ❤️ margaritas tasted sooo good, bartender was such a sweet heart and took great care of us. Fajitas were delicious. Get the choriqueso appetizer!!!",
    date: "2025-07-15",
    source: "Google",
  },
  {
    name: "pandaloves17",
    location: "Highfill",
    text: "Super good food! Nice to have something so close instead of going miles to find a good place to eat.",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "CristopherJ",
    location: "Highfill",
    text: "El Pueblito delivers a fantastic dining experience with flavorful, well-crafted appetizers, delicious and authentic main dishes, and friendly, attentive service. Warm atmosphere and great food make it a local gem worth visiting.",
    date: "2025-06-01",
    source: "Google",
  },
  {
    name: "AK Carter",
    location: "Highfill",
    text: "At first glance, I immediately noticed the cleanliness of the restaurant. It is clean and extremely nice! The food is amazing. The family that owns the restaurant went above and beyond, they were super attentive and personable! This is the new spot - highly recommend going to check it out!",
    date: "2024-11-01",
    source: "Google",
  },
  {
    name: "Raquel Medel",
    location: "Highfill",
    text: "I was impressed by the service I received. Estela was the one who attended to me. I felt I was further south because of the great hospitality. Definitely a place to stop again & again whenever possible.",
    date: "2025-06-01",
    source: "Google",
  },
  {
    name: "Marsha TravelMastersNWA",
    location: "Highfill",
    text: "Yes! Good food! Ice cold beer! Nice decor. We will be back!!!",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Michelle Henry",
    location: "Highfill",
    text: "Recently tried out this location and I was so impressed with everything from the restaurant itself, to the service, and, of course, the food! The restaurant is set up nicely, very clean and has a comfortable layout for tables and seating. The staff here go above and beyond to make sure that everything is just right. They keep the drinks full, they are efficient with bringing out appetizers and meals, and they pay attention to if you need them to drop by for something like extra napkins, etc. The food was absolutely delicious! Everyone ordered something different, and ALL of us cleaned our plates. I cannot stress enough how fantastic the food was! I was especially happy with the guacamole, which was fresh and so delicious. I look forward to eating here again!",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Kiki Love",
    location: "Highfill",
    text: "Food was fantastic! Salsa is one of the best! Prices are pretty good too.",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "the gammer",
    location: "Highfill",
    text: "I love this place food is great the service is amazing. I'm glad the workers have that feel like they like working there.",
    date: "2025-03-01",
    source: "Google",
  },
  {
    name: "James Skinner",
    location: "Highfill",
    text: "Pretty decent food good service and not a bad place to go if you’re looking for Mexican food in the area.",
    date: "2025-06-10",
    source: "Google",
  },
  {
    name: "Jerry Ruiz",
    location: "Highfill",
    text: "Food was great had the poncho villa.",
    date: "2025-04-15",
    source: "Google",
  },
  {
    name: "Cesar Rangel",
    location: "Highfill",
    text: "Great food me and my wife like what we order recommend it 100%",
    date: "2025-06-01",
    source: "Google",
  },
  {
    name: "Malanie Patton",
    location: "Highfill",
    text: "Excellent food and waitstaff! This is our favorite location. The Mexican pizzas here are to die for!",
    date: "2025-03-01",
    source: "Google",
  },
  {
    name: "Michael Brooke",
    location: "Highfill",
    text: "Tasty food, friendly staff 👍",
    date: "2025-04-01",
    source: "Google",
  },
  {
    name: "Jennifer Vashkevich",
    location: "Highfill",
    text: "Great tasty food! Good value for portion sizes.",
    date: "2025-04-01",
    source: "Google",
  },
  {
    name: "Lashelle Russell",
    location: "Highfill",
    text: "Food is always good. Staff is kind and has great recommendations.",
    date: "2025-05-01",
    source: "Google",
  },
  {
    name: "Andrea D'Andrea",
    location: "Highfill",
    text: "Great food. Great staff. Beautiful atmosphere. We'll be back!",
    date: "2025-03-01",
    source: "Google",
  },
  {
    name: "Nash Electric",
    location: "Highfill",
    text: "We love coming to eat here! Service and food are both excellent! It’s very clean and always has delicious options.",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Paul Cate",
    location: "Highfill",
    text: "Folks, this is a new Mexican restaurant in Highfill Arkansas El Pueblito. My wife ordered street chicken tacos, and I had chicken taco salad. My taste buds were doing backflips for their tangy, delicious taco salad. The street tacos were just as good as you get in Progresso Mexico, nice clean restaurant we will definitely be back, if you're close by, come check out El Pueblito Mexican restaurant near Highfill Arkansas.",
    date: "2024-11-01",
    source: "Google",
  },
  {
    name: "Rob Shaffer",
    location: "Highfill",
    text: "This place has a great atmosphere, and the service is amazing. Will always eat here.",
    date: "2025-03-01",
    source: "Google",
  },
  {
    name: "Julie Coonrod",
    location: "Highfill",
    text: "We eat at the location in Centerton occasionally and were excited to see the new one in Highfill. We ate there last night and it did not disappoint. Food was great as well as the service.",
    date: "2024-11-01",
    source: "Google",
  },
  {
    name: "Trenton Bagley",
    location: "Highfill",
    text: "Great food and great servers. Benny has taken excellent care of me the past few times. Definitely recommend trying!",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Lisa Jones",
    location: "Highfill",
    text: "Great Food!! Benny is the BEST server!!! Friendly and takes great care of the customers!! We are so glad to have El Publito in Highfill!!!",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Heather Verkler",
    location: "Highfill",
    text: "We ate there on day 1. So happy to have you in Highfill.",
    date: "2024-11-01",
    source: "Google",
  },
  {
    name: "Kaytea Jean",
    location: "Highfill",
    text: "This place is amazing. Great service, amazing food and wonderful people. So glad to have this restaurant in our little town ❤️",
    date: "2024-11-01",
    source: "Google",
  },
  {
    name: "Wayne Johnson",
    location: "Highfill",
    text: "The best service and food, this is a highlight of my week we have dinner here every Friday and never disappoints!!!",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Alighieri Lopez",
    location: "Highfill",
    text: "Excellent service, delicious food and good drinks.",
    date: "2025-04-01",
    source: "Google",
  },
  {
    name: "Joey Ferris",
    location: "Highfill",
    text: "Good food and great service!!",
    date: "2024-11-01",
    source: "Google",
  },
  {
    name: "tony 88in99",
    location: "Highfill",
    text: "This was the first time dining here and the food is delicious.",
    date: "2025-02-01",
    source: "Google",
  },
  {
    name: "Kristi Howard",
    location: "Highfill",
    text: "Food is excellent and service is always friendly and attentive! Highly recommend!",
    date: "2024-11-01",
    source: "Google",
  },
  {
    name: "Amme White",
    location: "Highfill",
    text: "Great food, great service!",
    date: "2025-05-01",
    source: "Google",
  },
  {
    name: "Gina Humphrey",
    location: "Highfill",
    text: "Benny is THE MAN!!! And...the food is fabulous, too!",
    date: "2025-04-01",
    source: "Google",
  },
  {
    name: "Bassdaddy 1",
    location: "Highfill",
    text: "Really good so happy we got a restaurant in highfill.",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "zac goforth",
    location: "Highfill",
    text: "Everything i have had here was great!",
    date: "2025-03-01",
    source: "Google",
  },
  {
    name: "Douglas Arnold",
    location: "Highfill",
    text: "Great food very good people.",
    date: "2025-02-01",
    source: "Google",
  },
  {
    name: "Ashley Helt",
    location: "Highfill",
    text: "Awesome experience!! Our server Benny was excellent.",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Chandler Smith",
    location: "Highfill",
    text: "El Pueblito has become my favorite Mexican restaurant, all locations.",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Michael M",
    location: "Highfill",
    text: "Great food in a nice new location.",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Marlene Carter",
    location: "Highfill",
    text: "Great food and service Benny is awesome.",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "AJ",
    location: "Highfill",
    text: "A must if you are in the area.",
    date: "2025-06-01",
    source: "Google",
  },
  {
    name: "Nicole",
    location: "Highfill",
    text: "Food was amazing!!!",
    date: "2025-05-01",
    source: "Google",
  },
  {
    name: "Lilith b.",
    location: "Highfill",
    text: "Very good.",
    date: "2025-04-01",
    source: "Google",
  },
  {
    name: "Daryen Wiles",
    location: "Highfill",
    text: "Great food and service is great.",
    date: "2024-11-01",
    source: "Google",
  },
  {
    name: "Jordan Silver",
    location: "Highfill",
    text: "Delicious food!!",
    date: "2024-11-01",
    source: "Google",
  },
  {
    name: "Leo Grimes",
    location: "Highfill",
    text: "Food: 5/5  |  Service: 5/5  |  Atmosphere: 5/5",
    date: "2025-05-01",
    source: "Google",
  },
  {
    name: "Tommy Brown",
    location: "Highfill",
    text: "Food: 5/5  |  Service: 5/5  |  Atmosphere: 5/5",
    date: "2025-05-01",
    source: "Google",
  },
  {
    name: "Rox Vel",
    location: "Highfill",
    text: "Food: 5/5  |  Service: 5/5  |  Atmosphere: 5/5",
    date: "2025-03-01",
    source: "Google",
  },
  {
    name: "Jose",
    location: "Highfill",
    text: "Food: 5/5  |  Service: 5/5  |  Atmosphere: 5/5",
    date: "2025-03-01",
    source: "Google",
  },
  {
    name: "romina reynoso",
    location: "Highfill",
    text: "Food: 5/5  |  Service: 5/5  |  Atmosphere: 5/5",
    date: "2025-02-01",
    source: "Google",
  },
  {
    name: "Chipper Jones",
    location: "Highfill",
    text: "Food: 5/5  |  Service: 5/5  |  Atmosphere: 5/5",
    date: "2025-02-01",
    source: "Google",
  },
  {
    name: "Dhea Hudson",
    location: "Rogers",
    text: "Pollo fundido was wonderful. Chips were warm sauce is good. Dr Pepper was excellent.",
    date: "2025-07-24",
    source: "Google",
  },
  {
    name: "Kris Rush",
    location: "Rogers",
    text: "Awesome place! They hosted our son’s Make A Wish party. The staff worked their butts off to ensure we had the best time. Food was awesome, as it always is.",
    date: "2025-07-24",
    source: "Google",
  },
  {
    name: "Frankye Kimler",
    location: "Rogers",
    text: "We love eating here! Today we ordered take out and I ordered the wrong dip by mistake. The manager Kursty; even though I made the mistake, corrected it and made my experience that much more great with them! The guy who took our order Joel was very friendly and had a great phone presence. We live out Beaver Lake and are always thrilled to eat in at this location; as well as to go! Definitely try the five layer dip and the seafood enchiladas! Kursty is doing a phenomenal job with her team!",
    date: "2025-07-03",
    source: "Google",
  },
  {
    name: "Courtney Bailey",
    location: "Rogers",
    text: "Visiting from Texas and we needed some Mexican food on our first evening! We were not disappointed with our meal. Chips and salsa, combo beef and chicken quesadillas, chicken street tacos and rice! We even got their house margaritas as well. Thanks for our first meal in Rogers!",
    date: "2024-10-15",
    source: "Google",
  },
  {
    name: "Leslie Diaz",
    location: "Rogers",
    text: "Stopped to have lunch at this Mexican food gem on the way back home and it was amazing. Had the pollo en crema, and hubby had the burrito de asada (steak burrito) Eduardo was a great waiter! 10/10! His customer service skills were top tier. We will be stopping here next time we visit! :)",
    date: "2025-05-01",
    source: "Google",
  },
  {
    name: "Randy Nelson",
    location: "Rogers",
    text: "Great food and service! Reasonable prices. We stopped by for a late lunch. Very impressed. Can't wait to return.",
    date: "2023-07-01",
    source: "Google",
  },
  {
    name: "Summer Glass",
    location: "Rogers",
    text: "We LOVE this place and probably order so much they know us by name. The alambres is my favorite but my husband loves the pollo pueblito or the Steven special. Great prices and we're so happy to have a restaurant in the Creek area!",
    date: "2024-08-01",
    source: "Google",
  },
  {
    name: "Becky Greenwood",
    location: "Rogers",
    text: "We love this Rogers/Prairie Creek location! Great food, attentive staff, delicious frozen margaritas in a clean and roomy space. The Alambres fajitas are amazing and our go to choice. This has quickly become a weekly spot!!",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Pat Pullum",
    location: "Rogers",
    text: "Good food and plenty for the price. Very tasty. Had enough to bring half home to eat later.",
    date: "2025-05-01",
    source: "Google",
  },
  {
    name: "Toubabo Koomi",
    location: "Rogers",
    text: "Nice clean restaurant. Staff are amazing people. Great Superbowl party. Live music on Monday nights. I love this place.",
    date: "2024-08-01",
    source: "Google",
  },
  {
    name: "Mckayla Mccoy",
    location: "Rogers",
    text: "The best Mexican food I have had in a long time and the most wonderful staff!",
    date: "2025-06-01",
    source: "Google",
  },
  {
    name: "Striker6x",
    location: "Rogers",
    text: "It is always so good, the chips and salsa, the service and my family’s favorite is the alambres.",
    date: "2025-06-01",
    source: "Google",
  },
  {
    name: "Jeff Johnson",
    location: "Rogers",
    text: "El Pueblito has opened its doors and have brought all our favorite family recipes to our lakeside neighborhood. You can't beat this... Live music every Monday!",
    date: "2024-08-01",
    source: "Google",
  },
  {
    name: "Elizabeth McKnight",
    location: "Rogers",
    text: "I'm so glad we stopped by this restaurant, it was so good and the staff was quick and the food was excellent!!!",
    date: "2025-05-01",
    source: "Google",
  },
  {
    name: "Mom The myth",
    location: "Rogers",
    text: "Oh wow what a great place to eat! Food was outstanding!; as well as the service and prices are reasonable and there is a great deal on food on the plate; had to bring half of it home. Can't wait to go back.",
    date: "2024-10-01",
    source: "Google",
  },
  {
    name: "Denise Dunn",
    location: "Rogers",
    text: "We love eating here. The food is amazing. It's a good place to have a drink and relax after a day at the lake!!!",
    date: "2023-05-01",
    source: "Google",
  },
  {
    name: "Wyatt Montgomery",
    location: "Rogers",
    text: "Delicious meal with generous portions. Surprisingly cheap and quick service! Will be returning!",
    date: "2023-08-01",
    source: "Google",
  },
  {
    name: "Joel Gwartney",
    location: "Rogers",
    text: "We made a pick up order and are from out of town. Coming from Dallas, it's usually hard to find a good Mexican restaurant. This place was awesome! We had chicken and steak fajitas, chips and quac, and beef enchiladas. Everyone loved the food and it was a big hit. Priced just right too. You get what you pay for, and it's well worth it here.",
    date: "2024-09-01",
    source: "Google",
  },
  {
    name: "Amber Rogers",
    location: "Rogers",
    text: "Absolutely Everything ordered was amazing down to the chips and salsa, and the margaritas as well!!! Highly recommend this place!!!",
    date: "2023-09-01",
    source: "Google",
  },
  {
    name: "Alley Sergent",
    location: "Rogers",
    text: "We ordered the 'Razorback Nachos' as the app. Let me TELL YOU....AMAZING! THE meat carnitas on the nachos were so good. I would order just that next time because it was amazing. Also, it was enough to share between 2 and pretty much fill us up before our plates even arrived. For our entrees, I ordered the chicken chimichanga, and he ordered the steak chicken and shrimp fajitas.",
    date: "2024-10-01",
    source: "Google",
  },
  {
    name: "Justin w",
    location: "Rogers",
    text: "We were seated quick, 2 other large parties sat at same time, all 3 tables had food in under 15 minutes. Best steak I’ve had in a long time, service was great and the place is clean.",
    date: "2024-11-01",
    source: "Google",
  },
  {
    name: "Edwin Bernal",
    location: "Rogers",
    text: "Great food and service, always asking if I need something.",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Kat Johnson",
    location: "Rogers",
    text: "Outstanding food, drinks and service. I met the manager Mario and he made sure everything was perfect! Pictured is their pina colada.",
    date: "2022-11-01",
    source: "Google",
  },
  {
    name: "Johnny Nunyo",
    location: "Rogers",
    text: "Great food and friendly staff. I asked for a large margarita and WOW I got what I asked for. Chips and salsa are complimentary and are excellent! I rate a lot on those items alone. We ate the fajitas for two and it was delicious and way more than enough food. I walked away buzzed and full. Just how I should've been. Great job!",
    date: "2023-07-01",
    source: "Google",
  },
  {
    name: "J B",
    location: "Rogers",
    text: "We loved going there Monday evening because they had live music and my 4 year old and 2 year old danced and sang along and had a great time. The food was served quickly and tasted great. I had the chicken tapatio.",
    date: "2024-06-01",
    source: "Google",
  },
  {
    name: "Cory Fechner",
    location: "Rogers",
    text: "Amazing tacos. Great service!",
    date: "2024-07-01",
    source: "Google",
  },
  {
    name: "Anthony Colletti (ascolletti)",
    location: "Rogers",
    text: "Best Mexican food I have had in long time.",
    date: "2025-04-01",
    source: "Google",
  },
  {
    name: "Jimmy Walker",
    location: "Rogers",
    text: "I have always had a good experience dining in and taking out. Live music on Monday is usually pretty good. Never had a bad dish. Good margaritas.",
    date: "2023-07-01",
    source: "Google",
  },
  {
    name: "Kylee Brooke",
    location: "Rogers",
    text: "Delicious food, service was fast, and the atmosphere was just perfect! Great place for friends and family.",
    date: "2024-10-01",
    source: "Google",
  },
  {
    name: "Sara Golden",
    location: "Rogers",
    text: "Today, my husband and I hosted 18 family members from 3 generations for an end of summer / school is starting gathering. The food arrived in a timely manner, especially with only two chefs in the kitchen. Everyone enjoyed their meal. Not one complaint. Thanks to all at EP#3 for making a family gathering even more special.",
    date: "2024-08-01",
    source: "Google",
  },
  {
    name: "Jeannie Jones",
    location: "Rogers",
    text: "Everything I've had here has been wonderful! I've had several full dinners here so far and a couple of times just fries, which are perfect! I understand the Mexican pizza is also great but haven't tried it yet. Thumbs up!",
    date: "2021-12-01",
    source: "Google",
  },
  {
    name: "Abc",
    location: "Rogers",
    text: "Such a good place to eat food is great, and the atmosphere is nice.",
    date: "2024-10-01",
    source: "Google",
  },
  {
    name: "Briana Cole (Bri)",
    location: "Rogers",
    text: "I love El Pueblito. As a family we go at least once a week. Food is amazing, beverages are cold and the prices are great. The owner and wait staff are all very nice and never leave you hanging. I’ve never had bad service.",
    date: "2022-07-01",
    source: "Google",
  },
  {
    name: "Gia George",
    location: "Rogers",
    text: "It's great to bring out the family! Also great for birthdays. Good food, service, and atmosphere.",
    date: "2024-06-01",
    source: "Google",
  },
  {
    name: "Ramon Portilla",
    location: "Rogers",
    text: "This chain with 4 restaurants in the area, does a great job not only with quality food but great customer service. #Autisticfriendly",
    date: "2024-12-01",
    source: "Google",
  },
  {
    name: "Mario P",
    location: "Rogers",
    text: "Enjoyed every bit of dining here for the first time which was on Cinco de mayo. Sat at a table incredibly fast, food came out perfect as well as the drinks and just overall a great time for dinner and the staff was beyond nice and helpful.",
    date: "2023-05-05",
    source: "Google",
  },
  {
    name: "Serene Desires",
    location: "Rogers",
    text: "The prices are extremely cheap for how amazing the food is. Both dinner entrees were perfect and it will definitely fill you up. Total bill for two people was only $25 and some change.",
    date: "2022-04-01",
    source: "Google",
  },
  {
    name: "Ronald Stern",
    location: "Rogers",
    text: "The food & service did not disappoint. 5 stars...so happy to have you as our neighbor. Looking forward to many more great times at this festive destination.",
    date: "2021-12-01",
    source: "Google",
  },
  {
    name: "The KNITWIT",
    location: "Rogers",
    text: "All the staff were amazingly friendly above and beyond anywhere else! The food was out in no time flat and was absolutely delicious! Will definitely be going back!",
    date: "2023-07-01",
    source: "Google",
  },
  {
    name: "alan robinson",
    location: "Rogers",
    text: "Food was amazing really . I couldn't believe how good the food was we had Cana sada Tacos and enchiladas, they were great.",
    date: "2024-08-01",
    source: "Google",
  },
  {
    name: "Madalyn Townsley",
    location: "Rogers",
    text: "We love El Pueblito and couldn’t have asked for a better restaurant to join the prairie creek family. We ALWAYS have great food and great service! Marco is our favorite but all the staff is wonderful!",
    date: "2023-11-01",
    source: "Google",
  },
  {
    name: "Keli Gonzales",
    location: "Rogers",
    text: "So glad this place is opened, it’s so close to home. This place is great! The service, the food and the drinks. Our waiter was Saul! He was a very kind man. Great service from him! My husband and I will definitely we coming back very soon! 🤗",
    date: "2020-12-01",
    source: "Google",
  },
  {
    name: "Steve Joplin",
    location: "Rogers",
    text: "Great food and friendly staff. We ate there twice in four days while visiting the area we liked it so much.",
    date: "2023-05-01",
    source: "Google",
  },
  {
    name: "Christina Finley",
    location: "Rogers",
    text: "Great, authentic Mexican food!",
    date: "2024-04-01",
    source: "Google",
  },
  {
    name: "James Johnston",
    location: "Rogers",
    text: "This place is a must. I love good Mexican food. I like TexMex, but this is closer to Cali Mexican food. Kursty was amazing, awesome service and great. Food was amazing, and plenty of seating.",
    date: "2024-04-01",
    source: "Google",
  },
  {
    name: "Brandi Brown",
    location: "Rogers",
    text: "Have been here 4 or 5 times now and the staff is consistently pleasant and attentive, and food is Great!! So glad to have such a reasonably priced, delicious restaurant so close to home!!",
    date: "2021-08-01",
    source: "Google",
  },
  {
    name: "Megan Guerra",
    location: "Rogers",
    text: "Fast service for a group of 11. Food was delicious! Fajitas were huge. Cantarito hit the spot. We will be back.",
    date: "2023-04-01",
    source: "Google",
  },
  {
    name: "Diane Benson",
    location: "Rogers",
    text: "1st time there-loved it! Food great, but people the Best! Really nice wait staff & owner. They make you want to come back!",
    date: "2021-11-01",
    source: "Google",
  },
  {
    name: "Brian Ipsen MD",
    location: "Rogers",
    text: "Wonderful service, food and atmosphere! Will definitely come again.",
    date: "2024-06-01",
    source: "Google",
  },
  {
    name: "Craig Sutter",
    location: "Rogers",
    text: "Nice authentic Mexican food in Prairie Creek. Food was excellent and so was the service, recommend if you want something better than the typical Tex mex. Prices are very reasonable.",
    date: "2023-09-01",
    source: "Google",
  },
  {
    name: "Jason Fabrizio",
    location: "Rogers",
    text: "For the price you get stuffed and then they bring more food to you. This was a good decision for a business lunch.",
    date: "2024-06-01",
    source: "Google",
  },
  {
    name: "Patricia Ebbs",
    location: "Rogers",
    text: "They have good food at a great price. The portions are great. We always have leftovers to take home.",
    date: "2023-08-01",
    source: "Google",
  },
  {
    name: "Lou & Millie Holtz",
    location: "Rogers",
    text: "Great food and service. Monday night specials....Lou",
    date: "2024-09-01",
    source: "Google",
  },
  {
    name: "Sam Parker",
    location: "Rogers",
    text: "Great food and service !!",
    date: "2021-07-01",
    source: "Google",
  },
  {
    name: "Kieran",
    location: "Rogers",
    text: "Classic Mexican restaurant with fair prices and good food. My fiancée and I were thrilled to see that the COVID shutdowns just prior to the opening did not finish them off before we could give them a try.",
    date: "2023-07-01",
    source: "Google",
  },
  {
    name: "Becky Sydow",
    location: "Rogers",
    text: "Wonderful people and service! Nice layed back old pub feel. Great space for private dinner parties or events. Could comfortably fit 80 people.",
    date: "2018-08-01",
    source: "Google",
  },
  {
    name: "Tim Malone",
    location: "Rogers",
    text: "So happy they are finally open! The inside is light and airy compared to the place that was there before, and the food is amazing. Can’t wait to go back and try the street tacos.",
    date: "2020-09-01",
    source: "Google",
  },
  {
    name: "Paula Miller",
    location: "Rogers",
    text: "Great service and very hot food when it comes out. Very good prices too. 2 people can eat for under 40 bucks.",
    date: "2023-05-01",
    source: "Google",
  },
  {
    name: "Sea",
    location: "Rogers",
    text: "Very Nice.",
    date: "2025-06-01",
    source: "Google",
  },
  {
    name: "Kenneth winter",
    location: "Rogers",
    text: "Great service, good margaritas, nice bar. Chorizo in the cheese dip appetizer, Chorqueso, is very good. The enchiladas mesquite is a plate full of good cheesy deliciousness.",
    date: "2021-08-01",
    source: "Google",
  },
  {
    name: "Sarah Penner",
    location: "Rogers",
    text: "I had the pollo de pueblito and it was delicious!",
    date: "2023-07-01",
    source: "Google",
  },
  {
    name: "Loko Franco",
    location: "Rogers",
    text: "Great food, drinks, & awesome service 🕶",
    date: "2021-09-01",
    source: "Google",
  },
  {
    name: "Rob G",
    location: "Rogers",
    text: "Didn't think it was gonna be as good as it is. And surprisingly it's cheaper than most other Mexican food places in town! Their salsa is the best for sure.",
    date: "2021-06-01",
    source: "Google",
  },
  {
    name: "Sam Humpherys",
    location: "Rogers",
    text: "Really good food at very reasonable prices. My wife and I love eating here when we are in town.",
    date: "2023-06-01",
    source: "Google",
  },
  {
    name: "BLOODHOUND85",
    location: "Rogers",
    text: "Finally a restaurant in Prairie Creek with a family friendly atmosphere with good food. Service was fast and accurate. Definitely Recommend!!",
    date: "2022-04-01",
    source: "Google",
  },
  {
    name: "itsjst biz itsjstbiz",
    location: "Rogers",
    text: "If you're headed to the lake or coming, great place to stop and take a break. Large facility, plenty of seating. Also a full bar.",
    date: "2022-07-01",
    source: "Google",
  },
  {
    name: "Randal j Rhoades jr",
    location: "Rogers",
    text: "They have really great food and service.",
    date: "2022-09-01",
    source: "Google",
  },
  {
    name: "Mom First Wife Second",
    location: "Rogers",
    text: "Love this place! They have great food and great service at an affordable price! Plus, we enjoy visiting with the staff! 😊",
    date: "2018-10-01",
    source: "Google",
  },
  {
    name: "Joel Woodward",
    location: "Rogers",
    text: "Delicious food. Glad we decided to give it a try while we were down at the lake and would recommend it!",
    date: "2022-11-01",
    source: "Google",
  },
  {
    name: "Angela Smith",
    location: "Rogers",
    text: "Best Mexican food I have ever had by far. I always have the tamales with queso, I am NEVER disappointed!!!!",
    date: "2022-10-01",
    source: "Google",
  },
  {
    name: "Rachael Driggs",
    location: "Rogers",
    text: "Excellent food and great service!! One of our faves!",
    date: "2022-06-01",
    source: "Google",
  },
  {
    name: "T Williams",
    location: "Rogers",
    text: "Called in an order. It was lit! Nothing messed up, flavor on point. Price is great.",
    date: "2023-08-01",
    source: "Google",
  },
  {
    name: "Wendy Richardson",
    location: "Rogers",
    text: "Friendly, quick and delicious. Will definitely return.",
    date: "2024-10-01",
    source: "Google",
  },
  {
    name: "Audrey Putnam",
    location: "Rogers",
    text: "One of our favorites! Not particularly fancy, but consistently tasty, excellent service, fast, and reasonably priced!",
    date: "2023-07-01",
    source: "Google",
  },
  {
    name: "jay yates",
    location: "Rogers",
    text: "The food is awesome, the staff is awesome and they have live music on Mondays!",
    date: "2023-06-01",
    source: "Google",
  },
  {
    name: "Chad Tilghman",
    location: "Rogers",
    text: "My favorite Mexican restaurant or their Bella Vista location. Always friendly, food is never bad, and they are always very courteous.",
    date: "2022-12-01",
    source: "Google",
  },
  {
    name: "jovanna picazo",
    location: "Rogers",
    text: "Leslie, one of their great servers, was attentive as always. Love her. Will definitely dine in again.",
    date: "2023-05-01",
    source: "Google",
  },
  {
    name: "NotAlice",
    location: "Rogers",
    text: "I eat here a lot. Food has always been fresh, and quick.",
    date: "2022-10-01",
    source: "Google",
  },
  {
    name: "Scott Searles",
    location: "Rogers",
    text: "Fast good food at a reasonable price. It is our go to for Friday nights.",
    date: "2022-07-01",
    source: "Google",
  },
  {
    name: "Kasey Flanagan Hartley",
    location: "Rogers",
    text: "Wonderful food! Great prices.",
    date: "2024-08-01",
    source: "Google",
  },
  {
    name: "Roger Fahnert",
    location: "Rogers",
    text: "This is my favorite restaurant for Mexican food. Always great food, amazing service, and good price.",
    date: "2022-11-01",
    source: "Google",
  },
  {
    name: "RG Smith",
    location: "Rogers",
    text: "Great little bar! The cook will do whatever you want. Waitress was wonderful.",
    date: "2017-08-01",
    source: "Google",
  },
  {
    name: "Hilary Lehr",
    location: "Rogers",
    text: "Fajitas were great. Reasonable prices.",
    date: "2024-08-01",
    source: "Google",
  },
  {
    name: "Heath Woods",
    location: "Rogers",
    text: "This place is awesome! Best Mexican food I’ve eaten in years! Will be back soon!",
    date: "2021-06-01",
    source: "Google",
  },
  {
    name: "Aleisha Marie",
    location: "Rogers",
    text: "I love this place and it is so delicious! Thank you!",
    date: "2023-04-01",
    source: "Google",
  },
  {
    name: "R. Michael Pennington",
    location: "Rogers",
    text: "Great food! Reasonable price. Excellent value.",
    date: "2022-10-01",
    source: "Google",
  },
  {
    name: "Shauna Geers",
    location: "Rogers",
    text: "Always delicious 😋. I can honestly say we know the menu by heart and everything is top notch!",
    date: "2021-12-01",
    source: "Google",
  },
  {
    name: "Michael Begneaud",
    location: "Rogers",
    text: "We love Betty. Amazing service. Great pours on our favorite drinks.",
    date: "2018-05-01",
    source: "Google",
  },
  {
    name: "Beverly Vanek",
    location: "Rogers",
    text: "Fast friendly service. Great food. Best prices in town.",
    date: "2021-09-01",
    source: "Google",
  },
  {
    name: "Christina Cummings",
    location: "Rogers",
    text: "Really great food! Hot and fresh, great service!",
    date: "2022-12-01",
    source: "Google",
  },
  {
    name: "Benjamin Von Spreecken",
    location: "Rogers",
    text: "This place is amazing and the food is so delicious, great staff great vibe!!",
    date: "2022-07-01",
    source: "Google",
  },
  {
    name: "Meaghan Hampton",
    location: "Rogers",
    text: "Love the food and price.",
    date: "2021-08-01",
    source: "Google",
  },
  {
    name: "Denise Honn",
    location: "Rogers",
    text: "Clean place and the food is great quality!",
    date: "2023-07-01",
    source: "Google",
  },
  {
    name: "Richard Surly",
    location: "Rogers",
    text: "Very good. Great food and excellent service.",
    date: "2022-07-01",
    source: "Google",
  },
  {
    name: "Paul Herndon",
    location: "Rogers",
    text: "Love the people there. Both staff and customers. Great dirty margaritas.",
    date: "2017-09-01",
    source: "Google",
  },
  {
    name: "steve reese",
    location: "Rogers",
    text: "Their parking lot is always full on weekends & often weekdays = good food & good people.",
    date: "2017-09-01",
    source: "Google",
  },
  {
    name: "Scott McCune",
    location: "Rogers",
    text: "Can't beat the prices for Delicious Mexican food.",
    date: "2024-05-01",
    source: "Google",
  },
  {
    name: "Brian Phillips",
    location: "Rogers",
    text: "Good food good service Good drink all around good place!",
    date: "2022-08-01",
    source: "Google",
  },
  {
    name: "GoneMudden",
    location: "Rogers",
    text: "Good food, fast service and big portions.",
    date: "2021-11-01",
    source: "Google",
  },
  {
    name: "BmwMaster Goncalves",
    location: "Rogers",
    text: "This place is great, the food the service the price is highly recommended!!!",
    date: "2021-08-01",
    source: "Google",
  },
  {
    name: "Kali Eaken",
    location: "Rogers",
    text: "Great food, wonderful service, highly recommend!",
    date: "2022-05-01",
    source: "Google",
  },
  {
    name: "Theresa M",
    location: "Rogers",
    text: "Large portions. The service was good and so was the food.",
    date: "2021-09-01",
    source: "Google",
  },
  {
    name: "Tammy Gibson",
    location: "Rogers",
    text: "Friendly, great food, great service I love this place.",
    date: "2018-08-01",
    source: "Google",
  },
  {
    name: "Linda Watts",
    location: "Rogers",
    text: "The service was great and the food was delicious.",
    date: "2024-04-01",
    source: "Google",
  },
  {
    name: "candy gifford",
    location: "Rogers",
    text: "Had the buffet for thanksgiving. It was affordable and great food.",
    date: "2018-11-01",
    source: "Google",
  },
  {
    name: "Sam Preston",
    location: "Rogers",
    text: "Highly recommend the beerita. Great food too!",
    date: "2022-07-01",
    source: "Google",
  },
  {
    name: "Chris Herring",
    location: "Rogers",
    text: "As per usual, all was very good. Shrimp fajitas, chicken quesadilla, and molcajete.",
    date: "2022-09-01",
    source: "Google",
  },
  {
    name: "Patti Vogt",
    location: "Rogers",
    text: "A fast, tasty lunch. Fresh chips, good salsa.",
    date: "2024-07-01",
    source: "Google",
  },
  {
    name: "David Hounsley",
    location: "Rogers",
    text: "Fried oysters and Manny’s fish tacos!! Amazing 😁 great food and great service!!!",
    date: "2018-10-01",
    source: "Google",
  },
  {
    name: "Brenda Murphy",
    location: "Rogers",
    text: "What a wonderful little place for a Sunday brunch. Good homecooking.",
    date: "2017-09-01",
    source: "Google",
  },
  {
    name: "Bryan Beavers",
    location: "Rogers",
    text: "Delicious food, timely service, and friendly staff.",
    date: "2021-09-01",
    source: "Google",
  },
  {
    name: "Andrew Childress",
    location: "Rogers",
    text: "The best Mexican food and service all day everyday!",
    date: "2022-09-01",
    source: "Google",
  },
  {
    name: "ERIK GONZALEZ",
    location: "Rogers",
    text: "Good food good people! Nice environment!",
    date: "2018-11-01",
    source: "Google",
  },
  {
    name: "Daniel Karnish",
    location: "Rogers",
    text: "Great prime rib. Service from Betty was the best ever.",
    date: "2019-03-01",
    source: "Google",
  },
  {
    name: "Darrell Offutt",
    location: "Rogers",
    text: "Quiet and friendly. Food was good.",
    date: "2018-11-01",
    source: "Google",
  },
  {
    name: "Rae Ann Baughn",
    location: "Rogers",
    text: "The only place we go for our mexican food.",
    date: "2025-04-01",
    source: "Google",
  },
  {
    name: "William brower",
    location: "Rogers",
    text: "Good food. Open late on Sundays.",
    date: "2022-10-01",
    source: "Google",
  },
  {
    name: "Jorge Cruz",
    location: "Rogers",
    text: "Delicious food and good price 😋.",
    date: "2022-10-01",
    source: "Google",
  },
  {
    name: "ron arnott",
    location: "Rogers",
    text: "Good food at a good price.",
    date: "2024-04-01",
    source: "Google",
  },
  {
    name: "Kevin Harriman",
    location: "Rogers",
    text: "Hidden Gem. great prices, great food",
    date: "2021-05-01",
    source: "Google",
  },
  {
    name: "Valerie Mathews",
    location: "Rogers",
    text: "Excellent. Grilled steak fajita salad 🥗",
    date: "2021-06-01",
    source: "Google",
  },
  {
    name: "Global Comm",
    location: "Rogers",
    text: "Service and food were great.",
    date: "2023-10-01",
    source: "Google",
  },
  {
    name: "Amy Sanford",
    location: "Rogers",
    text: "Super service! Handled a large group very well!",
    date: "2021-09-01",
    source: "Google",
  },
  {
    name: "Jesse Cagle",
    location: "Rogers",
    text: "Wow. So many choices and huge servings.",
    date: "2023-08-01",
    source: "Google",
  },
  {
    name: "Ted Mayben",
    location: "Rogers",
    text: "Excellent food, excellent service.",
    date: "2022-06-01",
    source: "Google",
  },
  {
    name: "Joyce Kanetzky",
    location: "Rogers",
    text: "Delicious mexican food! Great service.",
    date: "2023-09-01",
    source: "Google",
  },
  {
    name: "Mary Jamieson",
    location: "Rogers",
    text: "Love this place great food and staff.",
    date: "2024-05-01",
    source: "Google",
  },
  {
    name: "Charles Bonner",
    location: "Rogers",
    text: "Huge menu! The meal was great!",
    date: "2021-07-01",
    source: "Google",
  },
  {
    name: "Dyann Butcher",
    location: "Rogers",
    text: "Awesome food!",
    date: "2024-09-01",
    source: "Google",
  },
  {
    name: "Billy Strunk",
    location: "Rogers",
    text: "Good Food, Good Service",
    date: "2023-09-01",
    source: "Google",
  },
  {
    name: "Madeline Fittz",
    location: "Rogers",
    text: "Great food and live music!!",
    date: "2022-10-01",
    source: "Google",
  },
  {
    name: "Daniel Sparks",
    location: "Rogers",
    text: "Great service and good food!",
    date: "2021-06-01",
    source: "Google",
  },
  {
    name: "Earlene Ivy",
    location: "Rogers",
    text: "Always very good. Never disappointed.",
    date: "2020-10-01",
    source: "Google",
  },
  {
    name: "Kory T",
    location: "Rogers",
    text: "Steak fajita chimichanga was absolutely delicious!!",
    date: "2020-11-01",
    source: "Google",
  },
  {
    name: "Paul T",
    location: "Rogers",
    text: "Very good, fun hangout.",
    date: "2024-04-01",
    source: "Google",
  },
  {
    name: "Tresa Morgan",
    location: "Rogers",
    text: "Good service, food, and price.",
    date: "2021-07-01",
    source: "Google",
  },
  {
    name: "Manos Stergen",
    location: "Rogers",
    text: "Good for a quick bite.",
    date: "2024-06-01",
    source: "Google",
  },
  {
    name: "Mike Doyle",
    location: "Rogers",
    text: "Love the food. Happy.",
    date: "2021-08-01",
    source: "Google",
  },
  {
    name: "gary venenga",
    location: "Rogers",
    text: "Food is always great.",
    date: "2020-11-01",
    source: "Google",
  },
  {
    name: "Joseph Stevens",
    location: "Rogers",
    text: "Great lil mex restaurant.",
    date: "2024-04-01",
    source: "Google",
  },
  {
    name: "vicki lehman",
    location: "Rogers",
    text: "Seafood fajitas very good 👍",
    date: "2021-06-01",
    source: "Google",
  },
  {
    name: "Liz Monigan",
    location: "Rogers",
    text: "Cute place with good Mexican food",
    date: "2020-09-01",
    source: "Google",
  },
  {
    name: "Mandyk Mandy",
    location: "Rogers",
    text: "great drinks and food",
    date: "2023-03-01",
    source: "Google",
  },
  {
    name: "Vicky Hess",
    location: "Rogers",
    text: "Was all around great",
    date: "2022-08-01",
    source: "Google",
  },
  {
    name: "Larry Carter",
    location: "Rogers",
    text: "Great place to eat",
    date: "2020-10-01",
    source: "Google",
  },
  {
    name: "Mac Gearhart",
    location: "Rogers",
    text: "Food was great.",
    date: "2021-07-01",
    source: "Google",
  },
  {
    name: "carol tarron",
    location: "Rogers",
    text: "Great",
    date: "2023-04-01",
    source: "Google",
  },
  {
    name: "Deborah A Mejia",
    location: "Rogers",
    text: "Superb, Kid-friendliness: It was awesome.",
    date: "2022-09-01",
    source: "Google",
  },
  {
    name: "Sebastian Licon",
    location: "Rogers",
    text: "Really good",
    date: "2022-10-01",
    source: "Google",
  },
  {
    name: "Jeff Gardner",
    location: "Rogers",
    text: "Fantastic",
    date: "2020-10-01",
    source: "Google",
  },
  {
    name: "Tim Albrecht",
    location: "Rogers",
    text: "Great service",
    date: "2017-08-01",
    source: "Google",
  },
  {
    name: "kurt kanetzky",
    location: "Rogers",
    text: "Excellent food and service",
    date: "2021-08-01",
    source: "Google",
  },
  {
    name: "Renee Blunkall",
    location: "Rogers",
    text: "Delicious!",
    date: "2022-10-01",
    source: "Google",
  },
  {
    name: "Kait Uribe",
    location: "Rogers",
    text: "Yum",
    date: "2020-08-01",
    source: "Google",
  },
];

// Drink items that should link to the drinks page
export const DRINK_ITEMS = [
  // NON-ALCOHOLIC DRINKS
  "Coke",
  "Diet Coke",
  "Coke Zero",
  "Dr Pepper",
  "Diet Dr Pepper",
  "Sprite",
  "Iced Tea",
  "Coffee",
  "Milk",
  "Horchata",

  // MARGARITAS
  "Mango Margarita",
  "Lime Margarita",
  "Strawberry Margarita",
  "Peach Margarita",
  "Gold Margarita",
  "Margarita Trio",
  "Champagne Margarita",

  // BEERITAS
  "Lime Beerita",
  "Strawberry Beerita",
  "Peach Beerita",
  "Gold Beerita",

  // FROZEN DRINKS
  "Mango Daiquiri",
  "Lime Daiquiri",
  "Strawberry Daiquiri",
  "Peach Daiquiri",
  "Piña Colada",

  // WINE
  "Homemade Sangria",
  "White Zinfandel",
  "Chardonnay",
  "Pinot Grigio",
  "Cabernet",
  "Merlot",

  // MARGARITAS
  "Well Drinks",
  "Label Drinks",
  "Cantarito",

  // BEER - DRAFT
  "Bud Light",
  "Pacifico",
  "Modelo",
  "Michelob Ultra",
  "XX Amber",

  // BEER - MEXICAN
  "Corona",
  "Corona Light",
  "Dos XX Amber",
  "Dos XX Lager",
  "Negra Modelo",
  "Modelo Special",

  // BEER - DOMESTIC
  "Budweiser",
  "Coors Light",
  "Miller Light",
  "Blue Moon",

  // MICHELADAS
  "Clamato Michelada",
  "Michelada Domestic",
  "Michelada Import",

  // ADDITIONAL DRINK ITEMS FOR TESTIMONIAL HIGHLIGHTING
  "Soda",
  "Soft Drinks",
  "Beverages",
  "Water",
  "Juice",
  "Lemonade",
  "Tea",
  "Hot Tea",
  "Cold Tea",
  "Sweet Tea",
  "Unsweet Tea",
  "Margarita",
  "Margaritas",
  "MARGARITA",
  "MARGARITAS",
  "Beer",
  "Beers",
  "BEER",
  "BEERS",
  "Blue Margarita",
  "BLUE MARGARITA",
  "Paloma",
  "PALOMA",
  "Michelada",
  "Micheladas",
  "MICHELADA",
  "MICHELADAS",
];

// Function to check if a menu item is a drink
export const isDrinkItem = (item: string): boolean =>
  DRINK_ITEMS.some((drink) => drink.toLowerCase() === item.toLowerCase());

// Function to check if a color is too light or too dark for text visibility
const isLowContrastColor = (color: string): boolean => {
  const lightColors = ["#FDEAAF", "#FFFFFF", "#FDF2D2"];
  const darkColors = ["#1F2121", "#231F20", "#202020"];

  return lightColors.includes(color) || darkColors.includes(color);
};

// Function to normalize text for flexible matching (remove extra spaces, convert to lowercase)
const normalizeText = (text: string): string =>
  text.toLowerCase().replace(/\s+/g, " ").trim();

// Function to check if two phrases match regardless of word order
const phrasesMatch = (phrase1: string, phrase2: string): boolean => {
  const normalized1 = normalizeText(phrase1);
  const normalized2 = normalizeText(phrase2);

  // Split into words and sort
  const words1 = normalized1.split(" ").sort();
  const words2 = normalized2.split(" ").sort();

  // Check if arrays are equal
  return (
    words1.length === words2.length &&
    words1.every((word, index) => word === words2[index])
  );
};

// Catering keywords that should link to contact page
const CATERING_KEYWORDS = [
  "cater",
  "catering",
  "catered",
  "catering service",
  "catering services",
];

// Event keywords that should link to contact page for events
const EVENT_KEYWORDS = [
  "party",
  "event",
  "graduation",
  "quinceñera",
  "quinceanera",
  "birthday",
  "birthday party",
  "special event",
  "celebration",
  "anniversary",
  "wedding",
  "corporate event",
  "private event",
];

// Function to dynamically highlight menu items in text with a specific color and make them clickable links
export const highlightMenuItems = (text: string, color?: string): string => {
  let highlightedText = text;

  // First highlight catering keywords
  CATERING_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(
      `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    highlightedText = highlightedText.replace(regex, (match) => {
      const beforeMatch = highlightedText.substring(
        0,
        highlightedText.indexOf(match)
      );
      const openLinkCount = (beforeMatch.match(/<a href=/g) || []).length;
      const closeLinkCount = (beforeMatch.match(/<\/a>/g) || []).length;

      if (openLinkCount > closeLinkCount) {
        return match;
      }

      return `<a href="/contact?catering=true" style="color: #D42D40; text-decoration: underline; cursor: pointer;" class="hover:brightness-75 transition-all duration-200">${match}</a>`;
    });
  });

  // Then highlight event keywords
  EVENT_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(
      `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    highlightedText = highlightedText.replace(regex, (match) => {
      const beforeMatch = highlightedText.substring(
        0,
        highlightedText.indexOf(match)
      );
      const openLinkCount = (beforeMatch.match(/<a href=/g) || []).length;
      const closeLinkCount = (beforeMatch.match(/<\/a>/g) || []).length;

      if (openLinkCount > closeLinkCount) {
        return match;
      }

      return `<a href="javascript:void(0)" onclick="window.openEventDialog && window.openEventDialog()" style="color: #D42D40; text-decoration: underline; cursor: pointer;" class="hover:brightness-75 transition-all duration-200">${match}</a>`;
    });
  });

  // Combine all menu items (food + drinks) for highlighting
  const allMenuItems = [...MENU_ITEMS, ...DRINK_ITEMS];

  // Sort menu items by length (longest first) to avoid partial matches
  const sortedMenuItems = [...allMenuItems].sort((a, b) => b.length - a.length);

  for (const item of sortedMenuItems) {
    // Use the provided color, but fall back to high-contrast color if it's too light or dark
    let highlightColor = color || "#F8C839";

    if (color && isLowContrastColor(color)) {
      highlightColor = "#D42D40"; // High contrast red for visibility
    }

    // Determine the link destination using page-specific navigation
    const isDrink = isDrinkItem(item);
    let linkHref: string;

    if (isDrink) {
      // Drinks go to the drinks tab (page 7 -> tab 6 after DOTM was added)
      linkHref = "/menu?tab=6&page=7";
    } else {
      // Get the page number for the menu item and convert to tab
      const pageNumber = getPageNumberForMenuItem(item);
      const tabNumber = pageToMobileTab(pageNumber);
      linkHref = `/menu?tab=${tabNumber}&page=${pageNumber}`;
    }

    // Create a more flexible regex that can match word order variations
    const words = item.split(" ");
    if (words.length === 1) {
      // Single word - use exact match
      const regex = new RegExp(
        `\\b${item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "gi"
      );
      highlightedText = highlightedText.replace(regex, (match, offset) => {
        const beforeMatch = highlightedText.substring(0, offset);
        const openLinkCount = (beforeMatch.match(/<a href=/g) || []).length;
        const closeLinkCount = (beforeMatch.match(/<\/a>/g) || []).length;

        if (openLinkCount > closeLinkCount) {
          return match;
        }

        return `<a href="${linkHref}" style="color: ${highlightColor}; text-decoration: underline; cursor: pointer;" class="hover:brightness-75 transition-all duration-200">${match}</a>`;
      });
    } else {
      // Multi-word - use flexible matching
      const regex = new RegExp(
        `\\b${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+")}\\b`,
        "gi"
      );
      highlightedText = highlightedText.replace(regex, (match, offset) => {
        // Check if this match corresponds to our menu item (flexible word order)
        if (!phrasesMatch(match, item)) {
          return match;
        }

        const beforeMatch = highlightedText.substring(0, offset);
        const openLinkCount = (beforeMatch.match(/<a href=/g) || []).length;
        const closeLinkCount = (beforeMatch.match(/<\/a>/g) || []).length;

        if (openLinkCount > closeLinkCount) {
          return match;
        }

        return `<a href="${linkHref}" style="color: ${highlightColor}; text-decoration: underline; cursor: pointer;" class="hover:brightness-75 transition-all duration-200">${match}</a>`;
      });
    }
  }

  return highlightedText;
};

export const splitIntoSentences = (text: string) =>
  text.split(SENTENCE_SPLITTER);

export const formatForDesktop = (text: string, isSmallScreen: boolean) => {
  // For desktop, just return the text as-is for natural flow
  if (!isSmallScreen) {
    return text;
  }

  // For mobile, use the sentence-split formatting
  const sentences = splitIntoSentences(text);
  let result = "";
  let currentLine = "";
  let currentLineWords = 0;
  const MaxWordsPerLine = 8;

  const isShortSentence = (sentence: string) => {
    const words = sentence.trim().split(/\s+/);
    const lastWord = words.at(-1);
    return (
      words.length <= 4 || (lastWord ? /^\d+\/\d+$/.test(lastWord) : false)
    );
  };

  const shouldBreakLine = (sentence: string) => {
    const words = sentence.trim().split(/\s+/);
    if (currentLineWords >= MaxWordsPerLine) {
      return true;
    }
    if (currentLineWords > 0 && words.length <= 2) {
      return true;
    }
    if (currentLineWords + words.length < 3) {
      return false;
    }
    if (currentLineWords >= 3 && words.length >= 3) {
      return true;
    }
    return false;
  };

  for (let i = 0; i < sentences.length; i++) {
    let sentence = sentences[i].trim();
    const sentenceWordCount = sentence.split(/\s+/).length;

    if (sentenceWordCount >= 12) {
      sentence = breakLongSentence(sentence, isSmallScreen);
    }

    if (isShortSentence(sentence)) {
      const nextSentence = sentences[i + 1]?.trim();
      if (nextSentence && isShortSentence(nextSentence)) {
        currentLine += `${sentence} `;
        currentLineWords += sentenceWordCount;
        continue;
      }
      if (currentLineWords > 0) {
        result += `${currentLine.trim()}\n\n`;
        currentLine = "";
        currentLineWords = 0;
      }
      result += `${sentence} `;
      continue;
    }

    if (shouldBreakLine(sentence) && currentLineWords > 0) {
      result += `${currentLine.trim()}\n\n`;
      currentLine = "";
      currentLineWords = 0;
    }

    currentLine += `${sentence} `;
    currentLineWords += sentenceWordCount;

    if (currentLineWords >= MaxWordsPerLine) {
      result += `${currentLine.trim()}\n\n`;
      currentLine = "";
      currentLineWords = 0;
    }
  }

  if (currentLine.trim()) {
    result += currentLine.trim();
  }

  return result.trim();
};

export const breakLongSentence = (sentence: string, isSmallScreen: boolean) => {
  const Conjunctions = ["and", "or", "but", "nor", "for", "yet", "so"];
  const words = sentence.split(/\s+/);
  if (words.length < 11) {
    return sentence;
  }

  if (isSmallScreen) {
    // Try to find a conjunction near the middle for a natural break
    const mid = Math.floor(words.length / 2);
    const searchRange = Math.floor(words.length / 4); // Search +/- 25% of length

    // Look for conjunctions near the middle
    let bestBreakIndex = mid;
    for (
      let i = Math.max(1, mid - searchRange);
      i < Math.min(words.length - 1, mid + searchRange);
      i++
    ) {
      const word = words[i].toLowerCase().replace(/[.,!?;:]$/, "");
      if (Conjunctions.includes(word)) {
        // Found a conjunction - break after it
        bestBreakIndex = i + 1;
        break;
      }
    }

    return (
      words.slice(0, bestBreakIndex).join(" ") +
      "\n" +
      words.slice(bestBreakIndex).join(" ")
    );
  }

  return sentence;
};
