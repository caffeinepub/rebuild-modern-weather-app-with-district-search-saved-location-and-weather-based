import type { WeatherData } from '../hooks/useWeather';
import type { TranslationKey } from '../i18n/translations';

export interface ClothingAdvisory {
  key: TranslationKey;
  icon: 'light' | 'coat' | 'umbrella' | 'wind';
}

// Thresholds for clothing recommendations
const TEMP_COLD = 10; // Below this, recommend coat
const TEMP_HOT = 25; // Above this, recommend light clothing
const WIND_MODERATE = 20; // km/h - moderate wind warning
const PRECIP_THRESHOLD = 0.5; // mm - precipitation threshold for umbrella

/**
 * Generates clothing and weather advisories based on current and near-term weather data.
 * 
 * @param weatherData - The weather data from Open-Meteo API
 * @returns Array of advisory items to display
 */
export function getClothingAdvisories(weatherData: WeatherData): ClothingAdvisory[] {
  const advisories: ClothingAdvisory[] = [];
  
  const { apparentTemperature, windSpeed } = weatherData.current;
  
  // Check next 6 hours for precipitation
  const next6Hours = weatherData.hourly.slice(0, 6);
  const totalPrecipitation = next6Hours.reduce((sum, hour) => sum + hour.precipitation, 0);
  const hasPrecipitation = totalPrecipitation > PRECIP_THRESHOLD;
  
  // Temperature-based recommendations
  if (apparentTemperature <= TEMP_COLD) {
    advisories.push({
      key: 'clothing.coat',
      icon: 'coat',
    });
  } else if (apparentTemperature >= TEMP_HOT) {
    advisories.push({
      key: 'clothing.light',
      icon: 'light',
    });
  }
  
  // Precipitation-based recommendation
  if (hasPrecipitation) {
    advisories.push({
      key: 'clothing.umbrella',
      icon: 'umbrella',
    });
  }
  
  // Wind-based recommendation
  if (windSpeed >= WIND_MODERATE) {
    advisories.push({
      key: 'clothing.wind',
      icon: 'wind',
    });
  }
  
  // If no specific advisories, return a default comfortable message
  if (advisories.length === 0) {
    advisories.push({
      key: 'clothing.comfortable',
      icon: 'light',
    });
  }
  
  return advisories;
}
