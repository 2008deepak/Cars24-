"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Gauge,
  Calendar,
  CircleDollarSign,
  Car,
  Shield,
  Clock,
  Cog,
  CircleAlert,
} from "lucide-react";

interface MaintenanceResult {
  monthlyCost: number;
  yearlyCost: number;
  riskLevel: "low" | "medium" | "high";
  alerts: Alert[];
  breakdown: BreakdownItem[];
  summary: string;
}

interface Alert {
  icon: any;
  title: string;
  description: string;
  urgency: "info" | "warning" | "critical";
}

interface BreakdownItem {
  name: string;
  cost: number;
  frequency: string;
}

const brandData: Record<
  string,
  { baseCost: number; reliabilityFactor: number; models: string[] }
> = {
  "Maruti Suzuki": { baseCost: 2800, reliabilityFactor: 0.85, models: ["Alto", "WagonR", "Swift", "Baleno", "Brezza", "Ertiga"] },
  Hyundai: { baseCost: 3200, reliabilityFactor: 0.9, models: ["i10", "i20", "Venue", "Creta", "Verna", "Tucson"] },
  Honda: { baseCost: 3500, reliabilityFactor: 0.88, models: ["Amaze", "City", "Elevate", "WR-V"] },
  Toyota: { baseCost: 3800, reliabilityFactor: 0.82, models: ["Glanza", "Urban Cruiser", "Innova", "Fortuner", "Camry"] },
  Tata: { baseCost: 2600, reliabilityFactor: 0.92, models: ["Tiago", "Tigor", "Nexon", "Harrier", "Safari"] },
  Mahindra: { baseCost: 3400, reliabilityFactor: 0.87, models: ["KUV", "XUV300", "XUV700", "Thar", "Scorpio", "XUV400"] },
  Kia: { baseCost: 3100, reliabilityFactor: 0.89, models: ["Sonet", "Seltos", "Carens", "EV6"] },
  Volkswagen: { baseCost: 4200, reliabilityFactor: 0.84, models: ["Polo", "Vento", "Taigun", "Tiguan"] },
  Skoda: { baseCost: 4000, reliabilityFactor: 0.86, models: ["Kushaq", "Slavia", "Kodiaq", "Superb"] },
  Renault: { baseCost: 2900, reliabilityFactor: 0.91, models: ["Kwid", "Triber", "Kiger"] },
  Nissan: { baseCost: 3300, reliabilityFactor: 0.9, models: ["Magnite", "Kicks"] },
  MG: { baseCost: 4500, reliabilityFactor: 0.83, models: ["Hector", "Astor", "Gloster", "ZS EV"] },
};

