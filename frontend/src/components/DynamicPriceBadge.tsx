"use client";

import { TrendingUp, TrendingDown, Minus, Info, MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DynamicPriceResult } from "@/lib/pricing/rules";

interface DynamicPriceBadgeProps {
  pricing: DynamicPriceResult;
  compact?: boolean;
}

export default function DynamicPriceBadge({
  pricing,
  compact = false,
}: DynamicPriceBadgeProps) {
  const { originalPrice, recommendedPrice, adjustment, location } = pricing;
  const { percentage, reason, category } = adjustment;

  const isUp = category === "increase";
  const isDown = category === "decrease";

  if (category === "neutral") {
    return null;
  }

  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isUp
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <Icon className="h-3 w-3" />
            {isUp ? "+" : ""}
            {percentage}%
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm font-medium">{reason}</p>
            {location && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location.city}, {location.region}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={`rounded-xl border-2 p-4 ${
        isUp
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isUp ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isUp ? "text-emerald-600" : "text-red-600"
                }`}
              />
            </div>
            <span
              className={`text-sm font-bold ${
                isUp ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {isUp ? "Demand Premium" : "Market Adjustment"}
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed ml-10">
            {reason}
          </p>

          {location && (
            <p className="text-xs text-gray-500 mt-1 ml-10 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Based on your location: {location.city}, {location.region}
            </p>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
            <span
              className={`text-lg font-extrabold ${
                isUp ? "text-emerald-700" : "text-red-700"
              }`}
            >
              ₹{recommendedPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <span
            className={`text-xs font-bold ${
              isUp ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isUp ? "+" : ""}
            {percentage}% adjusted
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200/50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Info className="h-3 w-3" />
          Dynamic pricing based on region, season, and vehicle demand
        </div>
      </div>
    </div>
  );
}
