"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Star } from "lucide-react";
import type { ServiceCenter } from "@/lib/location/cities";

function getTypeColor(type: ServiceCenter["type"]): string {
  switch (type) {
    case "hub": return "bg-red-100 text-red-700 border-red-200";
    case "inspection": return "bg-green-100 text-green-700 border-green-200";
    case "pickup": return "bg-amber-100 text-amber-700 border-amber-200";
    case "service": return "bg-purple-100 text-purple-700 border-purple-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getTypeLabel(type: ServiceCenter["type"]): string {
  switch (type) {
    case "hub": return "Hub";
    case "inspection": return "Inspection";
    case "pickup": return "Pickup";
    case "service": return "Service";
    default: return "Location";
  }
}

interface ServiceCentersListProps {
  centers: ServiceCenter[];
  compact?: boolean;
}

export default function ServiceCentersList({ centers, compact = false }: ServiceCentersListProps) {
  if (centers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No service centers found nearby</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {centers.map((sc) => (
          <div
            key={sc.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
          >
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              sc.type === "hub" ? "bg-red-100" :
              sc.type === "inspection" ? "bg-green-100" :
              sc.type === "pickup" ? "bg-amber-100" :
              "bg-purple-100"
            }`}>
              <MapPin className={`h-4 w-4 ${
                sc.type === "hub" ? "text-red-600" :
                sc.type === "inspection" ? "text-green-600" :
                sc.type === "pickup" ? "text-amber-600" :
                "text-purple-600"
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{sc.name}</p>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${getTypeColor(sc.type)}`}>
                  {getTypeLabel(sc.type)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{sc.address}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  {sc.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {sc.hours}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {centers.map((sc) => (
        <Card key={sc.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-sm">{sc.name}</h4>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${getTypeColor(sc.type)}`}>
                {getTypeLabel(sc.type)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{sc.address}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                {sc.rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {sc.hours}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {sc.phone}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
