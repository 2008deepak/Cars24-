import Fuse from "fuse.js";

export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  kmDriven?: number;
  fuelType?: string;
  transmission?: string;
  imageUrl: string;
  location: string;
  isVerified?: boolean;
}

export interface SearchFilters {
  fuelType: string;
  transmission: string;
  minYear: string;
  maxYear: string;
  minPrice: string;
  maxPrice: string;
  minMileage: string;
  maxMileage: string;
  location: string;
  sortBy: string;
}

export interface ScoredCar extends Car {
  score: number;
  matchReasons: string[];
}

const CURRENT_YEAR = new Date().getFullYear();

// Levenshtein distance for manual typo detection
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Fuzzy match check: returns true if the query is close enough to the target
export function fuzzyMatch(query: string, target: string, maxDistance: number = 2): boolean {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (t.includes(q)) return true;
  if (q.length < 3) return t.startsWith(q);

  const words = t.split(/\s+/);
  return words.some((word) => {
    const dist = levenshteinDistance(q, word);
    return dist <= maxDistance;
  });
}

// Calculate relevance score for a car
export function scoreCar(
  car: Car,
  query: string,
  filters: SearchFilters
): ScoredCar {
  let score = 0;
  const reasons: string[] = [];
  const q = query.toLowerCase().trim();

  if (q) {
    // Exact brand match = +10
    if (car.brand.toLowerCase() === q) {
      score += 10;
      reasons.push("Exact brand match");
    }
    // Brand starts with query = +8
    else if (car.brand.toLowerCase().startsWith(q)) {
      score += 8;
      reasons.push("Brand match");
    }
    // Fuzzy brand match = +6
    else if (fuzzyMatch(q, car.brand, 2)) {
      score += 6;
      reasons.push("Similar brand");
    }

    // Exact model match = +9
    if (car.model.toLowerCase() === q) {
      score += 9;
      reasons.push("Exact model match");
    }
    else if (car.model.toLowerCase().startsWith(q)) {
      score += 7;
      reasons.push("Model match");
    }
    else if (fuzzyMatch(q, car.model, 2)) {
      score += 5;
      reasons.push("Similar model");
    }

    // Title contains query = +4
    if (car.title.toLowerCase().includes(q)) {
      score += 4;
      reasons.push("Title match");
    }

    // Location match = +3
    if (car.location.toLowerCase().includes(q)) {
      score += 3;
      reasons.push("Location match");
    }
  }

  // Filter matches = +5 each
  if (filters.fuelType && car.fuelType?.toLowerCase() === filters.fuelType.toLowerCase()) {
    score += 5;
    reasons.push(`${filters.fuelType} fuel`);
  }
  if (filters.transmission && car.transmission?.toLowerCase() === filters.transmission.toLowerCase()) {
    score += 5;
    reasons.push(`${filters.transmission} transmission`);
  }

  // Recency bonus = +3 for cars less than 3 years old
  const age = CURRENT_YEAR - car.year;
  if (age <= 1) {
    score += 5;
    reasons.push("Brand new");
  } else if (age <= 3) {
    score += 3;
    reasons.push("Recent model");
  }

  // Verified seller bonus = +2
  if (car.isVerified) {
    score += 2;
    reasons.push("Verified seller");
  }

  // Low mileage bonus = +2
  if (car.kmDriven && car.kmDriven < 15000) {
    score += 2;
    reasons.push("Low mileage");
  }

  return { ...car, score, matchReasons: reasons };
}

// Create Fuse.js instance for fuzzy search suggestions
export function createFuseInstance(cars: Car[]): Fuse<Car> {
  return new Fuse(cars, {
    keys: [
      { name: "brand", weight: 0.4 },
      { name: "model", weight: 0.3 },
      { name: "title", weight: 0.2 },
      { name: "location", weight: 0.1 },
    ],
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 1,
    includeScore: true,
    includeMatches: true,
  });
}

// Get search suggestions from Fuse.js
export function getSuggestions(
  fuse: Fuse<Car>,
  query: string,
  limit: number = 6
): Array<{ text: string; category: string; car?: Car }> {
  if (!query || query.length < 1) return [];

  const results = fuse.search(query, { limit });
  const suggestions: Array<{ text: string; category: string; car?: Car }> = [];
  const seen = new Set<string>();

  for (const result of results) {
    const car = result.item;

    // Brand suggestion
    const brandKey = `brand:${car.brand.toLowerCase()}`;
    if (!seen.has(brandKey)) {
      seen.add(brandKey);
      suggestions.push({ text: car.brand, category: "Brand" });
    }

    // Model suggestion
    const modelKey = `model:${car.model.toLowerCase()}`;
    if (!seen.has(modelKey)) {
      seen.add(modelKey);
      suggestions.push({ text: `${car.brand} ${car.model}`, category: "Model", car });
    }
  }

  return suggestions.slice(0, limit);
}

// Apply filters and score results
export function searchAndRank(
  cars: Car[],
  query: string,
  filters: SearchFilters
): ScoredCar[] {
  let filtered = [...cars];

  // Apply hard filters first
  if (filters.fuelType) {
    filtered = filtered.filter(
      (c) => c.fuelType?.toLowerCase() === filters.fuelType.toLowerCase()
    );
  }
  if (filters.transmission) {
    filtered = filtered.filter(
      (c) => c.transmission?.toLowerCase() === filters.transmission.toLowerCase()
    );
  }
  if (filters.minYear) {
    filtered = filtered.filter((c) => c.year >= Number(filters.minYear));
  }
  if (filters.maxYear) {
    filtered = filtered.filter((c) => c.year <= Number(filters.maxYear));
  }
  if (filters.minPrice) {
    filtered = filtered.filter((c) => c.price >= Number(filters.minPrice));
  }
  if (filters.maxPrice) {
    filtered = filtered.filter((c) => c.price <= Number(filters.maxPrice));
  }
  if (filters.minMileage) {
    filtered = filtered.filter((c) => (c.kmDriven || 0) >= Number(filters.minMileage));
  }
  if (filters.maxMileage) {
    filtered = filtered.filter((c) => (c.kmDriven || 0) <= Number(filters.maxMileage));
  }
  if (filters.location) {
    filtered = filtered.filter((c) =>
      c.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  // Score each car
  const scored = filtered.map((car) => scoreCar(car, query, filters));

  // Sort by score (highest first), then by year (newest), then price (lowest)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.year !== a.year) return b.year - a.year;
    return a.price - b.price;
  });

  // Apply sort override
  if (filters.sortBy === "price_asc") {
    scored.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === "price_desc") {
    scored.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === "year_desc") {
    scored.sort((a, b) => b.year - a.year);
  } else if (filters.sortBy === "km_asc") {
    scored.sort((a, b) => (a.kmDriven || 0) - (b.kmDriven || 0));
  }
  // "relevance" is default (score-based)

  return scored;
}
