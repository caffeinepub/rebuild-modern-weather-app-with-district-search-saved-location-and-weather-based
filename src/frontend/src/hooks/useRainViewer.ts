import { useQuery } from '@tanstack/react-query';
import type { SavedLocation } from './usePersistedLocation';
import { fetchRainViewerData } from '../lib/rainviewer';
import { getRainViewerCache, setRainViewerCache } from '../lib/rainviewerCache';

export function useRainViewer(location: SavedLocation | null) {
  return useQuery({
    queryKey: ['rainviewer', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) return null;

      // Check cache first
      const cached = getRainViewerCache();
      if (cached) {
        return cached;
      }

      // Fetch fresh data
      const data = await fetchRainViewerData();
      setRainViewerCache(data);
      return data;
    },
    enabled: !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}
