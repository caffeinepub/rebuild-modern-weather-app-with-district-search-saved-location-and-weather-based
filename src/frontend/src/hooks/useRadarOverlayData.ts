import { useQuery } from '@tanstack/react-query';
import type { SavedLocation } from './usePersistedLocation';
import { fetchTemperatureGrid } from '../lib/openMeteo';

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

      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch overlay weather data');
      }

      const weatherData = await weatherResponse.json();
      const current = weatherData.current;

      // Extract weather values
      const temperature = current.temperature_2m || 0;
      const windSpeed = current.wind_speed_10m || 0;
      const windDirection = current.wind_direction_10m || 0;
      const windGusts = current.wind_gusts_10m || 0;
      const snowfall = current.snowfall || 0;
      const precipitation = current.precipitation || 0;
      
      // Storm intensity based on wind speed and gusts
      const stormIntensity = windSpeed > 30 || windGusts > 40 
        ? Math.min(Math.max(windSpeed, windGusts) / 10, 10) 
        : 0;
      
      // Fetch air quality data from Open-Meteo Air Quality API
      let airQualityIndex: number | null = null;
      let airQualityAvailable = false;

      try {
        const aqiParams = new URLSearchParams({
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          current: 'us_aqi,european_aqi',
          timezone: 'auto',
        });

        const aqiResponse = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${aqiParams}`);
        
        if (aqiResponse.ok) {
          const aqiData = await aqiResponse.json();
          const currentAqi = aqiData.current;
          
          // Prefer US AQI, fallback to European AQI
          if (currentAqi.us_aqi !== null && currentAqi.us_aqi !== undefined) {
            airQualityIndex = currentAqi.us_aqi;
            airQualityAvailable = true;
          } else if (currentAqi.european_aqi !== null && currentAqi.european_aqi !== undefined) {
            // Convert European AQI (0-100+) to US AQI scale (0-500) for consistency
            airQualityIndex = Math.min(currentAqi.european_aqi * 2.5, 500);
            airQualityAvailable = true;
          }
        }
      } catch (error) {
        // Air quality data unavailable - not a critical error
        console.warn('Air quality data unavailable:', error);
      }

      // Fetch temperature grid for heatmap-style visualization
      const temperatureGrid = await fetchTemperatureGrid(location.latitude, location.longitude);

      return {
        temperature,
        windSpeed,
        windDirection,
        windGusts,
        snowfall,
        precipitation,
        stormIntensity,
        airQualityIndex,
        airQualityAvailable,
        temperatureGrid,
      };
    },
    enabled: !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