export default function MaintenancePage() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [carAge, setCarAge] = useState(3);
  const [kilometers, setKilometers] = useState(30000);
  const [showResults, setShowResults] = useState(false);

  const result = useMemo<MaintenanceResult | null>(() => {
    if (!brand) return null;

    const brandInfo = brandData[brand];
    if (!brandInfo) return null;

    // Base monthly cost calculation
    const ageMultiplier = 1 + (carAge - 1) * 0.15;
    const kmMultiplier = 1 + kilometers / 100000;
    const conditionMultiplier = carAge > 5 && kilometers > 60000 ? 1.4 : 1;

    const monthlyCost = Math.round(
      brandInfo.baseCost *
        brandInfo.reliabilityFactor *
        ageMultiplier *
        kmMultiplier *
        conditionMultiplier
    );

    const yearlyCost = monthlyCost * 12;

    // Risk level
    let riskLevel: "low" | "medium" | "high";
    if (carAge <= 3 && kilometers <= 30000) {
      riskLevel = "low";
    } else if (carAge <= 5 && kilometers <= 60000) {
      riskLevel = "medium";
    } else {
      riskLevel = "high";
    }

    // Generate alerts
    const alerts: Alert[] = [];

    // Next service alert
    const nextServiceKm = Math.ceil(kilometers / 10000) * 10000 + 10000;
    const kmToService = nextServiceKm - kilometers;
    if (kmToService <= 2000) {
      alerts.push({
        icon: Calendar,
        title: `Next major service due in ${kmToService.toLocaleString()} km`,
        description: "Schedule your service appointment soon to avoid potential issues.",
        urgency: "warning",
      });
    } else {
      alerts.push({
        icon: Calendar,
        title: `Next service in ${kmToService.toLocaleString()} km`,
        description: `Expected around ${nextServiceKm.toLocaleString()} km odometer reading.`,
        urgency: "info",
      });
    }

    // Brake pads
    const brakeLife = Math.max(0, 60000 - kilometers);
    if (brakeLife <= 5000) {
      alerts.push({
        icon: AlertTriangle,
        title: "Brake pads likely to need replacement soon",
        description: `Based on ${kilometers.toLocaleString()} km driven. Front brakes wear faster in city driving.`,
        urgency: "critical",
      });
    } else if (brakeLife <= 15000) {
      alerts.push({
        icon: CircleAlert,
        title: "Brake pad replacement due in ~" + Math.round(brakeLife / 1000) + "k km",
        description: "Start budgeting for brake maintenance.",
        urgency: "warning",
      });
    }

    // Tire replacement
    const tireLife = Math.max(0, 50000 - kilometers);
    if (tireLife <= 5000) {
      alerts.push({
        icon: CircleDollarSign,
        title: "Tire replacement expected in the near future",
        description: "Tires typically last 40,000-50,000 km. Budget ₹12,000-₹24,000 for a set.",
        urgency: "critical",
      });
    } else if (tireLife <= 10000) {
      alerts.push({
        icon: CircleAlert,
        title: "Tire replacement due in ~" + Math.round(tireLife / 1000) + "k km",
        description: "Start comparing tire options and prices.",
        urgency: "warning",
      });
    }

    // Battery
    if (carAge >= 3) {
      const batteryLife = Math.max(0, 5 - carAge);
      if (batteryLife <= 1) {
        alerts.push({
          icon: XCircle,
          title: "Battery replacement may be needed",
          description: `Car battery typically lasts 3-5 years. Your car is ${carAge} years old.`,
          urgency: carAge >= 4 ? "critical" : "warning",
        });
      }
    }

    // Oil change
    alerts.push({
      icon: Wrench,
      title: "Regular oil change every 5,000-10,000 km",
      description: `Current estimate: ₹800-₹1,500 per service depending on oil type.`,
      urgency: "info",
    });

    // Suspension
    if (kilometers > 50000) {
      alerts.push({
        icon: Cog,
        title: "Suspension check recommended",
        description: "After 50,000 km, suspension components may need inspection.",
        urgency: kilometers > 80000 ? "warning" : "info",
      });
    }

    // Age-based alerts
    if (carAge >= 5) {
      alerts.push({
        icon: Shield,
        title: "Extended warranty recommended",
        description: "Older cars benefit from extended warranty coverage for major repairs.",
        urgency: "info",
      });
    }

    // Breakdown items
    const breakdown: BreakdownItem[] = [
      { name: "Routine Service (Oil, Filters)", cost: Math.round(monthlyCost * 0.3), frequency: "Every 10,000 km" },
      { name: "Brake Maintenance", cost: Math.round(monthlyCost * 0.15), frequency: "Every 30,000-40,000 km" },
      { name: "Tire Maintenance", cost: Math.round(monthlyCost * 0.2), frequency: "Every 40,000-50,000 km" },
      { name: "Battery & Electrical", cost: Math.round(monthlyCost * 0.1), frequency: "Every 3-5 years" },
      { name: "Suspension & Alignment", cost: Math.round(monthlyCost * 0.15), frequency: "Every 20,000-30,000 km" },
      { name: "Miscellaneous Repairs", cost: Math.round(monthlyCost * 0.1), frequency: "As needed" },
    ];

    const summary =
      riskLevel === "low"
        ? "This car is in excellent condition with minimal maintenance expected."
        : riskLevel === "medium"
        ? "This car is in good condition but will need regular maintenance attention."
        : "This car is in the high-maintenance zone. Factor in higher upkeep costs.";

    return { monthlyCost, yearlyCost, riskLevel, alerts, breakdown, summary };
  }, [brand, carAge, kilometers]);

  const handleReset = () => {
    setBrand("");
    setModel("");
    setCarAge(3);
    setKilometers(30000);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-600">Budget Planning Tool</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Maintenance Cost <span className="text-blue-400">Estimator</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Predict future vehicle upkeep expenses and plan your budget
            realistically before buying a used car.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Brand */}
                <div>
                  <Label className="text-sm font-medium">Brand</Label>
                  <Select
                    value={brand}
                    onValueChange={(v) => {
                      if (v) {
                        setBrand(v);
                        setModel("");
                        setShowResults(true);
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(brandData).map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model */}
                {brand && (
                  <div>
                    <Label className="text-sm font-medium">Model</Label>
                    <Select value={model} onValueChange={(v) => v && setModel(v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandData[brand]?.models.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Car Age Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Car Age</Label>
                    <span className="text-sm font-bold text-blue-600">
                      {carAge} {carAge === 1 ? "year" : "years"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={carAge}
                    onChange={(e) => {
                      setCarAge(parseInt(e.target.value));
                      setShowResults(true);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 yr</span>
                    <span>15 yrs</span>
                  </div>
                </div>

                {/* Kilometers Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Kilometers Driven</Label>
                    <span className="text-sm font-bold text-blue-600">
                      {kilometers.toLocaleString()} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={kilometers}
                    onChange={(e) => {
                      setKilometers(parseInt(e.target.value));
                      setShowResults(true);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 km</span>
                    <span>2,00,000 km</span>
                  </div>
                </div>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!showResults || !result ? (
              <Card className="h-full flex items-center justify-center py-20">
                <div className="text-center text-muted-foreground">
                  <Wrench className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-bold mb-2">
                    Select vehicle details
                  </h3>
                  <p className="text-sm">
                    Choose a brand and adjust the sliders to see maintenance
                    cost estimates
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Risk Tag + Cost */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Estimated Monthly Maintenance
                        </p>
                        <p className="text-4xl font-extrabold text-gray-900">
                          ₹{result.monthlyCost.toLocaleString("en-IN")}
                          <span className="text-base font-normal text-muted-foreground ml-2">
                            /month
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₹{result.yearlyCost.toLocaleString("en-IN")} per year
                          estimate
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          className={`text-base px-4 py-1.5 ${
                            result.riskLevel === "low"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : result.riskLevel === "medium"
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {result.riskLevel === "low" && (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          {result.riskLevel === "medium" && (
                            <AlertTriangle className="h-4 w-4 mr-1" />
                          )}
                          {result.riskLevel === "high" && (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          {result.riskLevel === "low"
                            ? "Low Maintenance Expected"
                            : result.riskLevel === "medium"
                            ? "Moderate Maintenance Expected"
                            : "High Maintenance Expected"}
                        </Badge>
                        {brand && (
                          <span className="text-sm text-muted-foreground">
                            {brand} {model || ""} • {carAge} yrs •{" "}
                            {kilometers.toLocaleString()} km
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{result.summary}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Maintenance Alerts & Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.alerts.map((alert, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            alert.urgency === "critical"
                              ? "bg-red-50 border-red-200"
                              : alert.urgency === "warning"
                              ? "bg-amber-50 border-amber-200"
                              : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <alert.icon
                            className={`h-5 w-5 mt-0.5 shrink-0 ${
                              alert.urgency === "critical"
                                ? "text-red-500"
                                : alert.urgency === "warning"
                                ? "text-amber-500"
                                : "text-blue-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-sm">{alert.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {alert.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CircleDollarSign className="h-5 w-5 text-blue-600" />
                      Cost Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.breakdown.map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                            <span className="text-sm font-bold">
                              ~₹{item.cost.toLocaleString("en-IN")}/mo
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, (item.cost / result.monthlyCost) * 100 * 2)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.frequency}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total Monthly Estimate</span>
                      <span className="text-xl font-extrabold text-blue-600">
                        ₹{result.monthlyCost.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-blue-900 mb-2">
                      💡 Money-Saving Tips
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1.5">
                      <li>• Get regular servicing from authorized centers to maintain warranty</li>
                      <li>• Compare prices for tires and batteries across brands</li>
                      <li>• Keep emergency fund of ₹{Math.round(result.monthlyCost * 3).toLocaleString("en-IN")} for unexpected repairs</li>
                      <li>• Consider annual maintenance contracts for predictable costs</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
