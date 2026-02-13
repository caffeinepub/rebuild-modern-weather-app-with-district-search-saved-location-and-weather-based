import { useQuery } from '@tanstack/react-query';
import type { GeocodingResult } from '../lib/openMeteo';
import { fetchWeather } from '../lib/openMeteo';
import { useWeather, type WeatherData } from './useWeather';
import { analyzeRouteWeather, type RouteAnalysis } from '../lib/routeAnalysis';

function interpolatePoints(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
  numPoints: number = 3
): Array<{ latitude: number; longitude: number }> {
  const points: Array<{ latitude: number; longitude: number }> = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    points.push({
      latitude: start.latitude + (end.latitude - start.latitude) * ratio,
      longitude: start.longitude + (end.longitude - start.longitude) * ratio,
    });
  }
  
  return points;
}

async function transformWeatherData(data: any): Promise<WeatherData> {
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
    hourly: data.hourly.time.slice(0, 48).map((time: string, index: number) => {
      const hour = new Date(time).getHours();
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        temperature: data.hourly.temperature_2m[index],
        weatherCode: data.hourly.weather_code[index],
        precipitation: data.hourly.precipitation[index],
        windSpeed: data.hourly.wind_speed_10m[index],
        windDirection: data.hourly.wind_direction_10m[index],
        soilMoisture: data.hourly.soil_moisture_0_to_1cm[index],
      };
    }),
    daily: data.daily.time.map((date: string, index: number) => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      temperatureMax: data.daily.temperature_2m_max[index],
      temperatureMin: data.daily.temperature_2m_min[index],
      weatherCode: data.daily.weather_code[index],
      precipitationSum: data.daily.precipitation_sum[index],
    })),
  };
}

export function useRouteWeatherAnalysis(
  startLocation: GeocodingResult | null,
  endLocation: GeocodingResult | null
) {
  return useQuery<RouteAnalysis>({
    queryKey: ['routeWeather', startLocation?.latitude, startLocation?.longitude, endLocation?.latitude, endLocation?.longitude],
    queryFn: async () => {
      if (!startLocation || !endLocation) {
        throw new Error('Both start and end locations are required');
      }

      // Generate interpolated points along the route
      const routePoints = interpolatePoints(
        { latitude: startLocation.latitude, longitude: startLocation.longitude },
        { latitude: endLocation.latitude, longitude: endLocation.longitude },
        3 // 4 total points (start, 2 intermediate, end)
      );

      // Fetch weather for each point
      const weatherPromises = routePoints.map(point =>
        fetchWeather(point.latitude, point.longitude).then(transformWeatherData)
      );
      
      const weatherDataPoints = await Promise.all(weatherPromises);

      // Analyze the route weather
      return analyzeRouteWeather(weatherDataPoints);
    },
    enabled: !!startLocation && !!endLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
