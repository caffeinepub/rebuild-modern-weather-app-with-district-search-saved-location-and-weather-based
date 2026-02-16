import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { WeatherResponse } from '../backend';

interface PublishParams {
  key: string;
  payload: WeatherResponse;
}

/**
 * Hook that provides a mutation function to publish weather data to the backend.
 * The backend stores this data so it can be served via HTTP endpoint for Android widgets.
 * Failures are handled gracefully and do not throw errors.
 */
export function usePublishWidgetWeather() {
  const { actor } = useActor();

  const mutation = useMutation({
    mutationFn: async ({ key, payload }: PublishParams) => {
      if (!actor) {
        throw new Error('Backend actor not available');
      }
      
      const result = await actor.upsertWeather(key, payload);
      return result;
    },
    onError: (error) => {
      // Log error but don't crash the UI
      console.warn('Failed to publish weather data to backend:', error);
    },
  });

  return {
    publish: mutation.mutate,
    isPublishing: mutation.isPending,
    publishError: mutation.error,
    publishSuccess: mutation.isSuccess,
  };
}
