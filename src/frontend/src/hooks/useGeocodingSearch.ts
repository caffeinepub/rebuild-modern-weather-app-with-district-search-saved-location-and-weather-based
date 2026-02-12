import { useState, useEffect } from 'react';
import { searchLocations, type GeocodingResult } from '../lib/openMeteo';
import { useDebounce } from 'react-use';

export function useGeocodingSearch(query: string) {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the query to avoid too many API calls
  useDebounce(
    () => {
      setDebouncedQuery(query);
    },
    500,
    [query]
  );

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await searchLocations(debouncedQuery);
        if (!cancelled) {
          setResults(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Search failed'));
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchResults();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return {
    results,
    isLoading,
    error,
  };
}
