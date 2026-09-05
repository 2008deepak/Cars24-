"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { carsAPI } from "@/lib/api/client";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowRight,
  Car,
  FileText,
  Shield,
  IndianRupee,
  BadgeCheck,
  Wrench,
} from "lucide-react";

interface FeaturedCar {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  imageUrl: string;
  location: string;
  isVerified?: boolean;
}

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState<FeaturedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    carsAPI
      .getFeatured()
      .then((res) => setFeaturedCars(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buy?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const services = [
    { icon: Search, label: "Find car", href: "/buy", color: "text-blue-600", bg: "bg-blue-100" },
    { icon: Car, label: "Sell car", href: "/sell", color: "text-emerald-600", bg: "bg-emerald-100" },
    { icon: IndianRupee, label: "Car loan", href: "/loans", color: "text-purple-600", bg: "bg-purple-100" },
    { icon: Wrench, label: "Maintenance", href: "/maintenance", color: "text-amber-600", bg: "bg-amber-100" },
    { icon: Shield, label: "Get car checked", href: "/car-check", color: "text-rose-600", bg: "bg-rose-100" },
    { icon: FileText, label: "Vehicle history", href: "/challan", color: "text-violet-600", bg: "bg-violet-100" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[400px] sm:h-[460px] lg:h-[520px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent" />

        <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 leading-tight">
            Welcome to{" "}
            <span className="inline-flex items-center">
              <span className="bg-blue-600 text-white font-extrabold px-2 sm:px-3 py-1 rounded-md text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                CARS
              </span>
              <span className="text-orange-500 font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl ml-1">
                24
              </span>
            </span>
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 sm:mb-8 leading-tight">
            better drives,
            <br />
            better lives.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl bg-white rounded-xl p-1.5 sm:p-2 flex items-center shadow-2xl">
            <Search className="h-5 w-5 text-gray-400 ml-2 sm:ml-3 shrink-0" />
            <Input
              type="text"
              placeholder="Search for your favorite cars"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base h-10 sm:h-12 flex-1 min-w-0"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 px-4 sm:px-8 rounded-lg shrink-0 text-sm sm:text-base">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative -mt-12 sm:-mt-16 lg:-mt-20 z-10 max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8">
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
            {services.map((s) => (
              <Link key={s.label} href={s.href} className="flex flex-col items-center gap-2 sm:gap-3 group">
                <div className={`w-11 h-11 sm:w-14 sm:h-14 ${s.bg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <s.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${s.color}`} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors text-center leading-tight">
                  {s.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Featured Cars</h2>
          <Link href="/buy">
            <Button variant="outline" className="gap-2 text-sm">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading cars...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 mb-8 sm:mb-12">
            Why Choose Cars24?
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Search, title: "Thorough Inspection", desc: "300+ quality checks on every car" },
              { icon: BadgeCheck, title: "Verified Listings", desc: "All documents verified" },
              { icon: IndianRupee, title: "Best Price", desc: "Guaranteed best value" },
              { icon: Shield, title: "Warranty", desc: "Up to 1 year warranty" },
            ].map((f) => (
              <div key={f.title} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <f.icon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-blue-600">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 sm:mb-4">
            Want to Sell Your Car?
          </h2>
          <p className="text-base sm:text-lg text-blue-100 mb-6 sm:mb-8">
            Get the best price for your car with our instant valuation
          </p>
          <Link href="/sell">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-base sm:text-lg px-8 sm:px-10">
              Get Free Evaluation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
