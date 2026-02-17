import { useQuery } from '@tanstack/react-query';
import type { SavedLocation } from './usePersistedLocation';
import { parseRainViewerData } from '../lib/rainviewer';
import type { RainViewerData } from '../lib/rainviewer';
import { getRainViewerCache, setRainViewerCache } from '../lib/rainviewerCache';
import { useActor } from './useActor';

/**
 * Validates that RainViewerData has safe array structures
 */
function validateRainViewerData(data: any): data is RainViewerData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.host === 'string' &&
    Array.isArray(data.frames) &&
    Array.isArray(data.pastFrames) &&
    Array.isArray(data.nowcastFrames)
  );
}

export function useRainViewer(location: SavedLocation | null) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery({
    queryKey: ['rainviewer', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location || !actor) return null;

      // Check cache first
      const cached = getRainViewerCache();
      if (cached && validateRainViewerData(cached)) {
        return cached;
      }

      // Fetch from backend-cached RainViewer endpoint
      const jsonString = await actor.getBackendCachedRainViewer();
      
      if (!jsonString || jsonString.trim() === '') {
        throw new Error('Empty response from backend');
      }

      // Parse and normalize the data
      const data = parseRainViewerData(jsonString);
      
      // Validate parsed data structure
      if (!validateRainViewerData(data)) {
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
