import type { WeatherData } from "../hooks/useWeather";
import type { TranslationKey } from "../i18n/translations";

export interface MigraineTrigger {
  riskLevel: "low" | "moderate" | "high";
  pressureDrop: number;
  timestamp: string;
  messageKey: TranslationKey;
}

export interface AllergyIndex {
  riskLevel: "low" | "moderate" | "high" | "veryHigh";
  factors: string[];
  messageKey: TranslationKey;
}

export interface ExerciseTimes {
  bestTime: {
    start: string;
    end: string;
    score: number;
    reasons: string[];
  } | null;
  alternativeTimes: Array<{
    start: string;
    end: string;
    score: number;
    reasons: string[];
  }>;
  activityType: "outdoor" | "indoor";
  messageKey: TranslationKey;
}

export interface RespiratoryWarning {
  riskLevel: "safe" | "caution" | "danger";
  triggers: string[];
  messageKey: TranslationKey;
}

export function calculateMigraineTrigger(
  weatherData: WeatherData,
): MigraineTrigger {
  const hourlyPressure = weatherData.hourly.slice(0, 12).map((h) => h.pressure);

  let maxDrop = 0;
  let dropTimestamp = weatherData.hourly[0]?.timestamp || "";

  // Check for pressure drops over 3-hour windows
  for (let i = 0; i < hourlyPressure.length - 3; i++) {
    const drop = hourlyPressure[i] - hourlyPressure[i + 3];
    if (drop > maxDrop) {
      maxDrop = drop;
      dropTimestamp = weatherData.hourly[i + 3]?.timestamp || "";
    }
  }

  let riskLevel: "low" | "moderate" | "high";
  let messageKey: TranslationKey;

  if (maxDrop >= 5) {
    riskLevel = "high";
    messageKey = "health.migraine.riskHigh";
  } else if (maxDrop >= 3) {
    riskLevel = "moderate";
    messageKey = "health.migraine.riskModerate";
  } else {
    riskLevel = "low";
    messageKey = "health.migraine.riskLow";
  }

  return {
    riskLevel,
    pressureDrop: maxDrop,
    timestamp: dropTimestamp,
    messageKey,
  };
}

export function calculateAllergyIndex(weatherData: WeatherData): AllergyIndex {
  const current = weatherData.current;
  const factors: string[] = [];
  let score = 0;

  // High humidity increases pollen and mold
  if (current.humidity > 60) {
    factors.push("highHumidity");
    score += 2;
  }

  // Strong winds spread pollen
  if (current.windSpeed > 15) {
    factors.push("strongWinds");
    score += 2;
  }

  // Optimal pollen temperature range
  if (current.temperature >= 15 && current.temperature <= 25) {
    factors.push("optimalPollenTemp");
    score += 1;
  }

  let riskLevel: "low" | "moderate" | "high" | "veryHigh";
  let messageKey: TranslationKey;

  if (score >= 4) {
    riskLevel = "veryHigh";
    messageKey = "health.allergy.riskVeryHigh";
  } else if (score >= 3) {
    riskLevel = "high";
    messageKey = "health.allergy.riskHigh";
  } else if (score >= 2) {
    riskLevel = "moderate";
    messageKey = "health.allergy.riskModerate";
  } else {
    riskLevel = "low";
    messageKey = "health.allergy.riskLow";
  }

  return {
    riskLevel,
    factors,
    messageKey,
  };
}

