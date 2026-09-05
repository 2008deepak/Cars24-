"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { notificationsAPI } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Bell,
  BellRing,
  Calendar,
  Gavel,
  TrendingDown,
  MessageSquare,
  Check,
  ArrowLeft,
  Loader2,
  Smartphone,
} from "lucide-react";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    permission,
    preferences,
    requestPermission,
    updatePreferences,
    fcmToken,
  } = useNotifications();

  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadPreferences = async () => {
      try {
        const res = await notificationsAPI.getPreferences();
        updatePreferences(res.data);
      } catch (err) {
        console.error("Failed to load notification preferences:", err);
      }
    };

    loadPreferences();
  }, [user, router, updatePreferences]);

  const handleTogglePermission = async () => {
    setRequesting(true);
    try {
      await requestPermission();
    } finally {
      setRequesting(false);
    }
  };

  const handlePreferenceChange = async (
    key: keyof typeof preferences,
    value: boolean
  ) => {
    updatePreferences({ [key]: value });
    setSaving(true);
    setSaveSuccess(false);

    try {
      await notificationsAPI.updatePreferences({ [key]: value });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to save preference:", err);
      updatePreferences({ [key]: !value });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const isGranted = permission === "granted";

  const notificationTypes = [
    {
      key: "appointmentUpdates" as const,
      title: "Appointment Updates",
      description: "Get notified about booking confirmations, cancellations, and reminders",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      key: "bidUpdates" as const,
      title: "Bid Updates",
      description: "Alerts when you're outbid or receive new bids on your listed cars",
      icon: Gavel,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      key: "priceDrops" as const,
      title: "Price Drop Alerts",
      description: "Get notified when prices drop on cars in your wishlist or viewed recently",
      icon: TrendingDown,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      key: "chatMessages" as const,
      title: "Chat Messages",
      description: "New messages from sellers or buyers about your inquiries",
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Notification Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose which notifications you&apos;d like to receive
          </p>
        </div>

        {/* Browser Permission Status */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isGranted ? "bg-emerald-100" : "bg-amber-100"}`}>
                  {isGranted ? (
                    <Bell className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <BellRing className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    Browser Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isGranted
                      ? "Enabled - you'll receive push notifications"
                      : permission === "denied"
                      ? "Blocked - enable in browser settings"
                      : "Not yet enabled"}
                  </p>
                </div>
              </div>
              {permission !== "denied" && !isGranted && (
                <Button
                  onClick={handleTogglePermission}
                  disabled={requesting}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {requesting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Smartphone className="h-4 w-4 mr-2" />
                  )}
                  Enable Notifications
                </Button>
              )}
              {permission === "denied" && (
                <p className="text-xs text-destructive">
                  Blocked by browser
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Toggle individual notification categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {notificationTypes.map((type) => (
              <div
                key={type.key}
                className="flex items-center justify-between py-4 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type.bg}`}>
                    <type.icon className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{type.title}</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      {type.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences[type.key]}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange(type.key, checked)
                  }
                  disabled={!isGranted || saving}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Indicator */}
        {saveSuccess && (
          <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in fade-in">
            <Check className="h-4 w-4" />
            Settings saved
          </div>
        )}
      </div>
    </div>
  );
}
