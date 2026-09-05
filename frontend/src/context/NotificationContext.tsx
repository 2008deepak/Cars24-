"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { useAuth } from "./AuthContext";

interface NotificationPreferences {
  appointmentUpdates: boolean;
  bidUpdates: boolean;
  priceDrops: boolean;
  chatMessages: boolean;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

interface NotificationContextType {
  fcmToken: string | null;
  permission: NotificationPermission;
  preferences: NotificationPreferences;
  notifications: Notification[];
  unreadCount: number;
  requestPermission: () => Promise<boolean>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  showInAppNotification: (title: string, body: string, type?: string) => void;
  inAppNotification: { title: string; body: string; type: string } | null;
  clearInAppNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const defaultPreferences: NotificationPreferences = {
  appointmentUpdates: true,
  bidUpdates: true,
  priceDrops: true,
  chatMessages: true,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inAppNotification, setInAppNotification] = useState<{
    title: string;
    body: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const savedPrefs = localStorage.getItem(`notif_prefs_${user.id}`);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
      const savedNotifs = localStorage.getItem(`notifications_${user.id}`);
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`notif_prefs_${user.id}`, JSON.stringify(preferences));
    }
  }, [preferences, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const messaging = await getFirebaseMessaging();
        if (messaging) {
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          if (currentToken) {
            setFcmToken(currentToken);
            console.log("FCM Token obtained:", currentToken);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, []);

  const updatePreferences = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...prefs }));
    },
    []
  );

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showInAppNotification = useCallback(
    (title: string, body: string, type: string = "info") => {
      if (shouldShowNotification(type)) {
        setInAppNotification({ title, body, type });
      }
    },
    [preferences]
  );

  const clearInAppNotification = useCallback(() => {
    setInAppNotification(null);
  }, []);

  const shouldShowNotification = (type: string): boolean => {
    switch (type) {
      case "appointment":
        return preferences.appointmentUpdates;
      case "bid":
        return preferences.bidUpdates;
      case "price_drop":
        return preferences.priceDrops;
      case "chat":
        return preferences.chatMessages;
      default:
        return true;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        fcmToken,
        permission,
        preferences,
        notifications,
        unreadCount,
        requestPermission,
        updatePreferences,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        showInAppNotification,
        inAppNotification,
        clearInAppNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
