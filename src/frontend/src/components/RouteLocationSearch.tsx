import { useState, useRef, useEffect } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { useGeocodingSearch } from "../hooks/useGeocodingSearch";
import { FloatingAutocompleteDropdown } from "./FloatingAutocompleteDropdown";
import type { GeocodingResult } from "../lib/openMeteo";

interface RouteLocationSearchProps {
  label: string;
  onLocationSelect: (location: GeocodingResult) => void;
  onClear: () => void;
  currentLocation: GeocodingResult | null;
}

export function RouteLocationSearch({
  label,
  onLocationSelect,
  onClear,
  currentLocation,
}: RouteLocationSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, isLoading } = useGeocodingSearch(query);

  useEffect(() => {
    if (query.length > 0 && results && results.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query, results]);

  const handleSelect = (location: GeocodingResult) => {
    onLocationSelect(location);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onClear();
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <label className="block text-xs sm:text-sm font-medium mb-2">{label}</label>

      {currentLocation && (
        <div className="glass-surface p-3 sm:p-4 rounded-xl mb-2 sm:mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base truncate">{currentLocation.name}</p>
              <p className="text-xs sm:text-sm text-foreground/60 truncate">
                {currentLocation.admin1 && `${currentLocation.admin1}, `}
                {currentLocation.country}
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="ml-2 p-2 rounded-lg hover:bg-foreground/10 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
            aria-label="Clear"
          >
            <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      )}

      <div className="relative">
        <div className="glass-surface rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-3 sm:py-2">
            <Search className="w-5 h-5 sm:w-4 sm:h-4 text-foreground/60 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search location..."
              className="flex-1 bg-transparent outline-none text-base sm:text-sm placeholder:text-foreground/40 min-h-[44px] sm:min-h-[36px]"
            />
            {isLoading && (
              <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 text-primary animate-spin flex-shrink-0" />
            )}
          </div>
        </div>

        <FloatingAutocompleteDropdown
          isOpen={isOpen}
          anchorRef={inputRef as React.RefObject<HTMLElement>}
          onClose={() => setIsOpen(false)}
        >
          {results && results.length > 0 ? (
            <div className="py-2 sm:py-1">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-3 sm:px-3 sm:py-2 text-left hover:bg-foreground/10 transition-colors min-h-[44px] sm:min-h-[36px] flex items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-base sm:text-sm truncate">{result.name}</p>
                    <p className="text-xs sm:text-[11px] text-foreground/60 truncate">
                      {result.admin1 && `${result.admin1}, `}
                      {result.country}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 0 && !isLoading ? (
            <div className="px-4 py-3 sm:px-3 sm:py-2 text-foreground/60 text-base sm:text-sm">
              No results found
            </div>
          ) : null}
        </FloatingAutocompleteDropdown>
      </div>
    </div>
  );
}
