"use client";

import { MapPin, Home, SearchIcon, Package, Wrench } from "lucide-react";

const LEGEND_ITEMS = [
  { icon: MapPin, label: "Cars24 Hub", color: "bg-red-500" },
  { icon: SearchIcon, label: "Inspection Center", color: "bg-green-500" },
  { icon: Package, label: "Pickup Point", color: "bg-amber-500" },
  { icon: Wrench, label: "Service Center", color: "bg-purple-500" },
  { icon: Home, label: "Car Listing", color: "bg-blue-500" },
];

export default function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-lg border text-xs">
      <span className="font-medium text-gray-500 mr-1">Map Key:</span>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-full ${item.color}`} />
          <span className="text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
