import { useQuery } from '@tanstack/react-query';
import type { SavedLocation } from './usePersistedLocation';
import { fetchTemperatureGrid } from '../lib/openMeteo';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';

export interface RadarOverlayData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  snowfall: number;
  precipitation: number;
  stormIntensity: number;
  airQualityIndex: number | null;
  airQualityAvailable: boolean;
  // Grid data for temperature heatmap (sampled points around location)
  temperatureGrid?: Array<{ lat: number; lon: number; temp: number }>;
}

export function useRadarOverlayData(location: SavedLocation | null) {
  return useQuery<RadarOverlayData | null>({
    queryKey: ['radarOverlay', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) return null;

      // Fetch weather data from Open-Meteo for overlay information
      const params = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        current: 'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,snowfall,precipitation',
        timezone: 'auto',
      });

      const weatherResponse = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather overlay data from Open-Meteo');
      }

      const weatherData = await weatherResponse.json();

      // Fetch air quality data from Open-Meteo Air Quality API
      const aqParams = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        current: 'european_aqi',
        timezone: 'auto',
      });

      let airQualityIndex: number | null = null;
      let airQualityAvailable = false;

      try {
        const aqResponse = await fetchWithTimeout(`https://air-quality-api.open-meteo.com/v1/air-quality?${aqParams}`);
        
        if (aqResponse.ok) {
          const aqData = await aqResponse.json();
          airQualityIndex = aqData.current?.european_aqi ?? null;
          airQualityAvailable = airQualityIndex !== null;
        }
      } catch (error) {
        console.warn('Air quality data not available:', error);
      }

      // Fetch temperature grid for heatmap overlay
      let temperatureGrid: Array<{ lat: number; lon: number; temp: number }> | undefined;
      try {
        temperatureGrid = await fetchTemperatureGrid(location.latitude, location.longitude);
      } catch (error) {
        console.warn('Temperature grid not available:', error);
      }

      // Calculate storm intensity from precipitation and wind
      const precipitation = weatherData.current?.precipitation ?? 0;
      const windSpeed = weatherData.current?.wind_speed_10m ?? 0;
      const stormIntensity = Math.min(100, (precipitation * 10 + windSpeed * 2));

      return {
        temperature: weatherData.current?.temperature_2m ?? 0,
        windSpeed: weatherData.current?.wind_speed_10m ?? 0,
        windDirection: weatherData.current?.wind_direction_10m ?? 0,
        windGusts: weatherData.current?.wind_gusts_10m ?? 0,
        snowfall: weatherData.current?.snowfall ?? 0,
        precipitation: weatherData.current?.precipitation ?? 0,
        stormIntensity,
        airQualityIndex,
        airQualityAvailable,
        temperatureGrid,
      };
    },
    enabled: !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}
