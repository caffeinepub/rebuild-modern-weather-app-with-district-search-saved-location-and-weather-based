import type { WeatherData } from '../hooks/useWeather';
import type { TranslationKey } from '../i18n/translations';

export interface RouteFactor {
  type: 'freezing' | 'fog' | 'precipitation' | 'wind';
  messageKey: TranslationKey;
  severity: 'low' | 'medium' | 'high';
}

export interface RouteAnalysis {
  overallRisk: 'safe' | 'caution' | 'danger';
  summaryKey: TranslationKey;
  factors: RouteFactor[];
}

export function analyzeRouteWeather(weatherDataPoints: WeatherData[]): RouteAnalysis {
  const factors: RouteFactor[] = [];
  let riskScore = 0;

  // Analyze freezing conditions across route
  const minTemps = weatherDataPoints.map(w => Math.min(...w.hourly.slice(0, 12).map(h => h.temperature)));
  const lowestTemp = Math.min(...minTemps);
  
  if (lowestTemp < -5) {
    factors.push({
      type: 'freezing',
      messageKey: 'route.factor.freezing.severe',
      severity: 'high',
    });
    riskScore += 3;
  } else if (lowestTemp < 0) {
    factors.push({
      type: 'freezing',
      messageKey: 'route.factor.freezing.moderate',
      severity: 'medium',
    });
    riskScore += 2;
  } else if (lowestTemp < 3) {
    factors.push({
      type: 'freezing',
      messageKey: 'route.factor.freezing.light',
      severity: 'low',
    });
    riskScore += 1;
  }

  // Analyze fog likelihood
  const avgHumidity = weatherDataPoints.reduce((sum, w) => sum + w.current.humidity, 0) / weatherDataPoints.length;
  const hasFogCode = weatherDataPoints.some(w => w.current.weatherCode === 45 || w.current.weatherCode === 48);
  
  if (hasFogCode || avgHumidity > 90) {
    factors.push({
      type: 'fog',
      messageKey: 'route.factor.fog.high',
      severity: 'high',
    });
    riskScore += 2;
  } else if (avgHumidity > 80) {
    factors.push({
      type: 'fog',
      messageKey: 'route.factor.fog.moderate',
      severity: 'medium',
    });
    riskScore += 1;
  }

  // Analyze precipitation
  const totalPrecip = weatherDataPoints.reduce((sum, w) => {
    return sum + w.hourly.slice(0, 12).reduce((s, h) => s + h.precipitation, 0);
  }, 0) / weatherDataPoints.length;
  
  if (totalPrecip > 10) {
    factors.push({
      type: 'precipitation',
      messageKey: 'route.factor.precip.heavy',
      severity: 'high',
    });
    riskScore += 2;
  } else if (totalPrecip > 3) {
    factors.push({
      type: 'precipitation',
      messageKey: 'route.factor.precip.moderate',
      severity: 'medium',
    });
    riskScore += 1;
  }

  // Analyze wind
  const maxWind = Math.max(...weatherDataPoints.map(w => Math.max(...w.hourly.slice(0, 12).map(h => h.windSpeed))));
  
  if (maxWind > 50) {
    factors.push({
      type: 'wind',
      messageKey: 'route.factor.wind.high',
      severity: 'high',
    });
    riskScore += 2;
  } else if (maxWind > 30) {
    factors.push({
      type: 'wind',
      messageKey: 'route.factor.wind.moderate',
      severity: 'medium',
    });
    riskScore += 1;
  }

  // Determine overall risk
  let overallRisk: 'safe' | 'caution' | 'danger';
  let summaryKey: TranslationKey;
  
  if (riskScore >= 5) {
    overallRisk = 'danger';
    summaryKey = 'driver.route.summary.danger';
  } else if (riskScore >= 2) {
    overallRisk = 'caution';
    summaryKey = 'driver.route.summary.caution';
  } else {
    overallRisk = 'safe';
    summaryKey = 'driver.route.summary.safe';
  }

  return {
    overallRisk,
    summaryKey,
    factors,
  };
}
