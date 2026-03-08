import type { WeatherData } from "../hooks/useWeather";
import type { TranslationKey } from "../i18n/translations";

export interface FrostAdvisory {
  status: "safe" | "warning" | "danger";
  minTemp: number;
  timeframe: string;
  message: TranslationKey;
}

export interface SoilMoistureAdvisory {
  status: "dry" | "optimal" | "wet";
  avgMoisture: number;
  message: TranslationKey;
}

export interface PrecipitationAdvisory {
  totalPrecip: number;
  nextHours: Array<{ time: string; amount: number }>;
  message: TranslationKey;
}

export interface PlantingAdvisory {
  status: "favorable" | "moderate" | "unfavorable";
  factors: TranslationKey[];
  message: TranslationKey;
}

export interface SprayingAdvisory {
  status: "safe" | "caution" | "unsafe";
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  message: TranslationKey;
}

export interface IrrigationAdvisory {
  status: "optimal" | "suitable" | "notRecommended";
  message: TranslationKey;
}

export interface HarvestingAdvisory {
  status: "optimal" | "suitable" | "notRecommended";
  message: TranslationKey;
}

export interface SeedingAdvisory {
  status: "optimal" | "suitable" | "notRecommended";
  message: TranslationKey;
}

export interface SoilPrepAdvisory {
  status: "optimal" | "suitable" | "notRecommended";
  message: TranslationKey;
}

