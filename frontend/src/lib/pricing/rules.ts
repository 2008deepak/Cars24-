// Hilly / mountainous regions in India
const HILLY_REGIONS = [
  "jammu and kashmir",
  "himachal pradesh",
  "uttarakhand",
  "sikkim",
  "arunachal pradesh",
  "meghalaya",
  "manipur",
  "mizoram",
  "nagaland",
  "tripura",
  "assam",
  "ladakh",
  "darjeeling",
  "shimla",
  "manali",
  "mussoorie",
  "nainital",
  "munnar",
  "ooty",
  "kodaikanal",
  "gangtok",
  "leh",
  "pahalgam",
  "sonamarg",
];

// Metro cities in India
const METRO_CITIES = [
  "mumbai",
  "delhi",
  "bangalore",
  "bengaluru",
  "chennai",
  "kolkata",
  "hyderabad",
  "pune",
  "ahmedabad",
  "surat",
  "jaipur",
  "lucknow",
  "kanpur",
  "nagpur",
  "indore",
  "thane",
  "bhopal",
  "patna",
  "vadodara",
  "ghaziabad",
  "ludhiana",
  "agra",
  "noida",
  "gurgaon",
  "gurugram",
  "faridabad",
];

// Monsoon months in India: June to September
const MONSOON_MONTHS = [5, 6, 7, 8]; // 0-indexed (June=5, Sept=8)

// Winter months: November to February
const WINTER_MONTHS = [10, 11, 0, 1];

// Summer months: March to May
const SUMMER_MONTHS = [2, 3, 4];

// Fuel spike months (when petrol/diesel prices historically peak)
const FUEL_SPIKE_MONTHS = [4, 5, 6]; // May, June, July

