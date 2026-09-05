"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { walletAPI } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wallet,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Ticket,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

interface WalletData {
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  transactions: {
    id: string;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
  }[];
}

function getTransactionIcon(description: string) {
  const lower = description.toLowerCase();
  if (lower.includes("referral") || lower.includes("referred"))
    return <Gift className="h-4 w-4 text-orange-500" />;
  if (lower.includes("appointment"))
    return <Ticket className="h-4 w-4 text-blue-500" />;
  if (lower.includes("redeem") || lower.includes("discount"))
    return <ShoppingBag className="h-4 w-4 text-green-500" />;
  return <Sparkles className="h-4 w-4 text-purple-500" />;
}

export default function WalletPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemDesc, setRedeemDesc] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchWallet();
  }, [user, router]);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await walletAPI.getWallet();
      setWallet(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    const amount = parseInt(redeemAmount);
    if (!amount || amount < 100) {
      setError("Minimum redemption is 100 points");
      return;
    }
    if (amount > (wallet?.balance || 0)) {
      setError("Insufficient balance");
      return;
    }
    if (!redeemDesc.trim()) {
      setError("Please enter a description for redemption");
      return;
    }

    setRedeeming(true);
    setError("");
    setSuccess("");
    try {
      const res = await walletAPI.redeem(amount, redeemDesc.trim());
      setSuccess(res.data.message);
      setRedeemAmount("");
      setRedeemDesc("");
      await fetchWallet();
    } catch (err: any) {
      setError(err.response?.data?.message || "Redemption failed");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">My Wallet</h1>
          <p className="text-muted-foreground">
            Track your points and redeem rewards
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Balance Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 text-white">
            <p className="text-blue-100 text-sm font-medium mb-1">
              Available Balance
            </p>
            <p className="text-4xl sm:text-5xl font-extrabold mb-4">
              {wallet?.balance?.toLocaleString() || 0}{" "}
              <span className="text-lg font-medium text-blue-200">pts</span>
            </p>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-blue-200">Total Earned</p>
                <p className="font-bold">
                  +{wallet?.totalEarned?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-blue-200">Total Redeemed</p>
                <p className="font-bold">
                  -{wallet?.totalRedeemed?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction History */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Transaction History</h2>
                {!wallet?.transactions?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No transactions yet</p>
                    <Link
                      href="/referrals"
                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                    >
                      Refer friends to start earning!
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wallet.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === "credit"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {tx.type === "credit" ? (
                              <ArrowDownRight className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {tx.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-bold text-sm ${
                            tx.type === "credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {tx.type === "credit" ? "+" : "-"}
                          {tx.amount.toLocaleString()} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Redeem Section */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Redeem Points</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Amount (pts)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount (min 100)"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      min={100}
                      max={wallet?.balance || 0}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Purpose</Label>
                    <Input
                      placeholder="e.g., Discount on next purchase"
                      value={redeemDesc}
                      onChange={(e) => setRedeemDesc(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleRedeem}
                    disabled={redeeming || !redeemAmount}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {redeeming ? "Redeeming..." : "Redeem Points"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Min: 100 pts | Max: {wallet?.balance?.toLocaleString() || 0} pts
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm text-orange-800 mb-2">
                  Earn More Points
                </h3>
                <ul className="text-xs text-orange-700 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Gift className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Refer a friend: <strong>500 pts</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Friend registers: <strong>250 pts</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ticket className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Complete appointment: <strong>200 pts</strong>
                  </li>
                </ul>
                <Link href="/referrals">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    Start Referring
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
