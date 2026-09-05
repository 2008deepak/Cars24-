"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Fuse from "fuse.js";
import { createFuseInstance, getSuggestions, type Car } from "@/lib/search/engine";
import { Input } from "@/components/ui/input";
import { Search, X, TrendingUp, Car as CarIcon, MapPin } from "lucide-react";

interface AdvancedSearchBarProps {
  cars: Car[];
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
}

const categoryIcons: Record<string, typeof Search> = {
  Brand: CarIcon,
  Model: TrendingUp,
  Location: MapPin,
};

export default function AdvancedSearchBar({
  cars,
  value,
  onChange,
  onSearch,
  placeholder = "Search by brand, model, or location...",
}: AdvancedSearchBarProps) {
  const [suggestions, setSuggestions] = useState<
    Array<{ text: string; category: string; car?: Car }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fuseRef = useRef<Fuse<Car> | null>(null);

  useEffect(() => {
    if (cars.length > 0) {
      fuseRef.current = createFuseInstance(cars);
    }
  }, [cars]);

  useEffect(() => {
    if (fuseRef.current && value.length > 0) {
      const results = getSuggestions(fuseRef.current, value, 6);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions) {
        if (e.key === "Enter") {
          onSearch(value);
          setShowSuggestions(false);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            const s = suggestions[selectedIndex];
            onChange(s.text);
            onSearch(s.text);
          } else {
            onSearch(value);
          }
          setShowSuggestions(false);
          break;
        case "Escape":
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [showSuggestions, suggestions, selectedIndex, value, onChange, onSearch]
  );

  const handleSuggestionClick = (suggestion: {
    text: string;
    category: string;
  }) => {
    onChange(suggestion.text);
    onSearch(suggestion.text);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    onChange("");
    onSearch("");
    inputRef.current?.focus();
  };

  // Group suggestions by category
  const grouped = suggestions.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, typeof suggestions>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className="pl-12 pr-10 h-14 text-base rounded-xl border-2 focus:border-blue-500 shadow-sm"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {Object.entries(grouped).map(([category, items]) => {
            const Icon = categoryIcons[category] || Search;
            return (
              <div key={category}>
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <Icon className="h-3 w-3" />
                  {category}
                </div>
                {items.map((suggestion, idx) => {
                  const globalIdx = suggestions.indexOf(suggestion);
                  const isSelected = globalIdx === selectedIndex;

                  // Highlight matching text
                  const queryLower = value.toLowerCase();
                  const textLower = suggestion.text.toLowerCase();
                  const matchStart = textLower.indexOf(queryLower);
                  let textContent;
                  if (matchStart >= 0 && value) {
                    textContent = (
                      <>
                        {suggestion.text.slice(0, matchStart)}
                        <span className="font-bold text-blue-600">
                          {suggestion.text.slice(matchStart, matchStart + value.length)}
                        </span>
                        {suggestion.text.slice(matchStart + value.length)}
                      </>
                    );
                  } else {
                    textContent = suggestion.text;
                  }

                  return (
                    <button
                      key={`${category}-${suggestion.text}-${idx}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                        isSelected
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{textContent}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Search for query */}
          {value && (
            <div className="border-t">
              <button
                onClick={() => {
                  onSearch(value);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-3 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-3"
              >
                <Search className="h-4 w-4" />
                Search for &quot;{value}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
