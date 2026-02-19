import { useState, useRef, useEffect } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { useGeocodingSearch } from "../hooks/useGeocodingSearch";
import { useI18n } from "../i18n/useI18n";
import { FloatingAutocompleteDropdown } from "./FloatingAutocompleteDropdown";
import type { SavedLocation } from "../hooks/usePersistedLocation";

interface LocationSearchProps {
  onLocationSelect: (location: SavedLocation) => void;
  onClearLocation: () => void;
  currentLocation: SavedLocation | null;
}

export function LocationSearch({ onLocationSelect, onClearLocation, currentLocation }: LocationSearchProps) {
  const { t } = useI18n();
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

  const handleSelect = (location: SavedLocation) => {
    onLocationSelect(location);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onClearLocation();
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {currentLocation && (
        <div className="glass-surface-strong p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-base sm:text-lg truncate">
                {currentLocation.name}
              </p>
              <p className="text-xs sm:text-sm text-foreground/60 truncate">
                {currentLocation.admin1 && `${currentLocation.admin1}, `}
                {currentLocation.country}
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="ml-2 p-2 sm:p-2.5 rounded-lg hover:bg-foreground/10 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center"
            aria-label="Clear location"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      <div className="relative">
        <div className="glass-surface-strong rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-3 sm:py-2">
            <Search className="w-5 h-5 sm:w-4 sm:h-4 text-foreground/60 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("location.search.placeholder")}
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
              {t("location.search.error")}
            </div>
          ) : null}
        </FloatingAutocompleteDropdown>
      </div>
    </div>
  );
}