export interface PestControlAdvisory {
  status: "optimal" | "suitable" | "notRecommended";
  message: TranslationKey;
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function calculateFrostAdvisory(
  weatherData: WeatherData,
): FrostAdvisory {
  const next12Hours = weatherData.hourly.slice(0, 12);
  const minTemp = Math.min(...next12Hours.map((h) => h.temperature));

  let status: "safe" | "warning" | "danger";
  let message: TranslationKey;

  if (minTemp <= 0) {
    status = "danger";
    message = "frost.danger";
  } else if (minTemp <= 4) {
    status = "warning";
    message = "frost.warning";
  } else {
    status = "safe";
    message = "frost.safe";
  }

  return {
    status,
    minTemp,
    timeframe: "12h",
    message,
  };
}

export function calculateSoilMoistureAdvisory(
  weatherData: WeatherData,
): SoilMoistureAdvisory {
  const next24Hours = weatherData.hourly.slice(0, 24);
  const avgMoisture =
    next24Hours.reduce((sum, h) => sum + h.soilMoisture, 0) /
    next24Hours.length;

  let status: "dry" | "optimal" | "wet";
  let message: TranslationKey;

  if (avgMoisture < 0.15) {
    status = "dry";
    message = "soil.dry";
  } else if (avgMoisture > 0.35) {
    status = "wet";
    message = "soil.wet";
  } else {
    status = "optimal";
    message = "soil.optimal";
  }

  return {
    status,
    avgMoisture,
    message,
  };
}

export function calculatePrecipitationAdvisory(
  weatherData: WeatherData,
): PrecipitationAdvisory {
  const next24Hours = weatherData.hourly.slice(0, 24);
  const totalPrecip = next24Hours.reduce((sum, h) => sum + h.precipitation, 0);

  const nextHours = next24Hours
    .filter((h) => h.precipitation > 0.1)
    .slice(0, 6)
    .map((h) => ({
      time: h.time,
      amount: h.precipitation,
    }));

  let message: TranslationKey;
  if (totalPrecip < 1) {
    message = "precip.none";
  } else if (totalPrecip < 5) {
    message = "precip.light";
  } else if (totalPrecip < 15) {
    message = "precip.moderate";
  } else {
    message = "precip.heavy";
  }

  return {
    totalPrecip,
    nextHours,
    message,
  };
}

export function calculatePlantingAdvisory(
  weatherData: WeatherData,
): PlantingAdvisory {
  const next48Hours = weatherData.hourly.slice(0, 48);
  const avgTemp =
    next48Hours.reduce((sum, h) => sum + h.temperature, 0) / next48Hours.length;
  const avgMoisture =
    next48Hours.reduce((sum, h) => sum + h.soilMoisture, 0) /
    next48Hours.length;
  const totalPrecip = next48Hours.reduce((sum, h) => sum + h.precipitation, 0);

  const factors: TranslationKey[] = [];
  let score = 0;

  // Temperature factor
  if (avgTemp >= 10 && avgTemp <= 25) {
    factors.push("planting.factor.temp.good");
    score += 2;
  } else if (avgTemp >= 5 && avgTemp <= 30) {
    factors.push("planting.factor.temp.moderate");
    score += 1;
  } else {
    factors.push("planting.factor.temp.poor");
  }

  // Moisture factor
  if (avgMoisture >= 0.2 && avgMoisture <= 0.3) {
    factors.push("planting.factor.moisture.good");
    score += 2;
  } else if (avgMoisture < 0.15) {
    factors.push("planting.factor.moisture.dry");
    score += 1;
  } else {
    factors.push("planting.factor.moisture.wet");
  }

  // Precipitation factor
  if (totalPrecip < 5) {
    factors.push("planting.factor.precip.good");
    score += 2;
  } else if (totalPrecip < 15) {
    factors.push("planting.factor.precip.moderate");
    score += 1;
  } else {
    factors.push("planting.factor.precip.heavy");
  }

  let status: "favorable" | "moderate" | "unfavorable";
  let message: TranslationKey;

  if (score >= 5) {
    status = "favorable";
    message = "planting.favorable";
  } else if (score >= 3) {
    status = "moderate";
    message = "planting.moderate";
  } else {
    status = "unfavorable";
    message = "planting.unfavorable";
  }

  return {
    status,
    factors,
    message,
  };
}

export function calculateSprayingAdvisory(
  weatherData: WeatherData,
): SprayingAdvisory {
  const next6Hours = weatherData.hourly.slice(0, 6);
  const avgWindSpeed =
    next6Hours.reduce((sum, h) => sum + h.windSpeed, 0) / next6Hours.length;
  const maxPrecip = Math.max(...next6Hours.map((h) => h.precipitation));
  const windDir = getWindDirection(weatherData.current.windDirection);

  let status: "safe" | "caution" | "unsafe";
  let message: TranslationKey;

  if (maxPrecip > 0.5) {
    status = "unsafe";
    message = "farmer.spraying.rainRisk";
  } else if (avgWindSpeed > 20) {
    status = "unsafe";
    message = "farmer.spraying.windTooHigh";
  } else if (avgWindSpeed > 10) {
    status = "caution";
    message = "farmer.spraying.moderateWind";
  } else {
    status = "safe";
    message = "farmer.spraying.optimal";
  }

  return {
    status,
    windSpeed: avgWindSpeed,
    windDirection: windDir,
    precipitation: maxPrecip,
    message,
  };
}

export function calculateIrrigationAdvisory(
  weatherData: WeatherData,
): IrrigationAdvisory {
  const next24Hours = weatherData.hourly.slice(0, 24);
  const avgHumidity =
    next24Hours.reduce((sum, h) => sum + h.humidity, 0) / next24Hours.length;
  const avgTemp =
    next24Hours.reduce((sum, h) => sum + h.temperature, 0) / next24Hours.length;
  const totalPrecip = next24Hours.reduce((sum, h) => sum + h.precipitation, 0);

  let status: "optimal" | "suitable" | "notRecommended";
  let message: TranslationKey;

  if (totalPrecip > 5) {
    status = "notRecommended";
    message = "farmer.irrigation.recentRain";
  } else if (avgHumidity > 70) {
    status = "notRecommended";
    message = "farmer.irrigation.highHumidity";
  } else if (avgHumidity < 50 && avgTemp > 20) {
    status = "optimal";
    message = "farmer.irrigation.optimal";
  } else {
    status = "suitable";
    message = "farmer.irrigation.suitable";
  }

  return {
    status,
    message,
  };
}

export function calculateHarvestingAdvisory(
  weatherData: WeatherData,
): HarvestingAdvisory {
  const next48Hours = weatherData.hourly.slice(0, 48);
  const totalPrecip = next48Hours.reduce((sum, h) => sum + h.precipitation, 0);
  const avgHumidity =
    next48Hours.reduce((sum, h) => sum + h.humidity, 0) / next48Hours.length;

  let status: "optimal" | "suitable" | "notRecommended";
  let message: TranslationKey;

  if (totalPrecip > 10) {
    status = "notRecommended";
    message = "farmer.harvesting.heavyRain";
  } else if (totalPrecip > 2 || avgHumidity > 75) {
    status = "suitable";
    message = "farmer.harvesting.moistureRisk";
  } else {
    status = "optimal";
    message = "farmer.harvesting.optimal";
  }

  return {
    status,
    message,
  };
}

export function calculateSeedingAdvisory(
  weatherData: WeatherData,
): SeedingAdvisory {
  const next48Hours = weatherData.hourly.slice(0, 48);
  const avgTemp =
    next48Hours.reduce((sum, h) => sum + h.temperature, 0) / next48Hours.length;
  const avgMoisture =
    next48Hours.reduce((sum, h) => sum + h.soilMoisture, 0) /
    next48Hours.length;
  const totalPrecip = next48Hours.reduce((sum, h) => sum + h.precipitation, 0);

  let status: "optimal" | "suitable" | "notRecommended";
  let message: TranslationKey;

  if (avgTemp < 5) {
    status = "notRecommended";
    message = "farmer.seeding.tooCold";
  } else if (totalPrecip > 15 || avgMoisture > 0.35) {
    status = "notRecommended";
    message = "farmer.seeding.tooWet";
  } else if (
    avgTemp >= 10 &&
    avgTemp <= 25 &&
    avgMoisture >= 0.2 &&
    avgMoisture <= 0.3
  ) {
    status = "optimal";
    message = "farmer.seeding.optimal";
  } else {
    status = "suitable";
    message = "farmer.seeding.suitable";
  }

  return {
    status,
    message,
  };
}

export function calculateSoilPrepAdvisory(
  weatherData: WeatherData,
): SoilPrepAdvisory {
  const next24Hours = weatherData.hourly.slice(0, 24);
  const avgMoisture =
    next24Hours.reduce((sum, h) => sum + h.soilMoisture, 0) /
    next24Hours.length;
  const totalPrecip = next24Hours.reduce((sum, h) => sum + h.precipitation, 0);
  const avgTemp =
    next24Hours.reduce((sum, h) => sum + h.temperature, 0) / next24Hours.length;

  let status: "optimal" | "suitable" | "notRecommended";
  let message: TranslationKey;

  if (totalPrecip > 5 || avgMoisture > 0.35) {
    status = "notRecommended";
    message = "farmer.soilPrep.tooWet";
  } else if (avgTemp < 5) {
    status = "notRecommended";
    message = "farmer.soilPrep.frozen";
  } else if (avgMoisture >= 0.15 && avgMoisture <= 0.25 && avgTemp >= 10) {
    status = "optimal";
    message = "farmer.soilPrep.optimal";
  } else {
    status = "suitable";
    message = "farmer.soilPrep.suitable";
  }

  return {
    status,
    message,
  };
}

export function calculatePestControlAdvisory(
  weatherData: WeatherData,
): PestControlAdvisory {
  const next12Hours = weatherData.hourly.slice(0, 12);
  const avgTemp =
    next12Hours.reduce((sum, h) => sum + h.temperature, 0) / next12Hours.length;
  const avgWindSpeed =
    next12Hours.reduce((sum, h) => sum + h.windSpeed, 0) / next12Hours.length;
  const maxPrecip = Math.max(...next12Hours.map((h) => h.precipitation));

  let status: "optimal" | "suitable" | "notRecommended";
  let message: TranslationKey;

  if (maxPrecip > 0.5) {
    status = "notRecommended";
    message = "farmer.pestControl.rainRisk";
  } else if (avgWindSpeed > 15) {
    status = "notRecommended";
    message = "farmer.pestControl.tooWindy";
  } else if (avgTemp < 10 || avgTemp > 30) {
    status = "suitable";
    message = "farmer.pestControl.tempSuboptimal";
  } else {
    status = "optimal";
    message = "farmer.pestControl.optimal";
  }

  return {
    status,
    message,
  };
}
