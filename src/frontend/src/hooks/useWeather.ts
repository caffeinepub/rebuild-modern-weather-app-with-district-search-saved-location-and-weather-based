import { useQuery } from '@tanstack/react-query';
import { fetchWeather, type WeatherResponse } from '../lib/openMeteo';

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
  }>;
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    weatherCode: number;
    precipitationSum: number;
  }>;
}

function transformWeatherData(data: WeatherResponse): WeatherData {
  return {
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      humidity: data.current.relative_humidity_2m,
      pressure: data.current.surface_pressure,
      cloudCover: data.current.cloud_cover,
    },
    hourly: data.hourly.time.slice(0, 48).map((time, index) => {
      const hour = new Date(time).getHours();
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        timestamp: time, // Preserve ISO timestamp
        temperature: data.hourly.temperature_2m[index],
        weatherCode: data.hourly.weather_code[index],
        precipitation: data.hourly.precipitation[index],
        windSpeed: data.hourly.wind_speed_10m[index],
        windDirection: data.hourly.wind_direction_10m[index],
        soilMoisture: data.hourly.soil_moisture_0_to_1cm[index],
        humidity: data.hourly.relative_humidity_2m[index],
      };
    }),
    daily: data.daily.time.map((date, index) => ({
      date: date, // Return ISO date string for locale-aware formatting in UI
      temperatureMax: data.daily.temperature_2m_max[index],
      temperatureMin: data.daily.temperature_2m_min[index],
      weatherCode: data.daily.weather_code[index],
      precipitationSum: data.daily.precipitation_sum[index],
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
      const data = await fetchWeather(latitude, longitude);
      return transformWeatherData(data);
    },
    enabled: latitude !== undefined && longitude !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}
