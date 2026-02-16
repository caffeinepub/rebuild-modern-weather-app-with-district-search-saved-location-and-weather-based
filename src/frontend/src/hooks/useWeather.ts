import { useQuery } from '@tanstack/react-query';
import { fetchWeather, fetchAirQuality, type WeatherResponse, type AirQualityResponse } from '../lib/openMeteo';

export interface WeatherData {
  current: {
    temperature: number;
    apparentTemperature: number;
    weatherCode: number;
    windSpeed: number;
    windDirection: number;
    humidity: number;
    pressure: number;
    cloudCover: number;
    uvIndex?: number;
    visibility?: number;
    aqi?: number;
    pressureTrend?: number; // Pressure change over next 3 hours (hPa)
  };
  hourly: Array<{
    time: string;
    timestamp: string; // ISO timestamp for accurate time calculations
    temperature: number;
    weatherCode: number;
    precipitation: number;
    windSpeed: number;
    windDirection: number;
    soilMoisture: number;
    humidity: number;
    pressure: number;
    uvIndex?: number;
    visibility?: number;
  }>;
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    weatherCode: number;
    precipitationSum: number;
  }>;
}

function calculatePressureTrend(hourlyPressure: number[], currentPressure: number): number | undefined {
  // Calculate pressure change over next 3 hours
  if (!hourlyPressure || hourlyPressure.length < 4) {
    return undefined;
  }
  
  const pressureIn3Hours = hourlyPressure[3];
  if (pressureIn3Hours === undefined || pressureIn3Hours === null) {
    return undefined;
  }
  
  return pressureIn3Hours - currentPressure;
}

function transformWeatherData(weatherData: WeatherResponse, airQualityData: AirQualityResponse): WeatherData {
  const pressureTrend = calculatePressureTrend(weatherData.hourly.surface_pressure, weatherData.current.surface_pressure);
  
  return {
    current: {
      temperature: weatherData.current.temperature_2m,
      apparentTemperature: weatherData.current.apparent_temperature,
      weatherCode: weatherData.current.weather_code,
      windSpeed: weatherData.current.wind_speed_10m,
      windDirection: weatherData.current.wind_direction_10m,
      humidity: weatherData.current.relative_humidity_2m,
      pressure: weatherData.current.surface_pressure,
      cloudCover: weatherData.current.cloud_cover,
      uvIndex: weatherData.current.uv_index,
      visibility: weatherData.current.visibility,
      aqi: airQualityData.current?.european_aqi,
      pressureTrend,
    },
    hourly: weatherData.hourly.time.slice(0, 48).map((time, index) => {
      const hour = new Date(time).getHours();
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        timestamp: time, // Preserve ISO timestamp
        temperature: weatherData.hourly.temperature_2m[index],
        weatherCode: weatherData.hourly.weather_code[index],
        precipitation: weatherData.hourly.precipitation[index],
        windSpeed: weatherData.hourly.wind_speed_10m[index],
        windDirection: weatherData.hourly.wind_direction_10m[index],
        soilMoisture: weatherData.hourly.soil_moisture_0_to_1cm[index],
        humidity: weatherData.hourly.relative_humidity_2m[index],
        pressure: weatherData.hourly.surface_pressure[index],
        uvIndex: weatherData.hourly.uv_index?.[index],
        visibility: weatherData.hourly.visibility?.[index],
      };
    }),
    daily: weatherData.daily.time.map((date, index) => ({
      date: date, // Return ISO date string for locale-aware formatting in UI
      temperatureMax: weatherData.daily.temperature_2m_max[index],
      temperatureMin: weatherData.daily.temperature_2m_min[index],
      weatherCode: weatherData.daily.weather_code[index],
      precipitationSum: weatherData.daily.precipitation_sum[index],
    })),
  };
}

export function useWeather(latitude?: number, longitude?: number) {
  return useQuery<WeatherData>({
    queryKey: ['weather', latitude, longitude],
    queryFn: async () => {
      if (latitude === undefined || longitude === undefined) {
        throw new Error('Location coordinates are required');
      }
      const [weatherData, airQualityData] = await Promise.all([
        fetchWeather(latitude, longitude),
        fetchAirQuality(latitude, longitude),
      ]);
      return transformWeatherData(weatherData, airQualityData);
    },
    enabled: latitude !== undefined && longitude !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}
