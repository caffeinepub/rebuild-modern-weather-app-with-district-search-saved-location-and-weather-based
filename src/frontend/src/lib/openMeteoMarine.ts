export interface MarineConditions {
  seaSurfaceTemperature: number | null;
  waveHeight: number | null;
  wavePeriod: number | null;
  waveDirection: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  visibility: number | null;
  visibilityDerived: boolean;
}

interface MarineAPIResponse {
  hourly?: {
    time: string[];
    wave_height?: number[];
    wave_period?: number[];
    wave_direction?: number[];
    ocean_current_velocity?: number[];
    ocean_current_direction?: number[];
  };
  daily?: {
    time: string[];
    wave_height_max?: number[];
    wave_period_max?: number[];
    wave_direction_dominant?: number[];
  };
}

interface ForecastAPIResponse {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    relative_humidity_2m?: number;
    visibility?: number;
  };
}

export async function fetchMarineData(
  latitude: number,
  longitude: number
): Promise<MarineConditions> {
  try {
    // Fetch marine data from Open-Meteo Marine API
    const marineParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      hourly: 'wave_height,wave_period,wave_direction',
      timezone: 'auto',
    });

    const marineResponse = await fetch(
      `https://marine-api.open-meteo.com/v1/marine?${marineParams}`
    );

    // Fetch additional weather data for wind and visibility
    const forecastParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility',
      timezone: 'auto',
    });

    const forecastResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?${forecastParams}`
    );

    let marineData: MarineAPIResponse = {};
    let forecastData: ForecastAPIResponse = {};

    if (marineResponse.ok) {
      marineData = await marineResponse.json();
    }

    if (forecastResponse.ok) {
      forecastData = await forecastResponse.json();
    }

    // Extract current/latest values from hourly data
    const currentHourIndex = 0; // Use the first available hour (current)
    
    const waveHeight = marineData.hourly?.wave_height?.[currentHourIndex] ?? null;
    const wavePeriod = marineData.hourly?.wave_period?.[currentHourIndex] ?? null;
    const waveDirection = marineData.hourly?.wave_direction?.[currentHourIndex] ?? null;

    // Sea surface temperature approximation using air temperature
    // (Open-Meteo Marine API doesn't provide SST for all locations)
    const seaSurfaceTemperature = forecastData.current?.temperature_2m ?? null;

    // Wind data from forecast API
    const windSpeed = forecastData.current?.wind_speed_10m ?? null;
    const windDirection = forecastData.current?.wind_direction_10m ?? null;

    // Visibility data
    let visibility = forecastData.current?.visibility ?? null;
    let visibilityDerived = false;

    // If visibility is not available, derive from humidity
    if (visibility === null && forecastData.current?.relative_humidity_2m !== undefined) {
      const humidity = forecastData.current.relative_humidity_2m;
      // Simple visibility estimation based on humidity
      // High humidity (>90%) = poor visibility, low humidity = good visibility
      if (humidity > 95) {
        visibility = 1000; // ~1 km (foggy)
        visibilityDerived = true;
      } else if (humidity > 85) {
        visibility = 5000; // ~5 km (hazy)
        visibilityDerived = true;
      } else if (humidity > 70) {
        visibility = 10000; // ~10 km (moderate)
        visibilityDerived = true;
      } else {
        visibility = 20000; // ~20 km (clear)
        visibilityDerived = true;
      }
    }

    return {
      seaSurfaceTemperature,
      waveHeight,
      wavePeriod,
      waveDirection,
      windSpeed,
      windDirection,
      visibility,
      visibilityDerived,
    };
  } catch (error) {
    console.error('Failed to fetch marine data:', error);
    throw new Error('Failed to fetch marine conditions');
  }
}
