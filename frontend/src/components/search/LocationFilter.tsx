"use client";

import { useState } from "react";
import { MapPin, ChevronDown, X } from "lucide-react";
import { CITIES, type CityLocation } from "@/lib/location/cities";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface LocationFilterProps {
  selectedCity: CityLocation | null;
  onCityChange: (city: CityLocation | null) => void;
  detectedCity?: string | null;
}

export default function LocationFilter({ selectedCity, onCityChange, detectedCity }: LocationFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="inline-flex items-center justify-center gap-2 h-10 px-3 text-sm font-medium border-2 border-gray-200 bg-white rounded-md hover:border-orange-300 transition-colors cursor-pointer">
          <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
          {selectedCity ? (
            <span>{selectedCity.name}, {selectedCity.state}</span>
          ) : detectedCity ? (
            <span className="text-muted-foreground">{detectedCity}</span>
          ) : (
            <span className="text-muted-foreground">All Cities</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search city..." />
            <CommandList>
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup heading="Popular Cities">
                {detectedCity && (
                  <CommandItem
                    key="auto-detect"
                    value={`auto-${detectedCity}`}
                    onSelect={() => {
                      const city = CITIES.find(
                        (c) => c.name.toLowerCase() === detectedCity.toLowerCase()
                      );
                      onCityChange(city || null);
                      setOpen(false);
                    }}
                    className="bg-orange-50 text-orange-700"
                  >
                    <MapPin className="mr-2 h-4 w-4 text-orange-500" />
                    <span>Detect My Location</span>
                  </CommandItem>
                )}
                <CommandItem
                  key="all-cities"
                  value="all-cities"
                  onSelect={() => {
                    onCityChange(null);
                    setOpen(false);
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                  <span>All Cities</span>
                </CommandItem>
                {CITIES.map((city) => (
                  <CommandItem
                    key={city.name}
                    value={city.name}
                    onSelect={() => {
                      onCityChange(city);
                      setOpen(false);
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                    <span>{city.name}, {city.state}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCity && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => onCityChange(null)}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
