"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { referralsAPI } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Gift,
  Copy,
  Share2,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Wallet,
} from "lucide-react";

interface ReferralStats {
  totalReferred: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
  currentCode: {
    code: string;
    usageCount: number;
    isActive: boolean;
    createdAt: string;
    shareUrl: string;
  } | null;
  referrals: {
    id: string;
    referredUserName: string;
    status: string;
    referrerReward: number;
    referredReward: number;
    createdAt: string;
    completedAt: string | null;
  }[];
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await referralsAPI.getStats();
      setStats(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load referral stats");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    setError("");
    try {
      await referralsAPI.generateCode();
      await fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (stats?.currentCode?.code) {
      navigator.clipboard.writeText(stats.currentCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (stats?.currentCode) {
      const shareData = {
        title: "Join Cars24",
        text: `Use my referral code ${stats.currentCode.code} to get ${250} bonus points on Cars24!`,
        url: stats.currentCode.shareUrl,
      };
      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-muted-foreground">Loading referrals...</p>
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Refer & Earn
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Share your referral code with friends. When they complete a purchase,
            both of you earn rewards!
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Rewards Explainer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 text-center">
              <Sparkles className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-orange-600">500</p>
              <p className="text-xs text-orange-700 font-medium">
                Points per referral (you earn)
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Gift className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-blue-600">250</p>
              <p className="text-xs text-blue-700 font-medium">
                Welcome bonus (friend earns)
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <Wallet className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-green-600">200</p>
              <p className="text-xs text-green-700 font-medium">
                Appointment bonus (both earn)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4">Your Referral Code</h2>
            {stats?.currentCode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 rounded-xl p-4 text-center">
                    <p className="text-3xl font-extrabold tracking-widest text-blue-600 font-mono">
                      {stats.currentCode.code}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      className="gap-1.5"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleShare}
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Used {stats.currentCode.usageCount} time(s)</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have a referral code yet. Generate one to start earning!
                </p>
                <Button
                  onClick={handleGenerateCode}
                  disabled={generating}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {generating ? "Generating..." : "Generate Referral Code"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-extrabold">{stats?.totalReferred || 0}</p>
              <p className="text-xs text-muted-foreground">Total Referred</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-extrabold">{stats?.completedReferrals || 0}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-extrabold">{stats?.pendingReferrals || 0}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-extrabold">{stats?.totalPointsEarned || 0}</p>
              <p className="text-xs text-muted-foreground">Points Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral History */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4">Referral History</h2>
            {!stats?.referrals?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No referrals yet. Share your code to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {ref.referredUserName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ref.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          ref.status === "completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }
                      >
                        {ref.status === "completed" ? "Completed" : "Pending"}
                      </Badge>
                      {ref.status === "completed" && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          +{ref.referrerReward} pts
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Link */}
        <div className="text-center mt-6">
          <Link
            href="/wallet"
            className="text-blue-600 hover:underline text-sm font-medium inline-flex items-center gap-1"
          >
            <Wallet className="h-4 w-4" />
            View Wallet & Redeem Points
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
