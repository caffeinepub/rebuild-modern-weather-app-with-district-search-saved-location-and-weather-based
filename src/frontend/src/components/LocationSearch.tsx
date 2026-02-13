import { useState, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="glass-surface-strong rounded-2xl">
      <CardContent className="p-6">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearLocation}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg focus-ring-strong"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('location.search.placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-12 h-12 text-base font-medium border-2 focus:border-primary/50 rounded-xl"
              />
              {isLoading && (
                <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
              )}
            </div>

            {/* Results Dropdown */}
            {showResults && (
              <div className="absolute top-full z-50 mt-2 w-full rounded-xl glass-surface-strong shadow-xl">
                <div className="max-h-[300px] overflow-y-auto p-2">
                  {results.map((result, index) => (
                    <button
                      key={`${result.latitude}-${result.longitude}-${index}`}
                      onClick={() => handleSelect(result)}
                      className="flex w-full items-start gap-3 rounded-lg p-4 text-left transition-all hover:bg-accent/40 hover:scale-[1.02] active:scale-[0.98] focus-ring-strong"
                    >
                      <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-foreground">{result.name}</p>
                        <div className="flex flex-wrap gap-2 text-sm font-medium text-muted-foreground">
                          {result.admin1 && <span>{result.admin1}</span>}
                          <span>{result.country}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && query.length > 0 && (
              <p className="mt-2 text-sm font-medium text-destructive">
                {t('location.search.error')}
              </p>
            )}

            {/* No Results */}
            {!isLoading && query.length > 0 && results.length === 0 && !error && (
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {t('location.search.noResults')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
