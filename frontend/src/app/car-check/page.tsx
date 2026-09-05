"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ClipboardCheck,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Car,
  Calendar,
  MapPin,
  FileText,
  Gauge,
  Users,
  History,
} from "lucide-react";

interface CarCheckResult {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  registrationDate: string;
  registrationAuthority: string;
  insuranceValid: boolean;
  insuranceUpto: string;
  pucValid: boolean;
  pucUpto: string;
  fitnessValid: boolean;
  loanStatus: string;
  stolen: boolean;
  accidentHistory: boolean;
  owners: number;
  color: string;
  engineNumber: string;
  chassisNumber: string;
}

export default function CarCheckPage() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<CarCheckResult | null>(null);

  const handleSearch = async () => {
    if (!vehicleNumber.trim()) return;
    setSearching(true);
    setResult(null);

    await new Promise((r) => setTimeout(r, 2000));

    setResult({
      registrationNumber: vehicleNumber.toUpperCase(),
      make: "Maruti Suzuki",
      model: "Baleno Alpha",
      year: 2022,
      fuelType: "Petrol",
      registrationDate: "2022-04-15",
      registrationAuthority: "RTO Mumbai Central",
      insuranceValid: true,
      insuranceUpto: "2025-04-14",
      pucValid: true,
      pucUpto: "2025-01-20",
      fitnessValid: true,
      loanStatus: "No Loan",
      stolen: false,
      accidentHistory: false,
      owners: 1,
      color: "Pearl Arctic White",
      engineNumber: "K12N-XXXXXX",
      chassisNumber: "MA3FJEB1SXXXXXXX",
    });
    setSearching(false);
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    status,
  }: {
    icon: any;
    label: string;
    value: string;
    status?: "good" | "warning" | "bad";
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value}</span>
        {status === "good" && (
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        )}
        {status === "warning" && (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
        {status === "bad" && <XCircle className="h-4 w-4 text-red-500" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-600">Complete Report</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-blue-400">Car</span> Check
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get a complete vehicle history report including insurance, PUC,
            accident history, and ownership details.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              Vehicle History Check
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
                  {searching ? "Checking..." : "Check Vehicle"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Vehicle Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-extrabold">
                      {result.make} {result.model}
                    </h2>
                    <p className="text-muted-foreground font-mono">
                      {result.registrationNumber}
                    </p>
                  </div>
                  <Badge className="bg-emerald-500">Clean Report</Badge>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { icon: Calendar, label: "Year", value: result.year },
                    { icon: Car, label: "Color", value: result.color },
                    { icon: Gauge, label: "Fuel", value: result.fuelType },
                    { icon: Users, label: "Owners", value: result.owners },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                      <item.icon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="font-bold text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Checks */}
            <Card>
              <CardHeader>
                <CardTitle>Document Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  <InfoRow
                    icon={Shield}
                    label="Insurance"
                    value={
                      result.insuranceValid
                        ? `Valid till ${new Date(result.insuranceUpto).toLocaleDateString("en-IN")}`
                        : "Expired"
                    }
                    status={result.insuranceValid ? "good" : "bad"}
                  />
                  <InfoRow
                    icon={FileText}
                    label="PUC Certificate"
                    value={
                      result.pucValid
                        ? `Valid till ${new Date(result.pucUpto).toLocaleDateString("en-IN")}`
                        : "Expired"
                    }
                    status={result.pucValid ? "good" : "bad"}
                  />
                  <InfoRow
                    icon={CheckCircle}
                    label="Fitness Certificate"
                    value={result.fitnessValid ? "Valid" : "Expired"}
                    status={result.fitnessValid ? "good" : "bad"}
                  />
                  <InfoRow
                    icon={FileText}
                    label="Loan Status"
                    value={result.loanStatus}
                    status={result.loanStatus === "No Loan" ? "good" : "warning"}
                  />
                  <InfoRow
                    icon={AlertTriangle}
                    label="Stolen Vehicle"
                    value={result.stolen ? "Yes" : "No"}
                    status={result.stolen ? "bad" : "good"}
                  />
                  <InfoRow
                    icon={History}
                    label="Accident History"
                    value={result.accidentHistory ? "Yes" : "None Found"}
                    status={result.accidentHistory ? "warning" : "good"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Registration Date</p>
                    <p className="font-medium">
                      {new Date(result.registrationDate).toLocaleDateString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RTO</p>
                    <p className="font-medium">{result.registrationAuthority}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Engine Number</p>
                    <p className="font-medium font-mono">
                      {result.engineNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Chassis Number</p>
                    <p className="font-medium font-mono">
                      {result.chassisNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            {
              icon: Shield,
              title: "Insurance Check",
              desc: "Verify active insurance status",
            },
            {
              icon: History,
              title: "Accident History",
              desc: "Past accident records if any",
            },
            {
              icon: AlertTriangle,
              title: "Stolen Check",
              desc: "Check if vehicle is reported stolen",
            },
          ].map((f) => (
            <Card key={f.title}>
              <CardContent className="p-5 text-center">
                <f.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
