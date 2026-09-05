"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { useNotificationSetup } from "@/hooks/useNotificationSetup";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import InAppNotificationToast from "@/components/notifications/InAppNotificationToast";

function NotificationListener() {
  useNotificationSetup();
  return null;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((reg) => {
          console.log("Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <NotificationListener />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <InAppNotificationToast />
      </NotificationProvider>
    </AuthProvider>
  );
}
