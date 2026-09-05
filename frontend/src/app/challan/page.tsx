"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  IndianRupee,
  MapPin,
  Calendar,
} from "lucide-react";

interface ChallanData {
  challanNumber: string;
  date: string;
  place: string;
  violation: string;
  amount: number;
  status: string;
  state: string;
}

export default function ChallanPage() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ChallanData[] | null>(null);

  const handleSearch = async () => {
    if (!vehicleNumber.trim()) return;
    setSearching(true);
    setResults(null);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));

    // Mock data for demo
    setResults([
      {
        challanNumber: "MH1220240001234",
        date: "2024-06-15",
        place: "Andheri East, Mumbai",
        violation: "Over-speeding",
        amount: 2000,
        status: "Pending",
        state: "Maharashtra",
      },
      {
        challanNumber: "MH1220240005678",
        date: "2024-03-22",
        place: "Bandra West, Mumbai",
        violation: "Signal Jump",
        amount: 1000,
        status: "Paid",
        state: "Maharashtra",
      },
    ]);
    setSearching(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-600">Online Service</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-blue-400">Challan</span> Check
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Check pending traffic challans for any vehicle across India. Stay
            updated and pay fines online.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Check Your Challan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Vehicle Registration Number</Label>
              <div className="flex gap-3 mt-1">
                <Input
                  placeholder="e.g., MH02AB1234"
                  value={vehicleNumber}
                  onChange={(e) =>
                    setVehicleNumber(e.target.value.toUpperCase())
                  }
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searching || !vehicleNumber.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {searching ? "Searching..." : "Check"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Found {results.length} Challan(s)
              </h2>
              <div className="flex gap-2">
                <Badge variant="destructive">
                  {results.filter((c) => c.status === "Pending").length} Pending
                </Badge>
                <Badge variant="secondary">
                  {results.filter((c) => c.status === "Paid").length} Paid
                </Badge>
              </div>
            </div>

            {results.map((challan) => (
              <Card key={challan.challanNumber}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">
                        {challan.challanNumber}
                      </p>
                      <Badge
                        variant={
                          challan.status === "Pending"
                            ? "destructive"
                            : "secondary"
                        }
                        className="mt-1"
                      >
                        {challan.status === "Pending" ? (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {challan.status}
                      </Badge>
                    </div>
                    <p className="text-xl font-extrabold text-blue-600">
                      ₹{challan.amount.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Date</p>
                        <p className="font-medium">
                          {new Date(challan.date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Place</p>
                        <p className="font-medium">{challan.place}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Violation
                      </p>
                      <p className="font-medium">{challan.violation}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">State</p>
                      <p className="font-medium">{challan.state}</p>
                    </div>
                  </div>

                  {challan.status === "Pending" && (
                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                      Pay ₹{challan.amount.toLocaleString("en-IN")} Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">How to Check Challans</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                Enter your vehicle registration number above
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </span>
                Click on &quot;Check&quot; to search for pending challans
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                View details and pay fines directly online
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
