import { useQuery } from '@tanstack/react-query';
import { fetchWeather, type WeatherResponse } from '../lib/openMeteo';

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
  hourly: Array<{
    time: string;
    temperature: number;
    weatherCode: number;
  }>;
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    weatherCode: number;
  }>;
}

function transformWeatherData(data: WeatherResponse): WeatherData {
  const now = new Date();
  const currentHourIndex = now.getHours();

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
    hourly: data.hourly.time.slice(currentHourIndex, currentHourIndex + 24).map((time, index) => {
      const hour = new Date(time).getHours();
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        temperature: data.hourly.temperature_2m[currentHourIndex + index],
        weatherCode: data.hourly.weather_code[currentHourIndex + index],
      };
    }),
    daily: data.daily.time.map((date, index) => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      temperatureMax: data.daily.temperature_2m_max[index],
      temperatureMin: data.daily.temperature_2m_min[index],
      weatherCode: data.daily.weather_code[index],
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