export function calculateExerciseTimes(
  weatherData: WeatherData,
): ExerciseTimes {
  const next24Hours = weatherData.hourly.slice(0, 24);

  interface ScoredHour {
    index: number;
    timestamp: string;
    score: number;
    reasons: string[];
  }

  const scoredHours: ScoredHour[] = next24Hours.map((hour, index) => {
    let score = 0;
    const reasons: string[] = [];

    // Temperature scoring (15-25°C ideal)
    if (hour.temperature >= 15 && hour.temperature <= 25) {
      score += 3;
      reasons.push("coolTemp");
    } else if (hour.temperature >= 10 && hour.temperature < 30) {
      score += 1;
    }

    // UV index scoring (lower is better)
    if (hour.uvIndex !== undefined) {
      if (hour.uvIndex < 3) {
        score += 2;
        reasons.push("lowUV");
      } else if (hour.uvIndex < 6) {
        score += 1;
      }
    }

    // Humidity scoring (lower is better)
    if (hour.humidity < 70) {
      score += 1;
      reasons.push("moderateHumidity");
    }

    // Air quality scoring
    if (weatherData.current.aqi !== undefined && weatherData.current.aqi < 50) {
      score += 2;
      reasons.push("goodAirQuality");
    }

    // Precipitation penalty
    if (hour.precipitation > 0.5) {
      score -= 3;
    }

    return {
      index,
      timestamp: hour.timestamp,
      score,
      reasons,
    };
  });

  // Sort by score
  const sorted = [...scoredHours].sort((a, b) => b.score - a.score);

  // Find best continuous time range
  const findTimeRange = (hours: ScoredHour[]) => {
    if (hours.length === 0) return null;

    const best = hours[0];
    let end = best.index;

    // Extend range if consecutive hours are also good
    for (
      let i = best.index + 1;
      i < next24Hours.length && i <= best.index + 3;
      i++
    ) {
      const nextHour = scoredHours[i];
      if (nextHour.score >= best.score - 1) {
        end = i;
      } else {
        break;
      }
    }

    return {
      start: next24Hours[best.index].timestamp,
      end: next24Hours[end].timestamp,
      score: best.score,
      reasons: best.reasons,
    };
  };

  const bestTime = findTimeRange(sorted.slice(0, 1));
  const alternativeTimes = sorted
    .slice(1, 3)
    .map((h) => findTimeRange([h]))
    .filter((t): t is NonNullable<typeof t> => t !== null);

  const activityType: "outdoor" | "indoor" =
    bestTime && bestTime.score >= 4 ? "outdoor" : "indoor";
  const messageKey: TranslationKey =
    activityType === "outdoor"
      ? "health.exercise.outdoorRecommended"
      : "health.exercise.indoorRecommended";

  return {
    bestTime,
    alternativeTimes,
    activityType,
    messageKey,
  };
}

export function calculateRespiratoryWarning(
  weatherData: WeatherData,
): RespiratoryWarning {
  const current = weatherData.current;
  const triggers: string[] = [];
  let score = 0;

  // Air quality check
  if (current.aqi !== undefined) {
    if (current.aqi > 150) {
      triggers.push("pollution");
      score += 3;
    } else if (current.aqi > 100) {
      triggers.push("pollution");
      score += 2;
    }
  }

  // High humidity
  if (current.humidity > 80) {
    triggers.push("highHumidity");
    score += 2;
  }

  // Cold air
  if (current.temperature < 5) {
    triggers.push("coldAir");
    score += 1;
  }

  // Check for rapid temperature changes
  const next3Hours = weatherData.hourly.slice(0, 3);
  if (next3Hours.length >= 3) {
    const tempChange = Math.abs(
      next3Hours[2].temperature - current.temperature,
    );
    if (tempChange > 5) {
      triggers.push("rapidTempChange");
      score += 1;
    }
  }

  // Check allergen conditions
  const allergyIndex = calculateAllergyIndex(weatherData);
  if (
    allergyIndex.riskLevel === "high" ||
    allergyIndex.riskLevel === "veryHigh"
  ) {
    triggers.push("allergens");
    score += 1;
  }

  let riskLevel: "safe" | "caution" | "danger";
  let messageKey: TranslationKey;

  if (score >= 4) {
    riskLevel = "danger";
    messageKey = "health.respiratory.riskDanger";
  } else if (score >= 2) {
    riskLevel = "caution";
    messageKey = "health.respiratory.riskCaution";
  } else {
    riskLevel = "safe";
    messageKey = "health.respiratory.riskSafe";
  }

  return {
    riskLevel,
    triggers,
    messageKey,
  };
}
