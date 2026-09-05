"use client";

import { useState, useEffect } from "react";
import { type LocationInfo } from "@/lib/pricing/rules";

interface UseLocationResult {
  location: LocationInfo | null;
  loading: boolean;
  error: string | null;
  manualLocation: (city: string, region: string) => void;
}

const FALLBACK_LOCATIONS: Record<string, LocationInfo> = {
  mumbai: { city: "Mumbai", region: "Maharashtra", country: "India", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
  delhi: { city: "Delhi", region: "Delhi", country: "India", latitude: 28.7041, longitude: 77.1025, timezone: "Asia/Kolkata" },
  bangalore: { city: "Bangalore", region: "Karnataka", country: "India", latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata" },
  chennai: { city: "Chennai", region: "Tamil Nadu", country: "India", latitude: 13.0827, longitude: 80.2707, timezone: "Asia/Kolkata" },
  kolkata: { city: "Kolkata", region: "West Bengal", country: "India", latitude: 22.5726, longitude: 88.3639, timezone: "Asia/Kolkata" },
  hyderabad: { city: "Hyderabad", region: "Telangana", country: "India", latitude: 17.385, longitude: 78.4867, timezone: "Asia/Kolkata" },
  pune: { city: "Pune", region: "Maharashtra", country: "India", latitude: 18.5204, longitude: 73.8567, timezone: "Asia/Kolkata" },
  shimla: { city: "Shimla", region: "Himachal Pradesh", country: "India", latitude: 31.1048, longitude: 77.1734, timezone: "Asia/Kolkata" },
  manali: { city: "Manali", region: "Himachal Pradesh", country: "India", latitude: 32.2432, longitude: 77.1892, timezone: "Asia/Kolkata" },
  jaipur: { city: "Jaipur", region: "Rajasthan", country: "India", latitude: 26.9124, longitude: 75.7873, timezone: "Asia/Kolkata" },
  lucknow: { city: "Lucknow", region: "Uttar Pradesh", country: "India", latitude: 26.8467, longitude: 80.9462, timezone: "Asia/Kolkata" },
  ahmedabad: { city: "Ahmedabad", region: "Gujarat", country: "India", latitude: 23.0225, longitude: 72.5714, timezone: "Asia/Kolkata" },
  goa: { city: "Panaji", region: "Goa", country: "India", latitude: 15.4909, longitude: 73.8278, timezone: "Asia/Kolkata" },
  darjeeling: { city: "Darjeeling", region: "West Bengal", country: "India", latitude: 27.041, longitude: 88.2663, timezone: "Asia/Kolkata" },
  nainital: { city: "Nainital", region: "Uttarakhand", country: "India", latitude: 29.3919, longitude: 79.4469, timezone: "Asia/Kolkata" },
  gangtok: { city: "Gangtok", region: "Sikkim", country: "India", latitude: 27.3389, longitude: 88.6065, timezone: "Asia/Kolkata" },
  leh: { city: "Leh", region: "Ladakh", country: "India", latitude: 34.1526, longitude: 77.5771, timezone: "Asia/Kolkata" },
  srinagar: { city: "Srinagar", region: "Jammu and Kashmir", country: "India", latitude: 34.0837, longitude: 74.7973, timezone: "Asia/Kolkata" },
};

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try ip-api.com first (free, no API key needed)
        const response = await fetch(
          "http://ip-api.com/json/?fields=status,country,regionName,city,lat,lon,timezone",
          { signal: AbortSignal.timeout(5000) }
        );

        if (!response.ok) throw new Error("IP API failed");

        const data = await response.json();

        if (data.status === "success" && data.country === "India") {
          setLocation({
            city: data.city || "Unknown",
            region: data.regionName || "Unknown",
            country: data.country,
            latitude: data.lat || 0,
            longitude: data.lon || 0,
            timezone: data.timezone || "Asia/Kolkata",
          });
          return;
        }

        // Fallback: try browser geolocation if IP fails
        throw new Error("IP detection outside India or failed");
      } catch (err) {
        console.warn("Auto-detection failed, using browser geolocation or default:", err);

        // Try browser geolocation
        if ("geolocation" in navigator) {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 3000,
                maximumAge: 600000,
              });
            });

            // Reverse geocode using ip-api
            const revRes = await fetch(
              `http://ip-api.com/json/${pos.coords.longitude},${pos.coords.latitude}?fields=status,country,regionName,city,lat,lon,timezone`,
              { signal: AbortSignal.timeout(3000) }
            );
            const revData = await revRes.json();

            if (revData.status === "success") {
              setLocation({
                city: revData.city || "Unknown",
                region: revData.regionName || "Unknown",
                country: revData.country || "India",
                latitude: revData.lat || pos.coords.latitude,
                longitude: revData.lon || pos.coords.longitude,
                timezone: revData.timezone || "Asia/Kolkata",
              });
              return;
            }
          } catch {
            // Geolocation failed
          }
        }

        // Final fallback: Delhi
        setLocation(FALLBACK_LOCATIONS.delhi);
        setError("Could not detect location. Using default: Delhi");
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

  const manualLocation = (city: string, region: string) => {
    const key = city.toLowerCase();
    if (FALLBACK_LOCATIONS[key]) {
      setLocation(FALLBACK_LOCATIONS[key]);
    } else {
      setLocation({
        city,
        region,
        country: "India",
        latitude: 0,
        longitude: 0,
        timezone: "Asia/Kolkata",
      });
    }
  };

  return { location, loading, error, manualLocation };
}
