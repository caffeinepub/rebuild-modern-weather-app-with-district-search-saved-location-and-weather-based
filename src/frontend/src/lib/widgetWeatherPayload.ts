import type { WeatherData } from '../hooks/useWeather';
import type { SavedLocation } from '../hooks/usePersistedLocation';
import type { WeatherResponse } from '../backend';

/**
 * Generates a stable key for the weather payload based on location.
 * This key is used to identify and update the cached weather data in the backend.
 */
export function generatePublishKey(location: SavedLocation): string {
  // Create a deterministic key from city and country
  const city = location.name.toLowerCase().replace(/\s+/g, '-');
  const country = location.country.toLowerCase().replace(/\s+/g, '-');
  return `${city}_${country}`;
}

/**
 * Transforms the frontend WeatherData shape into the backend-compatible WeatherResponse format.
 * Uses safe defaults for missing values to ensure the payload is always valid.
 */
export function transformToWidgetPayload(
  weatherData: WeatherData,
  location: SavedLocation
): WeatherResponse {
  // Transform daily forecast (use first 7 days for weekly)
  const weekly = weatherData.daily.slice(0, 7).map((day) => ({
    timestamp: BigInt(new Date(day.date).getTime()),
    temperature: (day.temperatureMax + day.temperatureMin) / 2,
    condition: mapWeatherCodeToCondition(day.weatherCode),
    precipitation: {
      amount: day.precipitationSum || 0,
      probability: 0, // Daily data doesn't include probability
    },
    windSpeed: 0, // Daily data doesn't include wind speed
    windDir: 0, // Daily data doesn't include wind direction
  }));

  return {
    city: location.name,
    country: location.country,
    daily: {
      temperature: weatherData.current.temperature,
      condition: mapWeatherCodeToCondition(weatherData.current.weatherCode),
      precipitation: {
        amount: weatherData.hourly[0]?.precipitation || 0,
        probability: 0, // Current data doesn't include probability
      },
      windSpeed: weatherData.current.windSpeed,
      windDir: weatherData.current.windDirection,
    },
    weekly,
  };
}

/**
 * Maps WMO weather codes to human-readable condition strings.
 * Returns safe defaults for unknown codes.
 */
function mapWeatherCodeToCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}
