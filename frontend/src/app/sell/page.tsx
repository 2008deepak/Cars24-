"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { carsAPI } from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

export default function SellCarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    kmDriven: "",
    fuelType: "Petrol",
    transmission: "Manual",
    numberOfOwners: "1",
    registrationNumber: "",
    description: "",
    imageUrl: "",
    location: "",
  });

  const brands = [
    "Maruti Suzuki", "Hyundai", "Honda", "Toyota", "Tata",
    "Mahindra", "Kia", "Volkswagen", "MG", "Renault",
  ];
  const fuelTypes = ["Petrol", "Diesel", "Electric", "CNG"];
  const transmissions = ["Manual", "Automatic", "CVT", "DCT"];
  const locations = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
    "Pune", "Ahmedabad", "Jaipur",
  ];

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      await carsAPI.create({
        ...formData,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        kmDriven: parseInt(formData.kmDriven),
        numberOfOwners: parseInt(formData.numberOfOwners),
      });
      setSuccess(true);
      setTimeout(() => router.push("/profile"), 2000);
    } catch {
      alert("Failed to list car. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-10">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold mb-2">
              Car Listed Successfully!
            </h2>
            <p className="text-muted-foreground">
              Redirecting to your profile...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Sell Your Car
          </h1>
          <p className="text-gray-400">
            Get the best price for your car with our instant valuation
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Car Title</Label>
                <Input
                  placeholder="e.g., 2022 Maruti Suzuki Baleno"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Brand</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(v) => v && handleChange("brand", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    placeholder="e.g., Baleno"
                    value={formData.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2022"
                    min="2000"
                    max="2024"
                    value={formData.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>KMs Driven</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 15000"
                    value={formData.kmDriven}
                    onChange={(e) => handleChange("kmDriven", e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Fuel Type</Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(v) => v && handleChange("fuelType", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transmission</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(v) => v && handleChange("transmission", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissions.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Number of Owners</Label>
                  <Select
                    value={formData.numberOfOwners}
                    onValueChange={(v) => v && handleChange("numberOfOwners", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input
                    placeholder="e.g., MH02AB1234"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      handleChange("registrationNumber", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Expected Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 850000"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(v) => v && handleChange("location", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Image URL (optional)</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/car-image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Tell us about your car's condition, features, and history..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Listing Car..." : "List My Car"}
          </Button>
        </form>
      </div>
    </div>
  );
}
