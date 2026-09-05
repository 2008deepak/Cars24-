"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  CheckCircle,
  IndianRupee,
  Clock,
  Shield,
  Calculator,
  TrendingDown,
} from "lucide-react";

export default function LoansPage() {
  const [carPrice, setCarPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [loanTenure, setLoanTenure] = useState("");
  const [interestRate, setInterestRate] = useState("8.5");
  const [emi, setEmi] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);

  const calculateEMI = () => {
    const principal = parseFloat(carPrice) - parseFloat(downPayment || "0");
    const rate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(loanTenure) * 12;

    if (principal <= 0 || rate <= 0 || months <= 0) return;

    const emiValue =
      (principal * rate * Math.pow(1 + rate, months)) /
      (Math.pow(1 + rate, months) - 1);

    setEmi(Math.round(emiValue));
    setTotalAmount(Math.round(emiValue * months));
    setTotalInterest(Math.round(emiValue * months - principal));
  };

  const loanBenefits = [
    {
      icon: IndianRupee,
      title: "Low Interest Rates",
      desc: "Starting from 8.5% per annum",
    },
    {
      icon: Clock,
      title: "Quick Approval",
      desc: "Get approved within 24 hours",
    },
    {
      icon: Shield,
      title: "Secure Process",
      desc: "100% digital and secure",
    },
    {
      icon: TrendingDown,
      title: "Low EMI Options",
      desc: "Flexible tenure up to 7 years",
    },
  ];

  const requiredDocs = [
    "PAN Card",
    "Aadhaar Card",
    "Last 3 months salary slips",
    "Last 6 months bank statements",
    "Address proof",
    "Passport size photographs",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-600">Instant Approval</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Car <span className="text-blue-400">Loans</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get the best car loan rates with quick approval. Finance your dream
            car with flexible EMI options.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Calculator */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  EMI Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Car Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 800000"
                      value={carPrice}
                      onChange={(e) => setCarPrice(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Down Payment (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 160000"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Loan Tenure</Label>
                    <Select
                      value={loanTenure}
                      onValueChange={(v) => v && setLoanTenure(v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7].map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y} Year{y > 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button
                  onClick={calculateEMI}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Calculate EMI
                </Button>

                {emi && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-muted-foreground">
                          Monthly EMI
                        </p>
                        <p className="text-2xl font-extrabold text-blue-600">
                          ₹{emi.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="text-2xl font-extrabold">
                          ₹{totalAmount?.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-muted-foreground">
                          Total Interest
                        </p>
                        <p className="text-2xl font-extrabold text-amber-600">
                          ₹{totalInterest?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Cars24 Loans?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loanBenefits.map((b) => (
                  <div key={b.title} className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <b.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {requiredDocs.map((doc) => (
                    <li key={doc} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <CreditCard className="h-10 w-10 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Talk to our loan expert for personalized assistance
                </p>
                <Button className="bg-white text-blue-600 hover:bg-gray-100 w-full">
                  Call 1800-123-4567
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
