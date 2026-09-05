"use client";

import { useEffect, useRef } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import { notificationsAPI } from "@/lib/api/client";

export function useNotificationSetup() {
  const { user } = useAuth();
  const {
    requestPermission,
    addNotification,
    showInAppNotification,
    fcmToken,
  } = useNotifications();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!user || hasInitialized.current) return;
    hasInitialized.current = true;

    const initNotifications = async () => {
      if ("Notification" in window && Notification.permission === "default") {
        // Will ask on first visit via a prompt in the UI
      }

      const messaging = await getFirebaseMessaging();
      if (messaging) {
        onMessage(messaging, (payload) => {
          const title = payload.notification?.title || "Cars24";
          const body = payload.notification?.body || "";
          const type = (payload.data?.type as string) || "info";

          addNotification({
            title,
            body,
            type,
            data: payload.data as Record<string, string>,
          });

          showInAppNotification(title, body, type);
        });
      }
    };

    initNotifications();
  }, [user, requestPermission, addNotification, showInAppNotification]);

  useEffect(() => {
    if (user && fcmToken) {
      notificationsAPI.registerFcmToken(fcmToken).catch((err) => {
        console.error("Failed to register FCM token:", err);
      });
    }
  }, [user, fcmToken]);

  return null;
}
