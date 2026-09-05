"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Fuel, Gauge, Calendar, TrendingUp, TrendingDown, Heart } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { useAuth } from "@/context/AuthContext";
import { calculateDynamicPrice } from "@/lib/pricing/rules";
import { wishlistAPI } from "@/lib/api/client";

interface CarCardProps {
  car: {
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
  };
}

export default function CarCard({ car }: CarCardProps) {
  const { location: userLocation } = useLocation();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toggling, setToggling] = useState(false);

  const dynamicPricing = useMemo(() => {
    const carType = `${car.brand} ${car.model} ${car.title}`;
    return calculateDynamicPrice(
      car.price,
      carType,
      car.fuelType || "",
      car.transmission || "",
      userLocation
    );
  }, [car, userLocation]);

  useEffect(() => {
    if (!user) return;
    wishlistAPI
      .check(car.id)
      .then((res) => setIsWishlisted(res.data.isInWishlist))
      .catch(() => {});
  }, [car.id, user]);

  const handleWishlistToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      if (toggling) return;
      setToggling(true);
      try {
        const res = await wishlistAPI.toggle(car.id);
        setIsWishlisted(res.data.isInWishlist);
      } catch {
        // silent
      } finally {
        setToggling(false);
      }
    },
    [car.id, user, toggling]
  );

  const showPriceBadge = dynamicPricing.adjustment.category !== "neutral";
  const isUp = dynamicPricing.adjustment.category === "increase";

  return (
    <Link href={`/car/${car.id}`}>
      <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          <img
            src={car.imageUrl}
            alt={car.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {car.isVerified && (
            <Badge className="absolute top-3 left-3 bg-emerald-500 hover:bg-emerald-600">
              ✓ Verified
            </Badge>
          )}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm cursor-pointer"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted
                  ? "text-red-500 fill-red-500"
                  : "text-gray-400 hover:text-red-400"
              }`}
            />
          </button>
          {showPriceBadge && (
            <div
              className={`absolute bottom-3 right-3 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm ${
                isUp
                  ? "bg-emerald-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isUp ? "+" : ""}
              {dynamicPricing.adjustment.percentage}%
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
            {car.title}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {car.year}
            </span>
            {car.kmDriven && (
              <span className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                {car.kmDriven.toLocaleString()} km
              </span>
            )}
            {car.fuelType && (
              <span className="flex items-center gap-1">
                <Fuel className="h-3 w-3" />
                {car.fuelType}
              </span>
            )}
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {car.location}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-blue-600">
              ₹{dynamicPricing.recommendedPrice.toLocaleString("en-IN")}
            </span>
            {showPriceBadge && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{car.price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
