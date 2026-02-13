import type { WeatherData } from '../hooks/useWeather';
import type { TranslationKey } from '../i18n/translations';

export interface FrostAdvisory {
  status: 'safe' | 'warning' | 'danger';
  minTemp: number;
  timeframe: string;
  message: TranslationKey;
}

export interface SoilMoistureAdvisory {
  status: 'dry' | 'optimal' | 'wet';
  avgMoisture: number;
  message: TranslationKey;
}

export interface PrecipitationAdvisory {
  totalPrecip: number;
  nextHours: Array<{ time: string; amount: number }>;
  message: TranslationKey;
}

export interface PlantingAdvisory {
  status: 'favorable' | 'moderate' | 'unfavorable';
  factors: TranslationKey[];
  message: TranslationKey;
}

export interface SprayingAdvisory {
  status: 'safe' | 'caution' | 'unsafe';
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  message: TranslationKey;
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function calculateFrostAdvisory(weatherData: WeatherData): FrostAdvisory {
  const next12Hours = weatherData.hourly.slice(0, 12);
  const minTemp = Math.min(...next12Hours.map(h => h.temperature));
  
  let status: 'safe' | 'warning' | 'danger';
  let message: TranslationKey;
  
  if (minTemp <= 0) {
    status = 'danger';
    message = 'frost.danger';
  } else if (minTemp <= 4) {
    status = 'warning';
    message = 'frost.warning';
  } else {
    status = 'safe';
    message = 'frost.safe';
  }
  
  return {
    status,
    minTemp,
    timeframe: '12h',
    message,
  };
}

export function calculateSoilMoistureAdvisory(weatherData: WeatherData): SoilMoistureAdvisory {
  const next24Hours = weatherData.hourly.slice(0, 24);
  const avgMoisture = next24Hours.reduce((sum, h) => sum + h.soilMoisture, 0) / next24Hours.length;
  
  let status: 'dry' | 'optimal' | 'wet';
  let message: TranslationKey;
  
  if (avgMoisture < 0.15) {
    status = 'dry';
    message = 'soil.dry';
  } else if (avgMoisture > 0.35) {
    status = 'wet';
    message = 'soil.wet';
  } else {
    status = 'optimal';
    message = 'soil.optimal';
  }
  
  return {
    status,
    avgMoisture: avgMoisture * 100,
    message,
  };
}

export function calculatePrecipitationAdvisory(weatherData: WeatherData): PrecipitationAdvisory {
  const next24Hours = weatherData.hourly.slice(0, 24);
  const totalPrecip = next24Hours.reduce((sum, h) => sum + h.precipitation, 0);
  
  const significantPrecip = next24Hours
    .filter(h => h.precipitation > 0.5)
    .slice(0, 5)
    .map(h => ({
      time: h.time,
      amount: h.precipitation,
    }));
  
  let message: TranslationKey;
  if (totalPrecip > 20) {
    message = 'precip.heavy';
  } else if (totalPrecip > 5) {
    message = 'precip.moderate';
  } else if (totalPrecip > 0) {
    message = 'precip.light';
  } else {
    message = 'precip.none';
  }
  
  return {
    totalPrecip,
    nextHours: significantPrecip,
    message,
  };
}

export function calculatePlantingAdvisory(weatherData: WeatherData): PlantingAdvisory {
  const next48Hours = weatherData.hourly.slice(0, 48);
  const minTemp = Math.min(...next48Hours.map(h => h.temperature));
  const totalPrecip = next48Hours.reduce((sum, h) => sum + h.precipitation, 0);
  const avgSoilMoisture = next48Hours.reduce((sum, h) => sum + h.soilMoisture, 0) / next48Hours.length;
  
  const factors: TranslationKey[] = [];
  let favorableCount = 0;
  
  // Temperature check
  if (minTemp >= 10) {
    factors.push('planting.factor.temp.good');
    favorableCount++;
  } else if (minTemp >= 5) {
    factors.push('planting.factor.temp.moderate');
  } else {
    factors.push('planting.factor.temp.poor');
  }
  
  // Soil moisture check
  if (avgSoilMoisture >= 0.15 && avgSoilMoisture <= 0.35) {
    factors.push('planting.factor.moisture.good');
    favorableCount++;
  } else if (avgSoilMoisture < 0.15) {
    factors.push('planting.factor.moisture.dry');
  } else {
    factors.push('planting.factor.moisture.wet');
  }
  
  // Precipitation check
  if (totalPrecip < 5) {
    factors.push('planting.factor.precip.good');
    favorableCount++;
  } else if (totalPrecip < 15) {
    factors.push('planting.factor.precip.moderate');
  } else {
    factors.push('planting.factor.precip.heavy');
  }
  
  let status: 'favorable' | 'moderate' | 'unfavorable';
  let message: TranslationKey;
  
  if (favorableCount >= 2) {
    status = 'favorable';
    message = 'planting.favorable';
  } else if (favorableCount >= 1) {
    status = 'moderate';
    message = 'planting.moderate';
  } else {
    status = 'unfavorable';
    message = 'planting.unfavorable';
  }
  
  return {
    status,
    factors,
    message,
  };
}

export function calculateSprayingAdvisory(weatherData: WeatherData): SprayingAdvisory {
  const next6Hours = weatherData.hourly.slice(0, 6);
  const avgWindSpeed = next6Hours.reduce((sum, h) => sum + h.windSpeed, 0) / next6Hours.length;
  const windDirection = getWindDirection(weatherData.current.windDirection);
  const totalPrecip = next6Hours.reduce((sum, h) => sum + h.precipitation, 0);
  
  let status: 'safe' | 'caution' | 'unsafe';
  let message: TranslationKey;
  
  if (totalPrecip > 1) {
    status = 'unsafe';
    message = 'spraying.rain';
  } else if (avgWindSpeed > 15) {
    status = 'unsafe';
    message = 'spraying.wind.high';
  } else if (avgWindSpeed > 10) {
    status = 'caution';
    message = 'spraying.wind.moderate';
  } else {
    status = 'safe';
    message = 'spraying.safe';
  }
  
  return {
    status,
    windSpeed: avgWindSpeed,
    windDirection,
    precipitation: totalPrecip,
    message,
  };
}
