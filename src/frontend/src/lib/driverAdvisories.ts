import type { WeatherData } from '../hooks/useWeather';
import type { TranslationKey } from '../i18n/translations';

export interface RoadIceRisk {
  status: 'safe' | 'caution' | 'danger';
  messageKey: TranslationKey;
  minTemp: number;
}

export interface FogWarning {
  status: 'safe' | 'caution' | 'danger';
  messageKey: TranslationKey;
  humidity: number;
}

export function calculateRoadIceRisk(weatherData: WeatherData): RoadIceRisk {
  const currentTemp = weatherData.current.temperature;
  const apparentTemp = weatherData.current.apparentTemperature;
  
  // Check next 12 hours for freezing conditions
  const next12Hours = weatherData.hourly.slice(0, 12);
  const minTemp = Math.min(currentTemp, ...next12Hours.map(h => h.temperature));
  const hasPrecipitation = next12Hours.some(h => h.precipitation > 0);

  // Danger: Below freezing with precipitation or apparent temp significantly lower
  if (minTemp < 0 && (hasPrecipitation || apparentTemp < -2)) {
    return {
      status: 'danger',
      messageKey: 'ice.danger',
      minTemp,
    };
  }

  // Caution: Near freezing (0-3°C) or below freezing without precipitation
  if (minTemp < 3) {
    return {
      status: 'caution',
      messageKey: 'ice.caution',
      minTemp,
    };
  }

  // Safe: Above 3°C
  return {
    status: 'safe',
    messageKey: 'ice.safe',
    minTemp,
  };
}

export function calculateFogWarning(weatherData: WeatherData): FogWarning {
  const currentHumidity = weatherData.current.humidity;
  const currentCloudCover = weatherData.current.cloudCover;
  const currentWeatherCode = weatherData.current.weatherCode;
  
  // Check next 6 hours for fog conditions
  const next6Hours = weatherData.hourly.slice(0, 6);
  const avgHumidity = next6Hours.reduce((sum, h) => sum + (h.temperature > 0 ? 100 : 0), currentHumidity) / (next6Hours.length + 1);
  
  // Fog weather codes: 45 (fog), 48 (depositing rime fog)
  const hasFogCode = currentWeatherCode === 45 || currentWeatherCode === 48;
  
  // Danger: Fog weather code or very high humidity with high cloud cover
  if (hasFogCode || (currentHumidity > 90 && currentCloudCover > 80)) {
    return {
      status: 'danger',
      messageKey: 'fog.danger',
      humidity: currentHumidity,
    };
  }

  // Caution: High humidity (80-90%) with moderate cloud cover
  if (currentHumidity > 80 && currentCloudCover > 60) {
    return {
      status: 'caution',
      messageKey: 'fog.caution',
      humidity: currentHumidity,
    };
  }

  // Safe: Lower humidity or clear conditions
  return {
    status: 'safe',
    messageKey: 'fog.safe',
    humidity: currentHumidity,
  };
}
