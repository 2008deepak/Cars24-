"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Wrench, Navigation, Package } from "lucide-react";
import type { ServiceCenter } from "@/lib/location/cities";

// Fix for default marker icons not loading
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons
const carIcon = new L.DivIcon({
  html: `<div style="background:#2563eb;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const hubIcon = new L.DivIcon({
  html: `<div style="background:#dc2626;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const inspectionIcon = new L.DivIcon({
  html: `<div style="background:#16a34a;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg></div>`,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const pickupIcon = new L.DivIcon({
  html: `<div style="background:#f59e0b;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const serviceIcon = new L.DivIcon({
  html: `<div style="background:#7c3aed;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>`,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

function getCenterIcon(type: ServiceCenter["type"]): L.DivIcon {
  switch (type) {
    case "hub": return hubIcon;
    case "inspection": return inspectionIcon;
    case "pickup": return pickupIcon;
    case "service": return serviceIcon;
    default: return hubIcon;
  }
}

function getTypeLabel(type: ServiceCenter["type"]): string {
  switch (type) {
    case "hub": return "Cars24 Hub";
    case "inspection": return "Inspection Center";
    case "pickup": return "Pickup Point";
    case "service": return "Service Center";
    default: return "Location";
  }
}

function getTypeColor(type: ServiceCenter["type"]): string {
  switch (type) {
    case "hub": return "bg-red-100 text-red-700";
    case "inspection": return "bg-green-100 text-green-700";
    case "pickup": return "bg-amber-100 text-amber-700";
    case "service": return "bg-purple-100 text-purple-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

interface MapListing {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  fuelType?: string;
  transmission?: string;
  year?: number;
  imageUrl?: string;
}

interface InteractiveMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  listings: MapListing[];
  serviceCenters: ServiceCenter[];
  onListingClick?: (id: string) => void;
  className?: string;
  height?: string;
}

function FlyTo({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom(), {
      duration: 1.5,
    });
  }, [center, map]);
  return null;
}

export default function InteractiveMap({
  center,
  zoom = 12,
  listings,
  serviceCenters,
  onListingClick,
  className = "",
  height = "500px",
}: InteractiveMapProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border ${className}`} style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo center={center} />

        {/* Car listing markers */}
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={carIcon}
            eventHandlers={{
              click: () => onListingClick?.(listing.id),
            }}
          >
            <Popup>
              <div className="min-w-[180px] p-1">
                {listing.imageUrl && (
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <p className="font-bold text-sm">{listing.title}</p>
                <p className="text-blue-600 font-extrabold text-base">
                  ₹{listing.price.toLocaleString("en-IN")}
                </p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {listing.fuelType && (
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                      {listing.fuelType}
                    </span>
                  )}
                  {listing.transmission && (
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                      {listing.transmission}
                    </span>
                  )}
                </div>
                {onListingClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onListingClick(listing.id);
                    }}
                    className="mt-2 text-xs text-blue-600 underline cursor-pointer"
                  >
                    View Details →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Service center markers */}
        {serviceCenters.map((sc) => (
          <Marker
            key={sc.id}
            position={[sc.lat, sc.lng]}
            icon={getCenterIcon(sc.type)}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(sc.type)}`}>
                    {getTypeLabel(sc.type)}
                  </span>
                </div>
                <p className="font-bold text-sm">{sc.name}</p>
                <p className="text-gray-600 text-xs mt-1">{sc.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-amber-600 font-medium">★ {sc.rating}</span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-500">{sc.hours}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">{sc.phone}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
