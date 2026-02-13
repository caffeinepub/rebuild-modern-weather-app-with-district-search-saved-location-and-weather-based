import type { WeatherData } from '../hooks/useWeather';
import type { TranslationKey } from '../i18n/translations';

export type ImminentAlertType = 'rain' | 'snow' | 'storm' | 'fog';

export interface ImminentAlert {
  type: ImminentAlertType;
  key: string; // Stable dedupe key
  titleKey: TranslationKey;
  messageKey: TranslationKey;
  severity: 'info' | 'warning' | 'danger';
}

/**
 * Evaluates the next ~60 minutes of weather data and returns an imminent alert if any severe weather is detected.
 */
export function evaluateImminentWeatherAlerts(
  weatherData: WeatherData | undefined
): ImminentAlert | null {
  if (!weatherData?.hourly) return null;

  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  // Filter hourly data for the next hour (using the timestamp field)
  const nextHourData = weatherData.hourly.filter((hour) => {
    const hourTime = new Date(hour.timestamp);
    return hourTime >= now && hourTime <= oneHourFromNow;
  });

  if (nextHourData.length === 0) return null;

  // Check for storm/thunderstorm (highest priority)
  const hasStorm = nextHourData.some((hour) => hour.weatherCode === 95 || hour.weatherCode === 96 || hour.weatherCode === 99);
  if (hasStorm) {
    return {
      type: 'storm',
      key: 'storm-imminent',
      titleKey: 'alert.imminent.storm.title',
      messageKey: 'alert.imminent.storm.message',
      severity: 'danger',
    };
  }

  // Check for snow
  const hasSnow = nextHourData.some((hour) => 
    hour.weatherCode === 71 || hour.weatherCode === 73 || hour.weatherCode === 75 || 
    hour.weatherCode === 77 || hour.weatherCode === 85 || hour.weatherCode === 86
  );
  if (hasSnow) {
    return {
      type: 'snow',
      key: 'snow-imminent',
      titleKey: 'alert.imminent.snow.title',
      messageKey: 'alert.imminent.snow.message',
      severity: 'warning',
    };
  }

  // Check for rain
  const hasRain = nextHourData.some((hour) => 
    hour.weatherCode === 51 || hour.weatherCode === 53 || hour.weatherCode === 55 ||
    hour.weatherCode === 61 || hour.weatherCode === 63 || hour.weatherCode === 65 ||
    hour.weatherCode === 80 || hour.weatherCode === 81 || hour.weatherCode === 82
  );
  if (hasRain) {
    return {
      type: 'rain',
      key: 'rain-imminent',
      titleKey: 'alert.imminent.rain.title',
      messageKey: 'alert.imminent.rain.message',
      severity: 'info',
    };
  }

  // Check for fog (based on weather code or high humidity)
  const hasFog = nextHourData.some((hour) => 
    hour.weatherCode === 45 || hour.weatherCode === 48 || 
    (hour.humidity !== undefined && hour.humidity > 95)
  );
  if (hasFog) {
    return {
      type: 'fog',
      key: 'fog-imminent',
      titleKey: 'alert.imminent.fog.title',
      messageKey: 'alert.imminent.fog.message',
      severity: 'warning',
    };
  }

  return null;
}
