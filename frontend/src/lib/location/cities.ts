export interface CityLocation {
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export interface ServiceCenter {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  type: "inspection" | "pickup" | "service" | "hub";
  rating: number;
  phone: string;
  hours: string;
}

export interface PickupPoint {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  address: string;
}

// Major Indian cities with coordinates
export const CITIES: CityLocation[] = [
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Patna", state: "Bihar", lat: 25.6093, lng: 85.1376 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
];

// Service centers across major cities
export const SERVICE_CENTERS: ServiceCenter[] = [
  // Mumbai
  {
    id: "sc1", name: "Cars24 Mega Hub - Andheri", city: "Mumbai",
    address: "Western Express Highway, Andheri East", lat: 19.1197, lng: 72.8656,
    type: "hub", rating: 4.5, phone: "+91 22 4567 8900", hours: "9 AM - 8 PM",
  },
  {
    id: "sc2", name: "Cars24 Inspection Center - Borivali", city: "Mumbai",
    address: "SV Road, Borivali West", lat: 19.2307, lng: 72.8567,
    type: "inspection", rating: 4.3, phone: "+91 22 4567 8901", hours: "10 AM - 7 PM",
  },
  {
    id: "sc3", name: "Cars24 Pickup Point - Thane", city: "Mumbai",
    address: "Ghodbunder Road, Thane West", lat: 19.2183, lng: 72.9587,
    type: "pickup", rating: 4.2, phone: "+91 22 4567 8902", hours: "10 AM - 6 PM",
  },
  {
    id: "sc4", name: "Cars24 Service Center - Navi Mumbai", city: "Mumbai",
    address: "Vashi, Navi Mumbai", lat: 19.0759, lng: 72.9991,
    type: "service", rating: 4.4, phone: "+91 22 4567 8903", hours: "9 AM - 7 PM",
  },

  // Delhi
  {
    id: "sc5", name: "Cars24 Mega Hub - Janakpuri", city: "Delhi",
    address: "Janakpuri District Centre", lat: 28.6213, lng: 77.0816,
    type: "hub", rating: 4.6, phone: "+91 11 4567 8900", hours: "9 AM - 8 PM",
  },
  {
    id: "sc6", name: "Cars24 Inspection Center - Nehru Place", city: "Delhi",
    address: "Nehru Place Commercial Complex", lat: 28.5491, lng: 77.2534,
    type: "inspection", rating: 4.4, phone: "+91 11 4567 8901", hours: "10 AM - 7 PM",
  },
  {
    id: "sc7", name: "Cars24 Pickup Point - Rohini", city: "Delhi",
    address: "Sector 3, Rohini", lat: 28.7495, lng: 77.0654,
    type: "pickup", rating: 4.1, phone: "+91 11 4567 8902", hours: "10 AM - 6 PM",
  },

  // Bangalore
  {
    id: "sc8", name: "Cars24 Mega Hub - Whitefield", city: "Bangalore",
    address: "Whitefield Main Road", lat: 12.9698, lng: 77.7500,
    type: "hub", rating: 4.5, phone: "+91 80 4567 8900", hours: "9 AM - 8 PM",
  },
  {
    id: "sc9", name: "Cars24 Inspection Center - Koramangala", city: "Bangalore",
    address: "80 Feet Road, Koramangala 4th Block", lat: 12.9352, lng: 77.6245,
    type: "inspection", rating: 4.3, phone: "+91 80 4567 8901", hours: "10 AM - 7 PM",
  },
  {
    id: "sc10", name: "Cars24 Pickup Point - Jayanagar", city: "Bangalore",
    address: "4th Block, Jayanagar", lat: 12.9260, lng: 77.5830,
    type: "pickup", rating: 4.2, phone: "+91 80 4567 8902", hours: "10 AM - 6 PM",
  },
  {
    id: "sc11", name: "Cars24 Service Center - HSR Layout", city: "Bangalore",
    address: "HSR Layout Sector 2", lat: 12.9116, lng: 77.6389,
    type: "service", rating: 4.4, phone: "+91 80 4567 8903", hours: "9 AM - 7 PM",
  },

  // Chennai
  {
    id: "sc12", name: "Cars24 Hub - Velachery", city: "Chennai",
    address: "Velachery Main Road", lat: 12.9815, lng: 80.2180,
    type: "hub", rating: 4.4, phone: "+91 44 4567 8900", hours: "9 AM - 8 PM",
  },
  {
    id: "sc13", name: "Cars24 Pickup Point - T. Nagar", city: "Chennai",
    address: "Usman Road, T. Nagar", lat: 13.0418, lng: 80.2341,
    type: "pickup", rating: 4.1, phone: "+91 44 4567 8901", hours: "10 AM - 6 PM",
  },

  // Hyderabad
  {
    id: "sc14", name: "Cars24 Mega Hub - HITEC City", city: "Hyderabad",
    address: "HITEC City, Madhapur", lat: 17.4435, lng: 78.3772,
    type: "hub", rating: 4.5, phone: "+91 40 4567 8900", hours: "9 AM - 8 PM",
  },
  {
    id: "sc15", name: "Cars24 Inspection Center - Ameerpet", city: "Hyderabad",
    address: "Ameerpet Cross Roads", lat: 17.4156, lng: 78.4347,
    type: "inspection", rating: 4.3, phone: "+91 40 4567 8901", hours: "10 AM - 7 PM",
  },

  // Pune
  {
    id: "sc16", name: "Cars24 Hub - Kothrud", city: "Pune",
    address: "Karve Road, Kothrud", lat: 18.5074, lng: 73.8077,
    type: "hub", rating: 4.4, phone: "+91 20 4567 8900", hours: "9 AM - 8 PM",
  },
  {
    id: "sc17", name: "Cars24 Pickup Point - Hinjewadi", city: "Pune",
    address: "Hinjewadi Phase 2", lat: 18.5913, lng: 73.7389,
    type: "pickup", rating: 4.2, phone: "+91 20 4567 8901", hours: "10 AM - 6 PM",
  },

  // Kolkata
  {
    id: "sc18", name: "Cars24 Hub - Salt Lake", city: "Kolkata",
    address: "Salt Lake Sector V", lat: 22.5726, lng: 88.4106,
    type: "hub", rating: 4.3, phone: "+91 33 4567 8900", hours: "9 AM - 8 PM",
  },

  // Ahmedabad
  {
    id: "sc19", name: "Cars24 Hub - SG Highway", city: "Ahmedabad",
    address: "SG Highway, Thaltej", lat: 23.0510, lng: 72.5046,
    type: "hub", rating: 4.4, phone: "+91 79 4567 8900", hours: "9 AM - 8 PM",
  },

  // Jaipur
  {
    id: "sc20", name: "Cars24 Hub - Malviya Nagar", city: "Jaipur",
    address: "Malviya Nagar", lat: 26.8848, lng: 75.8081,
    type: "hub", rating: 4.3, phone: "+91 141 4567 8900", hours: "9 AM - 8 PM",
  },
];

export function getServiceCentersForCity(city: string): ServiceCenter[] {
  return SERVICE_CENTERS.filter(
    (sc) => sc.city.toLowerCase() === city.toLowerCase()
  );
}

export function getNearbyServiceCenters(
  lat: number,
  lng: number,
  radiusKm: number = 25
): ServiceCenter[] {
  return SERVICE_CENTERS.filter((sc) => {
    const distance = haversineDistance(lat, lng, sc.lat, sc.lng);
    return distance <= radiusKm;
  }).sort((a, b) => {
    const distA = haversineDistance(lat, lng, a.lat, a.lng);
    const distB = haversineDistance(lat, lng, b.lat, b.lng);
    return distA - distB;
  });
}

export function getCityByName(name: string): CityLocation | undefined {
  return CITIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}

// Haversine formula to calculate distance between two coordinates in km
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
