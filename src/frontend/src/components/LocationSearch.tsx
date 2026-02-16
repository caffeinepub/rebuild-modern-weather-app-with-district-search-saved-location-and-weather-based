import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { FloatingAutocompleteDropdown } from './FloatingAutocompleteDropdown';
import { useGeocodingSearch } from '../hooks/useGeocodingSearch';
import { useI18n } from '../i18n/useI18n';
import type { SavedLocation } from '../hooks/usePersistedLocation';

interface LocationSearchProps {
  onLocationSelect: (location: SavedLocation) => void;
  currentLocation: SavedLocation | null;
  onClearLocation: () => void;
}

export function LocationSearch({
  onLocationSelect,
  currentLocation,
  onClearLocation,
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const { results, isLoading, error } = useGeocodingSearch(query);
  const [showResults, setShowResults] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    setShowResults(query.length > 0 && results.length > 0);
  }, [query, results]);

  const handleSelect = (result: SavedLocation) => {
    onLocationSelect(result);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="glass-surface-strong rounded-2xl p-6 border-2">
      <div className="space-y-4">
        {/* Current Location Display */}
        {currentLocation && (
          <div className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/15 p-2.5">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">{currentLocation.name}</p>
                <p className="text-sm font-medium text-muted-foreground">
                  {currentLocation.country}
                  {currentLocation.admin1 && ` · ${currentLocation.admin1}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClearLocation}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Search Input */}
        <div ref={inputContainerRef} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('location.search.placeholder')}
              className="w-full rounded-xl border-2 border-border bg-background/50 pl-12 pr-12 py-4 text-lg font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
            )}
          </div>

          {/* Floating Results Dropdown */}
          <FloatingAutocompleteDropdown
            anchorRef={inputContainerRef}
            isOpen={showResults}
            onClose={() => setShowResults(false)}
          >
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors border-l-4 border-transparent hover:border-primary focus:outline-none focus:bg-accent/50 focus:border-primary"
                >
                  <div className="font-semibold text-base text-foreground">{result.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {result.country}
                    {result.admin1 && ` · ${result.admin1}`}
                  </div>
                </button>
              ))}
            </div>
          </FloatingAutocompleteDropdown>

          {error && (
            <p className="mt-2 text-sm text-destructive">{t('location.search.error')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
