import type { WeatherData } from '../hooks/useWeather';

export type DryingClassification = 'ideal' | 'suitable' | 'limited' | 'not-suitable';

export interface HourlyDryScore {
  hour: string;
  timestamp: string;
  score: number | null;
  classification: DryingClassification;
}

export interface TimeRange {
  start: string;
  end: string;
  avgScore: number;
}

export interface LaundryDryingRecommendation {
  hasGoodTimes: boolean;
  bestRange: TimeRange | null;
  additionalRanges: TimeRange[];
}

/**
 * Compute DryScore for a single hour with improved realistic model
 * Returns null if precipitation > 0.2mm
 */
function computeHourlyDryScore(
  temperature: number,
  humidity: number,
  windSpeed: number,
  precipitation: number
): number | null {
  // Precipitation cutoff - no score if raining
  if (precipitation > 0.2) {
    return null;
  }

  // Convert wind speed from km/h to m/s
  const windSpeedMps = windSpeed / 3.6;

  // Humidity component (0-100): Strong penalty for high humidity
  // At 90% humidity: score = 10
  // At 50% humidity: score = 50
  // At 30% humidity: score = 70
  const humidityScore = 100 - humidity;

  // Wind component (0-100): Capped and scaled
  // 0 m/s = 0, 5 m/s = 50, 10+ m/s = 100
  const windScore = Math.min(windSpeedMps * 10, 100);

  // Temperature component (0-100): Optimal range 15-30°C
  // Below 10°C: poor drying
  // 15-30°C: good drying
  // Above 35°C: excellent but rare
  let tempScore: number;
  if (temperature < 10) {
    tempScore = Math.max(0, temperature * 5); // 0°C = 0, 10°C = 50
  } else if (temperature <= 30) {
    tempScore = 50 + (temperature - 10) * 2.5; // 10°C = 50, 30°C = 100
  } else {
    tempScore = 100; // Cap at 100
  }

  // Apply stronger penalties for marginal conditions
  // High humidity (>70%) significantly reduces effectiveness of wind and temp
  let humidityPenalty = 1.0;
  if (humidity > 70) {
    humidityPenalty = 0.6; // 40% penalty
  } else if (humidity > 60) {
    humidityPenalty = 0.8; // 20% penalty
  }

  // Low temperature (<15°C) reduces effectiveness
  let tempPenalty = 1.0;
  if (temperature < 10) {
    tempPenalty = 0.5; // 50% penalty
  } else if (temperature < 15) {
    tempPenalty = 0.75; // 25% penalty
  }

  // Combined penalty
  const combinedPenalty = Math.min(humidityPenalty, tempPenalty);

  // Weighted DryScore with adjusted weights
  // Humidity is most important (60%), wind helps (25%), temperature matters (15%)
  const baseScore = humidityScore * 0.6 + windScore * 0.25 + tempScore * 0.15;

  // Apply penalty and clamp to 0-100
  const finalScore = Math.max(0, Math.min(100, baseScore * combinedPenalty));

  return finalScore;
}

/**
 * Classify a DryScore into categories
 */
function classifyDryScore(score: number | null): DryingClassification {
  if (score === null) {
    return 'not-suitable';
  }
  if (score >= 75) {
    return 'ideal';
  }
  if (score >= 50) {
    return 'suitable';
  }
  if (score >= 30) {
    return 'limited';
  }
  return 'not-suitable';
}

/**
 * Get the next 24 hours of data starting from current time
 */
function getNext24Hours(weatherData: WeatherData): typeof weatherData.hourly {
  const now = new Date();
  const currentTime = now.getTime();

  // Filter hours that are in the future or current
  const futureHours = weatherData.hourly.filter((hour) => {
    const hourTime = new Date(hour.timestamp).getTime();
    return hourTime >= currentTime;
  });

  // Take up to 24 hours
  return futureHours.slice(0, 24);
}

/**
 * Compute hourly DryScores for the next 24 hours from current time
 */
function computeHourlyScores(weatherData: WeatherData): HourlyDryScore[] {
  const next24Hours = getNext24Hours(weatherData);

  return next24Hours.map((hour) => {
    const score = computeHourlyDryScore(
      hour.temperature,
      hour.humidity,
      hour.windSpeed,
      hour.precipitation
    );

    return {
      hour: hour.time,
      timestamp: hour.timestamp,
      score,
      classification: classifyDryScore(score),
    };
  });
}

/**
 * Add one hour to a time string (HH:00 format), handling day wrap
 */
function addOneHour(timeStr: string): string {
  const hour = parseInt(timeStr.split(':')[0], 10);
  const nextHour = (hour + 1) % 24;
  return `${nextHour.toString().padStart(2, '0')}:00`;
}

/**
 * Merge consecutive Ideal/Suitable hours into time ranges
 * End time is always one hour after the last good hour
 */
function mergeTimeRanges(hourlyScores: HourlyDryScore[]): TimeRange[] {
  const ranges: TimeRange[] = [];
  let currentRange: { start: string; hours: HourlyDryScore[] } | null = null;

  for (const hourScore of hourlyScores) {
    const isGood =
      hourScore.classification === 'ideal' || hourScore.classification === 'suitable';

    if (isGood) {
      if (!currentRange) {
        // Start a new range
        currentRange = {
          start: hourScore.hour,
          hours: [hourScore],
        };
      } else {
        // Continue current range
        currentRange.hours.push(hourScore);
      }
    } else {
      // End current range if exists
      if (currentRange && currentRange.hours.length > 0) {
        const lastHour = currentRange.hours[currentRange.hours.length - 1];
        const avgScore =
          currentRange.hours.reduce((sum, h) => sum + (h.score || 0), 0) /
          currentRange.hours.length;

        // End time is one hour after the last good hour
        const endTime = addOneHour(lastHour.hour);

        ranges.push({
          start: currentRange.start,
          end: endTime,
          avgScore,
        });
        currentRange = null;
      }
    }
  }

  // Close any open range at the end
  if (currentRange && currentRange.hours.length > 0) {
    const lastHour = currentRange.hours[currentRange.hours.length - 1];
    const avgScore =
      currentRange.hours.reduce((sum, h) => sum + (h.score || 0), 0) /
      currentRange.hours.length;

    // End time is one hour after the last good hour
    const endTime = addOneHour(lastHour.hour);

    ranges.push({
      start: currentRange.start,
      end: endTime,
      avgScore,
    });
  }

  return ranges;
}

/**
 * Generate daily laundry drying recommendation
 */
export function getLaundryDryingRecommendation(
  weatherData: WeatherData
): LaundryDryingRecommendation {
  const hourlyScores = computeHourlyScores(weatherData);
  const ranges = mergeTimeRanges(hourlyScores);

  if (ranges.length === 0) {
    return {
      hasGoodTimes: false,
      bestRange: null,
      additionalRanges: [],
    };
  }

  // Sort ranges by avgScore (descending), then by start time (ascending)
  const sortedRanges = [...ranges].sort((a, b) => {
    if (Math.abs(a.avgScore - b.avgScore) > 0.1) {
      return b.avgScore - a.avgScore;
    }
    return a.start.localeCompare(b.start);
  });

  const bestRange = sortedRanges[0];
  const additionalRanges = sortedRanges.slice(1);

  return {
    hasGoodTimes: true,
    bestRange,
    additionalRanges,
  };
}
