import { useQuery } from '@tanstack/react-query';
import type { SavedLocation } from './usePersistedLocation';
import { parseRainViewerData } from '../lib/rainviewer';
import { getRainViewerCache, setRainViewerCache } from '../lib/rainviewerCache';
import { useActor } from './useActor';

export function useRainViewer(location: SavedLocation | null) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery({
    queryKey: ['rainviewer', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location || !actor) return null;

      // Check cache first
      const cached = getRainViewerCache();
      if (cached) {
        // Validate cached data has required structure
        if (
          cached.host &&
          Array.isArray(cached.frames) &&
          Array.isArray(cached.pastFrames) &&
          Array.isArray(cached.nowcastFrames)
        ) {
          return cached;
        }
        // Invalid cache - will fetch fresh data
      }

      // Fetch from backend-cached RainViewer endpoint
      const jsonString = await actor.getBackendCachedRainViewer();
      
      if (!jsonString || jsonString.trim() === '') {
        throw new Error('Empty response from backend');
      }

      // Parse and normalize the data
      const data = parseRainViewerData(jsonString);
      
      // Validate parsed data
      if (!data.host || !Array.isArray(data.frames)) {
        throw new Error('Invalid RainViewer data structure');
      }

      setRainViewerCache(data);
      return data;
    },
    enabled: !!location && !!actor && !isActorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}
