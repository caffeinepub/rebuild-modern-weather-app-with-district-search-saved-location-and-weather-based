import { Sun, Cloud, CloudRain, CloudSnow, type LucideIcon } from 'lucide-react';
import type { TranslationKey } from '../i18n/translations';

type WeatherTheme = 'clear' | 'cloudy' | 'rain' | 'snow';

// WMO Weather interpretation codes
// https://open-meteo.com/en/docs
export function getWeatherTheme(weatherCode: number): WeatherTheme {
  if (weatherCode === 0 || weatherCode === 1) {
    return 'clear';
  } else if (weatherCode === 2 || weatherCode === 3 || weatherCode === 45 || weatherCode === 48) {
    return 'cloudy';
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    return 'snow';
  } else if (weatherCode >= 51 && weatherCode <= 67) {
    return 'rain';
  } else if (weatherCode >= 80 && weatherCode <= 99) {
    return 'rain';
  }
  return 'clear';
}

export function getWeatherIcon(weatherCode: number): LucideIcon {
  const theme = getWeatherTheme(weatherCode);
  switch (theme) {
    case 'clear':
      return Sun;
    case 'cloudy':
      return Cloud;
    case 'rain':
      return CloudRain;
    case 'snow':
      return CloudSnow;
    default:
      return Sun;
  }
}

export function getWeatherDescriptionKey(weatherCode: number): TranslationKey {
  // Map WMO weather codes to translation keys
  // Reference: https://open-meteo.com/en/docs
  
  // Clear sky
  if (weatherCode === 0) {
    return 'weather.condition.clear';
  }
  
  // Mainly clear
  if (weatherCode === 1) {
    return 'weather.condition.mainlyClear';
  }
  
  // Partly cloudy
  if (weatherCode === 2) {
    return 'weather.condition.partlyCloudy';
  }
  
  // Overcast
  if (weatherCode === 3) {
    return 'weather.condition.overcast';
  }
  
  // Fog
  if (weatherCode === 45 || weatherCode === 48) {
    return 'weather.condition.fog';
  }
  
  // Drizzle (51, 53, 55)
  if (weatherCode >= 51 && weatherCode <= 55) {
    return 'weather.condition.drizzle';
  }
  
  // Freezing drizzle (56, 57)
  if (weatherCode === 56 || weatherCode === 57) {
    return 'weather.condition.drizzle';
  }
  
  // Rain (61, 63, 65)
  if (weatherCode >= 61 && weatherCode <= 65) {
    return 'weather.condition.rain';
  }
  
  // Freezing rain (66, 67)
  if (weatherCode === 66 || weatherCode === 67) {
    return 'weather.condition.rain';
  }
  
  // Snow (71, 73, 75, 77, 85, 86)
  if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
    return 'weather.condition.snow';
  }
  
  // Rain showers (80, 81, 82)
  if (weatherCode >= 80 && weatherCode <= 82) {
    return 'weather.condition.showers';
  }
  
  // Thunderstorm (95, 96, 99)
  if (weatherCode >= 95 && weatherCode <= 99) {
    return 'weather.condition.thunderstorm';
  }
  
  // Default fallback
  return 'weather.condition.clear';
}
