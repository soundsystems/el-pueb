export function formatReviewDate(dateString: string): string {
  const reviewDate = new Date(dateString);
  const now = new Date();

  // Calculate years difference more accurately
  const reviewYear = reviewDate.getFullYear();
  const currentYear = now.getFullYear();
  const yearsDiff = currentYear - reviewYear;

  // Recent reviews: current year and last calendar year always show full date
  // If we're in 2025, recent = 2025 and 2024 only
  const isWithinTwoYears = reviewYear >= currentYear - 1;

  // Edge case tolerance: only in Jan/Feb/Mar, reviews from late previous year can show "1 year ago"
  // Example: Mar 2025 + review from Oct-Dec 2023 = "1 year ago"
  const isEarlyInYear = now.getMonth() <= 2; // Jan, Feb, or Mar
  const toleranceCutoff = new Date(currentYear - 2, 9, 1); // October of 2 years ago
  const isInEdgeCaseTolerance =
    isEarlyInYear &&
    reviewDate >= toleranceCutoff &&
    reviewYear === currentYear - 2;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = months[reviewDate.getMonth()];
  const day = reviewDate.getDate();
  const year = reviewDate.getFullYear();

  // Add ordinal suffix to day
  const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  // If within the last 2 calendar years, show full date including year
  if (isWithinTwoYears) {
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  }

  // Edge case: if in Jan/Feb and review is from late previous year, show "1 year ago"
  if (isInEdgeCaseTolerance) {
    return "1 year ago";
  }

  // Everything else shows "X years ago"
  return `${yearsDiff} year${yearsDiff > 1 ? "s" : ""} ago`;
}

export function getSourceIcon(
  source: "google" | "yelp" | "Google" | "Yelp"
): string {
  switch (source.toLowerCase()) {
    case "google":
      return "🔍"; // Google search icon
    case "yelp":
      return "⭐"; // Yelp star icon
    default:
      return "📝"; // Default review icon
  }
}

export function getSourceLabel(
  source: "google" | "yelp" | "Google" | "Yelp"
): string {
  switch (source.toLowerCase()) {
    case "google":
      return "Google";
    case "yelp":
      return "Yelp";
    default:
      return "Review";
  }
}

export function isRecentReview(dateString: string): boolean {
  const reviewDate = new Date(dateString);
  const now = new Date();
  const currentYear = now.getFullYear();
  const reviewYear = reviewDate.getFullYear();

  // Recent reviews: only reviews from current year and last year (no tolerance)
  // Only reviews that would show full date with year are considered "recent"
  // Reviews in tolerance zone (showing "1 year ago") are NOT recent
  return reviewYear >= currentYear - 1;
}

export function filterReviewsByDate<T extends { date: string }>(
  reviews: T[]
): {
  recent: T[];
  older: T[];
} {
  const recent: T[] = [];
  const older: T[] = [];

  reviews.forEach((review) => {
    if (isRecentReview(review.date)) {
      recent.push(review);
    } else {
      older.push(review);
    }
  });

  return { recent, older };
}
