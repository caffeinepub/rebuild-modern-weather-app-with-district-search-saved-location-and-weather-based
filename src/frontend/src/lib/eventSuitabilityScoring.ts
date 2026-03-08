import type { EventCriteria } from "./eventPlannerCriteria";

export interface WeatherFactorWeights {
  rain: number; // 1-4 (Low to Critical)
  wind: number; // 1-4
  temperature: number; // 1-4
}

export const DEFAULT_WEIGHTS: WeatherFactorWeights = {
  rain: 3,
  wind: 2,
  temperature: 3,
};

export interface SuitabilityResult {
  date: string;
  score: number;
  temperatureMin: number | null;
  temperatureMax: number | null;
  rainProbability: number;
  windSpeed: number;
  weatherCode: number;
}

export type SuitabilityLevel = "excellent" | "good" | "fair" | "poor";

export function getSuitabilityLevel(score: number): SuitabilityLevel {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

function calculateTemperatureScore(
  tempMin: number | null,
  tempMax: number | null,
  criteria: EventCriteria,
): number {
  if (tempMin === null || tempMax === null) return 0;

  const avgTemp = (tempMin + tempMax) / 2;
  const _idealTemp = (criteria.temperatureMin + criteria.temperatureMax) / 2;
  const tempRange = criteria.temperatureMax - criteria.temperatureMin;

  // Perfect score if within ideal range
  if (
    avgTemp >= criteria.temperatureMin &&
    avgTemp <= criteria.temperatureMax
  ) {
    return 100;
  }

  // Calculate distance from ideal range
  let distance: number;
  if (avgTemp < criteria.temperatureMin) {
    distance = criteria.temperatureMin - avgTemp;
  } else {
    distance = avgTemp - criteria.temperatureMax;
  }

  // Penalize based on distance (more lenient for slight deviations)
  const penalty = Math.min(100, (distance / tempRange) * 100);
  return Math.max(0, 100 - penalty);
}

function calculateRainScore(
  rainProbability: number,
  criteria: EventCriteria,
): number {
  if (rainProbability <= criteria.maxRainProbability) {
    return 100;
  }

  // Linear penalty for rain probability above threshold
  const excess = rainProbability - criteria.maxRainProbability;
  const penalty = (excess / (100 - criteria.maxRainProbability)) * 100;
  return Math.max(0, 100 - penalty);
}

function calculateWindScore(
  windSpeed: number,
  criteria: EventCriteria,
): number {
  if (windSpeed <= criteria.maxWindSpeed) {
    return 100;
  }

  // Linear penalty for wind speed above threshold
  const excess = windSpeed - criteria.maxWindSpeed;
  const penalty = Math.min(100, (excess / criteria.maxWindSpeed) * 100);
  return Math.max(0, 100 - penalty);
}

export function calculateSuitabilityScore(
  date: string,
  temperatureMin: number | null,
  temperatureMax: number | null,
  rainProbability: number,
  windSpeed: number,
  weatherCode: number,
  criteria: EventCriteria,
  weights?: WeatherFactorWeights,
): SuitabilityResult {
  const w = weights || DEFAULT_WEIGHTS;

  const tempScore = calculateTemperatureScore(
    temperatureMin,
    temperatureMax,
    criteria,
  );
  const rainScore = calculateRainScore(rainProbability, criteria);
  const windScore = calculateWindScore(windSpeed, criteria);

  // Calculate weighted average
  const totalWeight = w.temperature + w.rain + w.wind;
  const weightedScore =
    (tempScore * w.temperature + rainScore * w.rain + windScore * w.wind) /
    totalWeight;

  return {
    date,
    score: Math.round(weightedScore),
    temperatureMin,
    temperatureMax,
    rainProbability: Math.round(rainProbability),
    windSpeed: Math.round(windSpeed),
    weatherCode,
  };
}

export function rankDaysBySuitability(
  dailyData: Array<{
    date: string;
    temperatureMin: number;
    temperatureMax: number;
    precipitationProbabilityMax: number;
    windSpeedMax: number;
    weatherCode: number;
  }>,
  criteria: EventCriteria,
  weights?: WeatherFactorWeights,
  startDate?: Date,
  endDate?: Date,
): SuitabilityResult[] {
  const start = startDate || new Date();
  const end = endDate || new Date(start.getTime() + 13 * 24 * 60 * 60 * 1000);

  // Filter days within the date range
  const filteredDays = dailyData.filter((day) => {
    const dayDate = new Date(day.date);
    return dayDate >= start && dayDate <= end;
  });

  // Calculate scores for each day
  const results = filteredDays.map((day) =>
    calculateSuitabilityScore(
      day.date,
      day.temperatureMin,
      day.temperatureMax,
      day.precipitationProbabilityMax,
      day.windSpeedMax,
      day.weatherCode,
      criteria,
      weights,
    ),
  );

  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
}
