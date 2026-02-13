import { useQuery } from '@tanstack/react-query';
import { fetchMarineData, type MarineConditions } from '../lib/openMeteoMarine';

export function useMarineConditions(
  latitude: number | undefined,
  longitude: number | undefined
) {
  return useQuery<MarineConditions>({
    queryKey: ['marineConditions', latitude, longitude],
    queryFn: async () => {
      if (!latitude || !longitude) {
        throw new Error('Location coordinates are required');
      }
      return fetchMarineData(latitude, longitude);
    },
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}
