import { useQuery } from '@tanstack/react-query';
import type { SavedLocation } from './usePersistedLocation';
import { fetchRainViewerData } from '../lib/rainviewer';
import { getRainViewerCache, setRainViewerCache, validateCacheForForecast } from '../lib/rainviewerCache';
import { useActor } from './useActor';

export function useRainViewer(location: SavedLocation | null) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery({
    queryKey: ['rainviewer', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location || !actor) return null;

      // Check cache first
      const cached = getRainViewerCache();
      
      // Validate cached data structure
      if (cached) {
        const hasValidStructure =
          cached.host &&
          Array.isArray(cached.frames) &&
          Array.isArray(cached.pastFrames) &&
          Array.isArray(cached.nowcastFrames);
        
        // If structure is valid and usable for forecast, return it
        if (hasValidStructure && validateCacheForForecast(cached)) {
          return cached;
        }
        
        // If structure is valid but not usable for forecast (e.g., stale timestamps),
        // we'll fetch fresh data below
      }

      // Fetch fresh data from backend proxy
      const data = await fetchRainViewerData(actor);
      
      // Cache the fresh data
      setRainViewerCache(data);
      
      return data;
    },
    enabled: !!location && !!actor && !isActorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}
