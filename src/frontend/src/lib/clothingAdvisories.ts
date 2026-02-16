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
const PRECIP_THRESHOLD_PER_HOUR = 0.3; // mm/hour - meaningful precipitation
const NEAR_TERM_HOURS = 3; // Check next 3 hours for umbrella

/**
 * Check if a weather code indicates rain or snow
 */
function isRainOrSnowCode(weatherCode: number): boolean {
  // WMO codes:
  // 51-67: Drizzle and rain
  // 71-77, 85-86: Snow
  // 80-82: Rain showers
  // 95-99: Thunderstorm
  return (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 80 && weatherCode <= 86) ||
    (weatherCode >= 95 && weatherCode <= 99)
  );
}

/**
 * Generates clothing and weather advisories based on current and near-term weather data.
 * 
 * @param weatherData - The weather data from Open-Meteo API
 * @returns Array of advisory items to display
 */
export function getClothingAdvisories(weatherData: WeatherData): ClothingAdvisory[] {
  const advisories: ClothingAdvisory[] = [];
  
  const { apparentTemperature, windSpeed, weatherCode: currentWeatherCode } = weatherData.current;
  
  // Check near-term (next 3 hours) for precipitation
  const nearTermHours = weatherData.hourly.slice(0, NEAR_TERM_HOURS);
  
  // Check if current or near-term weather codes indicate rain/snow
  const hasRainOrSnowCode = isRainOrSnowCode(currentWeatherCode) || 
    nearTermHours.some(hour => isRainOrSnowCode(hour.weatherCode));
  
  // Check for meaningful precipitation in near-term hours
  const maxHourlyPrecip = Math.max(...nearTermHours.map(h => h.precipitation));
  const hasMeaningfulPrecip = maxHourlyPrecip > PRECIP_THRESHOLD_PER_HOUR;
  
  // Recommend umbrella only if there's meaningful precipitation OR rain/snow codes
  const needsUmbrella = hasRainOrSnowCode || hasMeaningfulPrecip;
  
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
  if (needsUmbrella) {
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
