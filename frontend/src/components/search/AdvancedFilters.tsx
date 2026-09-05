"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SlidersHorizontal, ChevronDown, X, Zap } from "lucide-react";
import type { SearchFilters } from "@/lib/search/engine";

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onChange: (filters: Partial<SearchFilters>) => void;
  onClear: () => void;
  resultCount: number;
}

const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "CNG", "Hybrid"];
const TRANSMISSIONS = ["Manual", "Automatic", "CVT", "DCT", "AMT"];
const LOCATIONS = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kolkata",
];
const SORT_OPTIONS = [
  { value: "relevance", label: "Best Match" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "year_desc", label: "Newest First" },
  { value: "km_asc", label: "Lowest KMs" },
];

export default function AdvancedFilters({
  filters,
  onChange,
  onClear,
  resultCount,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.fuelType ||
    filters.transmission ||
    filters.minYear ||
    filters.maxYear ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minMileage ||
    filters.maxMileage ||
    filters.location;

  const activeCount = [
    filters.fuelType,
    filters.transmission,
    filters.minYear,
    filters.maxYear,
    filters.minPrice,
    filters.maxPrice,
    filters.minMileage,
    filters.maxMileage,
    filters.location,
  ].filter(Boolean).length;

  return (
    <div className="w-full">
      {/* Top bar: Result count + Sort + Filter toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <span className="text-sm font-medium text-muted-foreground">
          {resultCount} car{resultCount !== 1 ? "s" : ""} found
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={filters.sortBy}
            onValueChange={(v) => v && onChange({ sortBy: v })}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger
              className={`inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                hasActiveFilters
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeCount > 0 && (
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.fuelType && (
            <FilterTag
              label={`Fuel: ${filters.fuelType}`}
              onRemove={() => onChange({ fuelType: "" })}
            />
          )}
          {filters.transmission && (
            <FilterTag
              label={`Gear: ${filters.transmission}`}
              onRemove={() => onChange({ transmission: "" })}
            />
          )}
          {filters.location && (
            <FilterTag
              label={`Location: ${filters.location}`}
              onRemove={() => onChange({ location: "" })}
            />
          )}
          {(filters.minYear || filters.maxYear) && (
            <FilterTag
              label={`Year: ${filters.minYear || "Any"}-${filters.maxYear || "Any"}`}
              onRemove={() => onChange({ minYear: "", maxYear: "" })}
            />
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <FilterTag
              label={`Price: ₹${filters.minPrice || "0"}-₹${filters.maxPrice || "∞"}`}
              onRemove={() => onChange({ minPrice: "", maxPrice: "" })}
            />
          )}
          {(filters.minMileage || filters.maxMileage) && (
            <FilterTag
              label={`KMs: ${filters.minMileage || "0"}-${filters.maxMileage || "∞"}`}
              onRemove={() => onChange({ minMileage: "", maxMileage: "" })}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-red-600 hover:text-red-700 h-6"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Expandable filters panel */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="bg-white border rounded-xl p-4 sm:p-5 mb-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Fuel Type */}
              <div>
                <Label className="text-sm font-medium">Fuel Type</Label>
                <Select
                  value={filters.fuelType}
                  onValueChange={(v) => { if (v) onChange({ fuelType: v === "all" ? "" : v }); }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Fuel Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fuel Types</SelectItem>
                    {FUEL_TYPES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transmission */}
              <div>
                <Label className="text-sm font-medium">Transmission</Label>
                <Select
                  value={filters.transmission}
                  onValueChange={(v) => { if (v) onChange({ transmission: v === "all" ? "" : v }); }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Transmissions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transmissions</SelectItem>
                    {TRANSMISSIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <Select
                  value={filters.location}
                  onValueChange={(v) => { if (v) onChange({ location: v === "all" ? "" : v }); }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range */}
              <div>
                <Label className="text-sm font-medium">Year Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="From"
                    value={filters.minYear}
                    onChange={(e) => onChange({ minYear: e.target.value })}
                    min={2015}
                    max={2025}
                  />
                  <Input
                    type="number"
                    placeholder="To"
                    value={filters.maxYear}
                    onChange={(e) => onChange({ maxYear: e.target.value })}
                    min={2015}
                    max={2025}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium">Price Range (₹)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => onChange({ minPrice: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => onChange({ maxPrice: e.target.value })}
                  />
                </div>
              </div>

              {/* Mileage Range */}
              <div>
                <Label className="text-sm font-medium">Mileage (KMs)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minMileage}
                    onChange={(e) => onChange({ minMileage: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxMileage}
                    onChange={(e) => onChange({ maxMileage: e.target.value })}
                  />
                </div>
              </div>

              {/* Quick filters */}
              <div className="sm:col-span-2 lg:col-span-2">
                <Label className="text-sm font-medium mb-2 block">Quick Filters</Label>
                <div className="flex flex-wrap gap-2">
                  <QuickFilter
                    label="Under ₹5L"
                    active={filters.maxPrice === "500000"}
                    onClick={() =>
                      onChange({
                        maxPrice: filters.maxPrice === "500000" ? "" : "500000",
                        minPrice: "",
                      })
                    }
                  />
                  <QuickFilter
                    label="₹5L - ₹10L"
                    active={filters.minPrice === "500000" && filters.maxPrice === "1000000"}
                    onClick={() =>
                      onChange({
                        minPrice: filters.minPrice === "500000" ? "" : "500000",
                        maxPrice: filters.maxPrice === "1000000" ? "" : "1000000",
                      })
                    }
                  />
                  <QuickFilter
                    label="SUVs"
                    active={false}
                    onClick={() => {}}
                  />
                  <QuickFilter
                    label="Electric"
                    active={filters.fuelType === "Electric"}
                    onClick={() =>
                      onChange({
                        fuelType: filters.fuelType === "Electric" ? "" : "Electric",
                      })
                    }
                  />
                  <QuickFilter
                    label="Under 20K KMs"
                    active={filters.maxMileage === "20000"}
                    onClick={() =>
                      onChange({
                        maxMileage: filters.maxMileage === "20000" ? "" : "20000",
                        minMileage: "",
                      })
                    }
                  />
                  <QuickFilter
                    label="2021 or newer"
                    active={filters.minYear === "2021"}
                    onClick={() =>
                      onChange({
                        minYear: filters.minYear === "2021" ? "" : "2021",
                        maxYear: "",
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-3 border-t flex justify-end">
                <Button variant="ghost" size="sm" onClick={onClear}>
                  <X className="h-4 w-4 mr-1" />
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-blue-900 ml-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function QuickFilter({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      <Zap className="h-3 w-3" />
      {label}
    </button>
  );
}
