"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { carsAPI, appointmentsAPI } from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, ArrowLeft } from "lucide-react";

interface CarPreview {
  title: string;
  price: number;
  imageUrl: string;
  location: string;
}

export default function BookAppointmentPage() {
  const { carId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<CarPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    carsAPI
      .getById(carId as string)
      .then((res) => {
        setCar(res.data);
        setFormData((prev) => ({ ...prev, location: res.data.location }));
      })
      .catch(() => router.push("/buy"))
      .finally(() => setLoading(false));
  }, [carId, user, router]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentsAPI.create({ carId, ...formData });
      setSuccess(true);
    } catch {
      alert("Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-10">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold mb-2">
              Appointment Booked!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your appointment has been scheduled. We&apos;ll contact you shortly.
            </p>
            <Button
              onClick={() => router.push("/profile")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View My Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Book an Appointment
          </h1>
          <p className="text-gray-400">Schedule a visit to inspect the car</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {car && (
          <Card className="mb-6">
            <CardContent className="p-4 flex gap-4">
              <img
                src={car.imageUrl}
                alt={car.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-bold">{car.title}</h3>
                <p className="text-blue-600 font-bold">
                  ₹{car.price.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-muted-foreground">
                  📍 {car.location}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Preferred Date</Label>
                <Input
                  type="date"
                  min={minDate}
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Preferred Time</Label>
                <Select
                  value={formData.time}
                  onValueChange={(v) => { if (v) handleChange("time", v); }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {Array.from({ length: 16 }, (_, i) => {
                      const h24 = 6 + i; // 6 AM to 9 PM
                      const period = h24 >= 12 ? "PM" : "AM";
                      const h12 = h24 > 12 ? h24 - 12 : h24;
                      const label = `${String(h12).padStart(2, "0")}:00 ${period}`;
                      return label;
                    }).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  placeholder="Any specific requirements or questions..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? "Booking..." : "Book Appointment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
