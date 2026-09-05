"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, BadgeCheck } from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const referralFromUrl = searchParams.get("ref") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    referralCode: referralFromUrl,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (referralFromUrl) {
      setFormData((prev) => ({ ...prev, referralCode: referralFromUrl }));
    }
  }, [referralFromUrl]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
        formData.referralCode || undefined
      );
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-extrabold">
              <span className="text-blue-600">Cars</span>
              <span className="text-yellow-500">24</span>
            </Link>
            <h1 className="text-2xl font-bold mt-4">Create Account</h1>
            <p className="text-muted-foreground">Join Cars24 today</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {formData.referralCode && (
            <Alert className="mb-6 border-orange-200 bg-orange-50 text-orange-700">
              <Gift className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-orange-500" />
                You&apos;ll receive <strong>250 bonus points</strong> for using
                a referral code!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="mt-1"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-orange-500" />
                Referral Code{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                placeholder="Enter referral code"
                value={formData.referralCode}
                onChange={(e) =>
                  handleChange("referralCode", e.target.value.toUpperCase())
                }
                className="mt-1 font-mono tracking-wider"
                maxLength={8}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
