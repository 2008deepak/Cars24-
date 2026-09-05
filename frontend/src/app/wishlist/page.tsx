"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { wishlistAPI } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  ArrowLeft,
  MapPin,
  Fuel,
  Gauge,
  Calendar,
  Trash2,
  ShoppingCart,
} from "lucide-react";

interface WishlistCar {
  id: string;
  carId: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  kmDriven: number;
  fuelType: string;
  transmission: string;
  imageUrl: string;
  location: string;
  isVerified: boolean;
  addedAt: string;
}

export default function WishlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WishlistCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchWishlist();
  }, [user, router]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistAPI.getAll();
      setItems(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (carId: string) => {
    setRemoving(carId);
    try {
      await wishlistAPI.toggle(carId);
      setItems((prev) => prev.filter((item) => item.carId !== carId));
    } catch (err: any) {
      setError("Failed to remove from wishlist");
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-muted-foreground">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">
              {items.length} car{items.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {items.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold mb-2">No cars in your wishlist</h3>
              <p className="text-muted-foreground mb-6">
                Browse cars and tap the heart icon to save your favorites
              </p>
              <Link href="/buy">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Cars
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((car) => (
              <Card
                key={car.carId}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <Link href={`/car/${car.carId}`}>
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
                  </div>
                </Link>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/car/${car.carId}`}>
                      <h3 className="font-bold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {car.title}
                      </h3>
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {car.year}
                    </span>
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      {car.kmDriven.toLocaleString()} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      {car.fuelType}
                    </span>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3" />
                    {car.location}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-blue-600">
                      ₹{car.price.toLocaleString("en-IN")}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(car.carId);
                        }}
                        disabled={removing === car.carId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Link href={`/car/${car.carId}`}>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
