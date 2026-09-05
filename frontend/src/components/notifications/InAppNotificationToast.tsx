"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { X, Bell, Calendar, TrendingDown, MessageSquare, Gavel } from "lucide-react";

const typeIcons: Record<string, typeof Bell> = {
  appointment: Calendar,
  price_drop: TrendingDown,
  chat: MessageSquare,
  bid: Gavel,
  info: Bell,
};

const typeColors: Record<string, string> = {
  appointment: "border-l-blue-500 bg-blue-50",
  price_drop: "border-l-emerald-500 bg-emerald-50",
  chat: "border-l-purple-500 bg-purple-50",
  bid: "border-l-orange-500 bg-orange-50",
  info: "border-l-gray-500 bg-gray-50",
};

export default function InAppNotificationToast() {
  const { inAppNotification, clearInAppNotification } = useNotifications();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (inAppNotification) {
      setVisible(true);
      setExiting(false);

      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [inAppNotification]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      clearInAppNotification();
    }, 300);
  };

  if (!visible || !inAppNotification) return null;

  const Icon = typeIcons[inAppNotification.type] || Bell;
  const colorClass = typeColors[inAppNotification.type] || typeColors.info;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full pointer-events-none">
      <div
        className={`
          border-l-4 ${colorClass} rounded-lg shadow-lg p-4 pointer-events-auto
          transition-all duration-300 transform
          ${exiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
        `}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900">
              {inAppNotification.title}
            </p>
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
              {inAppNotification.body}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