export interface LocationInfo {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PricingAdjustment {
  multiplier: number;
  percentage: number;
  reason: string;
  category: "increase" | "decrease" | "neutral";
}

export interface DynamicPriceResult {
  originalPrice: number;
  recommendedPrice: number;
  adjustment: PricingAdjustment;
  location: LocationInfo | null;
  month: number;
  season: string;
}

function isHillyRegion(region: string, city: string): boolean {
  const r = region.toLowerCase();
  const c = city.toLowerCase();
  return (
    HILLY_REGIONS.some((h) => r.includes(h) || c.includes(h)) ||
    region.toLowerCase().includes("himal")
  );
}

function isMetroCity(city: string): boolean {
  const c = city.toLowerCase();
  return METRO_CITIES.some((m) => c.includes(m));
}

function getSeason(month: number): string {
  if (MONSOON_MONTHS.includes(month)) return "monsoon";
  if (WINTER_MONTHS.includes(month)) return "winter";
  if (SUMMER_MONTHS.includes(month)) return "summer";
  return "autumn";
}

function normalizeFuelType(fuelType: string): string {
  const f = fuelType.toLowerCase();
  if (f.includes("diesel")) return "diesel";
  if (f.includes("petrol") || f.includes("gasoline")) return "petrol";
  if (f.includes("cng")) return "cng";
  if (f.includes("electric") || f.includes("ev")) return "electric";
  return "petrol";
}

function normalizeTransmission(transmission: string): string {
  const t = transmission.toLowerCase();
  if (t.includes("auto")) return "automatic";
  return "manual";
}

export function calculateDynamicPrice(
  basePrice: number,
  carType: string,
  fuelType: string,
  transmission: string,
  location: LocationInfo | null,
  month?: number
): DynamicPriceResult {
  const currentMonth = month ?? new Date().getMonth();
  const season = getSeason(currentMonth);
  let multiplier = 1.0;
  const reasons: string[] = [];

  const isSUV =
    carType.toLowerCase().includes("suv") ||
    carType.toLowerCase().includes("4x4") ||
    carType.toLowerCase().includes("4wd") ||
    carType.toLowerCase().includes("jeep") ||
    carType.toLowerCase().includes("fortuner") ||
    carType.toLowerCase().includes("endeavour") ||
    carType.toLowerCase().includes("scorpio") ||
    carType.toLowerCase().includes("xuv") ||
    carType.toLowerCase().includes("creta") ||
    carType.toLowerCase().includes("seltos");

  const isHatchback =
    carType.toLowerCase().includes("hatchback") ||
    carType.toLowerCase().includes("mini") ||
    carType.toLowerCase().includes("alto") ||
    carType.toLowerCase().includes("wagon") ||
    carType.toLowerCase().includes("i10") ||
    carType.toLowerCase().includes("i20") ||
    carType.toLowerCase().includes("swift") ||
    carType.toLowerCase().includes("bolt") ||
    carType.toLowerCase().includes("tiago") ||
    carType.toLowerCase().includes("polo");

  const isSedan =
    carType.toLowerCase().includes("sedan") ||
    carType.toLowerCase().includes("city") ||
    carType.toLowerCase().includes("verna") ||
    carType.toLowerCase().includes("cerna") ||
    carType.toLowerCase().includes("aura") ||
    carType.toLowerCase().includes("dzire") ||
    carType.toLowerCase().includes("amaze") ||
    carType.toLowerCase().includes("slavia") ||
    carType.toLowerCase().includes("virtus");

  const fuel = normalizeFuelType(fuelType);
  const isDiesel = fuel === "diesel";

  const region = location?.region || "";
  const city = location?.city || "";
  const inHills = isHillyRegion(region, city);
  const inMetro = isMetroCity(city);

  // Rule 1: SUV in hilly regions during monsoon → +8% to +12%
  if (isSUV && inHills && season === "monsoon") {
    multiplier += 0.12;
    reasons.push("High seasonal demand for SUVs in hilly region during monsoon");
  } else if (isSUV && inHills) {
    multiplier += 0.05;
    reasons.push("SUVs are in high demand in hilly regions");
  } else if (isSUV && season === "monsoon") {
    multiplier += 0.06;
    reasons.push("Monsoon season increases demand for SUVs");
  }

  // Rule 2: Diesel SUVs get extra bump during monsoon in hills
  if (isSUV && isDiesel && inHills && season === "monsoon") {
    multiplier += 0.04;
    reasons.push("Diesel SUVs preferred for terrain and fuel efficiency");
  }

  // Rule 3: Metro + fuel spike months + hatchback → -3% to -5%
  if (inMetro && FUEL_SPIKE_MONTHS.includes(currentMonth) && isHatchback) {
    multiplier -= 0.04;
    reasons.push("Fuel price impact reduces demand for small hatchbacks in metros");
  } else if (inMetro && isHatchback) {
    multiplier -= 0.02;
    reasons.push("Metro market saturation for hatchbacks");
  }

  // Rule 4: Winter in hilly regions → diesel vehicles get demand boost
  if (inHills && season === "winter" && isDiesel) {
    multiplier += 0.05;
    reasons.push("Diesel vehicles preferred in cold hilly terrain");
  }

  // Rule 5: EV bonus in metros during fuel spikes
  if (inMetro && FUEL_SPIKE_MONTHS.includes(currentMonth) && fuel === "electric") {
    multiplier += 0.08;
    reasons.push("Rising fuel prices increase EV demand in metros");
  }

  // Rule 6: Automatic transmission premium in metros
  if (inMetro && normalizeTransmission(transmission) === "automatic") {
    multiplier += 0.03;
    reasons.push("Automatic transmission has higher demand in metro traffic");
  }

  // Rule 7: Summer in hilly regions → any car gets a bump (tourism)
  if (inHills && season === "summer") {
    multiplier += 0.04;
    reasons.push("Tourist season drives up car demand in hill stations");
  }

  // Clamp multiplier between 0.85 and 1.25
  multiplier = Math.max(0.85, Math.min(1.25, multiplier));

  const percentage = Math.round((multiplier - 1) * 100);
  const recommendedPrice = Math.round(basePrice * multiplier);

  let category: "increase" | "decrease" | "neutral" = "neutral";
  if (multiplier > 1.005) category = "increase";
  else if (multiplier < 0.995) category = "decrease";

  const primaryReason =
    reasons.length > 0
      ? reasons[0]
      : "Current market conditions suggest this is a fair price";

  return {
    originalPrice: basePrice,
    recommendedPrice,
    adjustment: {
      multiplier,
      percentage,
      reason: primaryReason,
      category,
    },
    location,
    month: currentMonth,
    season,
  };
}
