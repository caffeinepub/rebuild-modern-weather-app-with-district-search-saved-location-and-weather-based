import { fetchWithTimeout } from './fetchWithTimeout';

export interface WeatherData {
  current: {
    temperature: number;
    apparentTemperature: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
    pressure: number;
    cloudCover: number;
  };
  hourly: {
    time: string[];
    temperature: number[];
    weatherCode: number[];
    precipitation: number[];
    windDirection: number[];
  };
  daily: {
    time: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    weatherCode: number[];
  };
  soilMoisture?: number[];
}

export interface WeatherResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    relative_humidity_2m: number;
    surface_pressure: number;
    cloud_cover: number;
    uv_index?: number;
    visibility?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    soil_moisture_0_to_1cm: number[];
    relative_humidity_2m: number[];
    surface_pressure: number[];
    uv_index?: number[];
    visibility?: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_sum: number[];
  };
}

export interface AirQualityResponse {
  current?: {
    european_aqi?: number;
  };
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  admin2?: string;
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,surface_pressure,cloud_cover',
    hourly: 'temperature_2m,weather_code,precipitation,wind_direction_10m,soil_moisture_0_to_1cm',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    timezone: 'auto',
    forecast_days: '7',
  });

  const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data from Open-Meteo');
  }

  const data = await response.json();

  return {
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
      humidity: data.current.relative_humidity_2m,
      pressure: data.current.surface_pressure,
      cloudCover: data.current.cloud_cover,
    },
    hourly: {
      time: data.hourly.time,
      temperature: data.hourly.temperature_2m,
      weatherCode: data.hourly.weather_code,
      precipitation: data.hourly.precipitation,
      windDirection: data.hourly.wind_direction_10m,
    },
    daily: {
      time: data.daily.time,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
      weatherCode: data.daily.weather_code,
    },
    soilMoisture: data.hourly.soil_moisture_0_to_1cm,
  };
}

export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,surface_pressure,cloud_cover,uv_index,visibility',
    hourly: 'temperature_2m,weather_code,precipitation,wind_speed_10m,wind_direction_10m,soil_moisture_0_to_1cm,relative_humidity_2m,surface_pressure,uv_index,visibility',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum',
    timezone: 'auto',
    forecast_days: '7',
  });

  const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data from Open-Meteo');
  }

  const data = await response.json();
  return data;
}

export async function fetchAirQuality(
  latitude: number,
  longitude: number
): Promise<AirQualityResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'european_aqi',
    timezone: 'auto',
  });

  try {
    const response = await fetchWithTimeout(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`);
    
    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Air quality data may not be available for all locations
    return {};
  }
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    name: query,
    count: '10',
    language: 'en',
    format: 'json',
  });

  const response = await fetchWithTimeout(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to search locations');
  }

  const data = await response.json();
  
  if (!data.results) {
    return [];
  }

  return data.results.map((result: any) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1,
    admin2: result.admin2,
  }));
}

export async function fetchTemperatureGrid(
  centerLat: number,
  centerLon: number
): Promise<Array<{ lat: number; lon: number; temp: number }>> {
  // Create a 5x5 grid of points around the location (±0.2 degrees, ~22km)
  const gridSize = 5;
  const gridSpacing = 0.08; // degrees (~9km)
  const centerOffset = (gridSize - 1) / 2;

  const gridPoints: Array<{ lat: number; lon: number }> = [];
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const latOffset = (i - centerOffset) * gridSpacing;
      const lonOffset = (j - centerOffset) * gridSpacing;
      
      gridPoints.push({
        lat: centerLat + latOffset,
        lon: centerLon + lonOffset,
      });
    }
  }

  // Batch fetch temperatures for all grid points
  // Open-Meteo supports comma-separated lat/lon for batch requests
  const latitudes = gridPoints.map(p => p.lat.toFixed(4)).join(',');
  const longitudes = gridPoints.map(p => p.lon.toFixed(4)).join(',');

  const params = new URLSearchParams({
    latitude: latitudes,
    longitude: longitudes,
    current: 'temperature_2m',
    timezone: 'auto',
  });

  const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch temperature grid from Open-Meteo');
  }

  const data = await response.json();

  // Handle both single and multiple location responses
  if (Array.isArray(data)) {
    // Multiple locations response
    return gridPoints.map((point, index) => ({
      lat: point.lat,
      lon: point.lon,
      temp: data[index]?.current?.temperature_2m ?? 0,
    }));
  } else {
    // Single location response - use center temperature for all points
    const centerTemp = data.current?.temperature_2m ?? 0;
    return gridPoints.map((point) => ({
      lat: point.lat,
      lon: point.lon,
      temp: centerTemp,
    }));
  }
}
