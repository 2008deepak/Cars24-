"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { carsAPI } from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/hooks/useLocation";
import { calculateDynamicPrice } from "@/lib/pricing/rules";
import { CITIES, getNearbyServiceCenters } from "@/lib/location/cities";
import DynamicPriceBadge from "@/components/DynamicPriceBadge";
import MapLegend from "@/components/map/MapLegend";
import ServiceCentersList from "@/components/map/ServiceCentersList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Fuel,
  Gauge,
  Calendar,
  Users,
  Heart,
  ArrowLeft,
  ShieldCheck,
  Car,
  Building2,
} from "lucide-react";

const InteractiveMap = dynamic(() => import("@/components/map/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-xl" style={{ height: "350px" }}>
      <div className="text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
        <p className="text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

interface CarDetail {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  kmDriven: number;
  fuelType: string;
  transmission: string;
  numberOfOwners: number;
  registrationNumber: string;
  description: string;
  imageUrl: string;
  location: string;
  isVerified: boolean;
}

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { location } = useLocation();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carsAPI
      .getById(id as string)
      .then((res) => setCar(res.data))
      .catch(() => router.push("/buy"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const dynamicPricing = useMemo(() => {
    if (!car) return null;

    const carType = `${car.brand} ${car.model} ${car.title}`;
    return calculateDynamicPrice(
      car.price,
      carType,
      car.fuelType,
      car.transmission,
      location
    );
  }, [car, location]);

  // Determine car's city from location string and find nearby service centers
  const carCity = useMemo(() => {
    if (!car?.location) return null;
    const cityName = car.location.split(",")[0]?.trim();
    return CITIES.find((c) => c.name.toLowerCase() === cityName.toLowerCase()) || null;
  }, [car?.location]);

  const nearbyCenters = useMemo(() => {
    if (!carCity) return [];
    return getNearbyServiceCenters(carCity.lat, carCity.lng, 20);
  }, [carCity]);

  const carMapCenter = useMemo(() => {
    if (carCity) return { lat: carCity.lat, lng: carCity.lng };
    return { lat: 20.5937, lng: 78.9629 };
  }, [carCity]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading car details...
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to listings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src={car.imageUrl}
              alt={car.title}
              className="w-full h-[250px] sm:h-[350px] lg:h-full object-cover"
            />
            {car.isVerified && (
              <Badge className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-base px-3 py-1 sm:px-4">
                <ShieldCheck className="h-4 w-4 mr-1" />
                Certified Car
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">{car.title}</h1>

              {/* Original Price */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  ₹{car.price.toLocaleString("en-IN")}
                </span>
                {dynamicPricing && dynamicPricing.adjustment.category !== "neutral" && (
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                    dynamicPricing.adjustment.category === "increase"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {dynamicPricing.adjustment.percentage > 0 ? "+" : ""}
                    {dynamicPricing.adjustment.percentage}% adjusted
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Pricing Badge */}
            {dynamicPricing && (
              <DynamicPriceBadge pricing={dynamicPricing} />
            )}

            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { icon: Calendar, label: "Year", value: car.year },
                    { icon: Gauge, label: "Kms Driven", value: `${car.kmDriven?.toLocaleString()} km` },
                    { icon: Fuel, label: "Fuel Type", value: car.fuelType },
                    { icon: Car, label: "Transmission", value: car.transmission },
                    { icon: Users, label: "Owners", value: car.numberOfOwners },
                    { icon: MapPin, label: "Location", value: car.location },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <item.icon className="h-3 w-3" />
                        {item.label}
                      </span>
                      <span className="font-semibold text-sm mt-1">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {car.description && (
              <div>
                <h3 className="font-bold text-lg mb-2">Description</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {car.description}
                </p>
              </div>
            )}

            <Separator />

            <div className="flex gap-3">
              {user ? (
                <Link href={`/book-appointment/${car.id}`} className="flex-1">
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    Book Appointment
                  </Button>
                </Link>
              ) : (
                <Link href="/login" className="flex-1">
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    Login to Book
                  </Button>
                </Link>
              )}
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{car.location}</p>
                  {car.isVerified && (
                    <p className="text-xs text-emerald-600 font-medium">
                      ✓ Verified Seller
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Nearby Service Centers Section */}
        {nearbyCenters.length > 0 && (
          <div className="mt-10">
            <Separator className="mb-8" />
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-extrabold">
                Nearby Cars24 Service Centers
              </h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Visit a Cars24 hub near {carCity?.name || car.location} for inspection, pickup, or service
            </p>

            <MapLegend />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              {/* Map */}
              <div className="lg:col-span-2">
                <InteractiveMap
                  center={carMapCenter}
                  zoom={12}
                  listings={[{
                    id: car.id,
                    title: car.title,
                    price: car.price,
                    lat: carMapCenter.lat + 0.005,
                    lng: carMapCenter.lng + 0.005,
                    fuelType: car.fuelType,
                    transmission: car.transmission,
                    year: car.year,
                    imageUrl: car.imageUrl,
                  }]}
                  serviceCenters={nearbyCenters}
                  height="350px"
                />
              </div>

              {/* List */}
              <div>
                <ServiceCentersList centers={nearbyCenters.slice(0, 4)} compact />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
