import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, X } from 'lucide-react';
import { FloatingAutocompleteDropdown } from './FloatingAutocompleteDropdown';
import { useGeocodingSearch } from '../hooks/useGeocodingSearch';
import type { GeocodingResult } from '../lib/openMeteo';

interface RouteLocationSearchProps {
  placeholder: string;
  onLocationSelect: (location: GeocodingResult | null) => void;
  selectedLocation: GeocodingResult | null;
}

export function RouteLocationSearch({ placeholder, onLocationSelect, selectedLocation }: RouteLocationSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement | null>(null);

  const { results, isLoading, error } = useGeocodingSearch(query);

  const handleSelect = (location: GeocodingResult) => {
    onLocationSelect(location);
    setQuery('');
    setShowResults(false);
  };

  const handleClear = () => {
    onLocationSelect(null);
    setQuery('');
  };

  return (
    <div className="relative">
      {selectedLocation ? (
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/50 p-3">
          <MapPin className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{selectedLocation.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedLocation.admin1 && `${selectedLocation.admin1}, `}
              {selectedLocation.country}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <div ref={inputContainerRef} className="relative">
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="pr-10"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          <FloatingAutocompleteDropdown
            anchorRef={inputContainerRef}
            isOpen={showResults && query.length > 0}
            onClose={() => setShowResults(false)}
          >
            {error && (
              <div className="p-4 text-sm text-destructive">
                Failed to search locations
              </div>
            )}

            {!error && results.length === 0 && !isLoading && (
              <div className="p-4 text-sm text-muted-foreground">
                No locations found
              </div>
            )}

            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/40 last:border-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{result.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.admin1 && `${result.admin1}, `}
                      {result.country}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </FloatingAutocompleteDropdown>
        </>
      )}
    </div>
  );
}
