"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { carsAPI } from "@/lib/api/client";
import { useLocation } from "@/hooks/useLocation";
import {
  searchAndRank,
  type Car,
  type SearchFilters,
} from "@/lib/search/engine";
import { CITIES, SERVICE_CENTERS, getServiceCentersForCity, haversineDistance, type CityLocation } from "@/lib/location/cities";
import AdvancedSearchBar from "@/components/search/AdvancedSearchBar";
import AdvancedFilters from "@/components/search/AdvancedFilters";
import LocationFilter from "@/components/search/LocationFilter";
import CarCard from "@/components/CarCard";
import MapLegend from "@/components/map/MapLegend";
import ServiceCentersList from "@/components/map/ServiceCentersList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, LayoutGrid, Map, SlidersHorizontal, Building2 } from "lucide-react";

const InteractiveMap = dynamic(() => import("@/components/map/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-xl" style={{ height: "500px" }}>
      <div className="text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
        <p className="text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

interface CarResult {
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

export default function BuyCarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <BuyCarContent />
    </Suspense>
  );
}

function BuyCarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { location: detectedLocation } = useLocation();
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || searchParams.get("search") || searchParams.get("brand") || ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedCity, setSelectedCity] = useState<CityLocation | null>(null);
  const [showServiceCenters, setShowServiceCenters] = useState(true);
  const pageSize = 12;

  const [filters, setFilters] = useState<SearchFilters>({
    fuelType: "",
    transmission: "",
    minYear: "",
    maxYear: "",
    minPrice: "",
    maxPrice: "",
    minMileage: "",
    maxMileage: "",
    location: "",
    sortBy: "relevance",
  });

  // Auto-select detected city
  useEffect(() => {
    if (detectedLocation && !selectedCity) {
      const city = CITIES.find(
        (c) => c.name.toLowerCase() === detectedLocation.city.toLowerCase()
      );
      if (city) setSelectedCity(city);
    }
  }, [detectedLocation]);

  // Fetch all cars once
  useEffect(() => {
    const fetchAllCars = async () => {
      setLoading(true);
      try {
        const res = await carsAPI.search({ pageSize: 100 });
        setAllCars(res.data.cars || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCars();
  }, []);

  // Geo-fence: filter cars by selected city
  const cityFilteredCars = useMemo(() => {
    if (!selectedCity) return allCars;
    return allCars.filter((car) => {
      const carCity = car.location?.split(",")[0]?.trim().toLowerCase();
      return carCity === selectedCity.name.toLowerCase();
    });
  }, [allCars, selectedCity]);

  // Search + rank + paginate
  const { results, totalCount, totalPages } = useMemo(() => {
    const scored = searchAndRank(cityFilteredCars, searchQuery, filters);
    const total = scored.length;
    const pages = Math.ceil(total / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paged = scored.slice(start, start + pageSize);
    return { results: paged, totalCount: total, totalPages: pages };
  }, [cityFilteredCars, searchQuery, filters, currentPage]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, selectedCity]);

  const handleFilterChange = useCallback((partial: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      fuelType: "",
      transmission: "",
      minYear: "",
      maxYear: "",
      minPrice: "",
      maxPrice: "",
      minMileage: "",
      maxMileage: "",
      location: "",
      sortBy: "relevance",
    });
  }, []);

  // Map data
  const mapCenter = useMemo(() => {
    if (selectedCity) return { lat: selectedCity.lat, lng: selectedCity.lng };
    if (detectedLocation) return { lat: detectedLocation.latitude, lng: detectedLocation.longitude };
    return { lat: 20.5937, lng: 78.9629 }; // India center
  }, [selectedCity, detectedLocation]);

  const mapListings = useMemo(() => {
    return results.map((car) => ({
      id: car.id,
      title: car.title,
      price: car.price,
      lat: mapCenter.lat + (Math.random() - 0.5) * 0.08,
      lng: mapCenter.lng + (Math.random() - 0.5) * 0.08,
      fuelType: car.fuelType,
      transmission: car.transmission,
      year: car.year,
      imageUrl: car.imageUrl,
    }));
  }, [results, mapCenter]);

  const nearbyServiceCenters = useMemo(() => {
    if (!selectedCity) return SERVICE_CENTERS.slice(0, 6);
    return getServiceCentersForCity(selectedCity.name);
  }, [selectedCity]);

  const cityResultsBadge = selectedCity ? (
    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
      <MapPin className="h-3 w-3 mr-1" />
      Showing results in {selectedCity.name}
    </Badge>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-950 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              Buy Used Cars
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              Find your perfect pre-owned car with smart search and instant
              results
            </p>
          </div>

          {/* Location + Search Row */}
          <div className="max-w-3xl mx-auto space-y-3">
            <LocationFilter
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              detectedCity={detectedLocation?.city}
            />
            <AdvancedSearchBar
              cars={cityFilteredCars}
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={setSearchQuery}
              placeholder={`Search by brand, model...${selectedCity ? ` in ${selectedCity.name}` : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <AdvancedFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
              resultCount={totalCount}
            />
            {cityResultsBadge}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode("map")}
            >
              <Map className="h-4 w-4" />
              Map
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
            <p className="mt-3">Loading cars...</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <h3 className="text-lg font-bold mb-2">No cars found</h3>
              <p className="text-muted-foreground">
                {selectedCity
                  ? `No results in ${selectedCity.name}. Try expanding to all cities or adjusting filters.`
                  : searchQuery
                  ? `No results for "${searchQuery}". Try different keywords or clear filters.`
                  : "Try adjusting your filters"}
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "map" ? (
          <div className="space-y-4">
            {/* Map Legend */}
            <MapLegend />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2">
                <InteractiveMap
                  center={mapCenter}
                  zoom={selectedCity ? 12 : 5}
                  listings={mapListings}
                  serviceCenters={showServiceCenters ? nearbyServiceCenters : []}
                  onListingClick={(id) => router.push(`/car/${id}`)}
                  height="500px"
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Nearby Service Centers
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowServiceCenters(!showServiceCenters)}
                  >
                    {showServiceCenters ? "Hide" : "Show"}
                  </Button>
                </div>
                {showServiceCenters && (
                  <ServiceCentersList centers={nearbyServiceCenters} compact />
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg border transition-colors ${
                        page === currentPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
