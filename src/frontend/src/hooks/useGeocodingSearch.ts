import { useQuery } from '@tanstack/react-query';
import { searchLocations, type GeocodingResult } from '../lib/openMeteo';
import { useDebounce } from 'react-use';
import { useState } from 'react';

export function useGeocodingSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the query to avoid too many API calls
  useDebounce(
    () => {
      setDebouncedQuery(query);
    },
    500,
    [query]
  );

  const { data: results = [], isLoading, error } = useQuery<GeocodingResult[]>({
    queryKey: ['geocoding', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return [];
      }
      return searchLocations(debouncedQuery);
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    results,
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
