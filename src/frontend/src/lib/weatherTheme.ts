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
  const key = `weather.condition.${weatherCode}` as TranslationKey;
  // Return the key; the translation system will handle fallback
  return key;
}
