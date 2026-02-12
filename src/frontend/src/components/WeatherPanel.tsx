import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Cloud,
  Wind,
  Droplets,
  Gauge,
  AlertCircle,
} from 'lucide-react';
import type { SavedLocation } from '../hooks/usePersistedLocation';
import type { WeatherData } from '../hooks/useWeather';
import { getWeatherIcon, getWeatherDescriptionKey } from '../lib/weatherTheme';
import { useI18n } from '../i18n/useI18n';

interface WeatherPanelProps {
  location: SavedLocation;
  weatherData?: WeatherData;
  isLoading: boolean;
  error: Error | null;
}

export function WeatherPanel({ location, weatherData, isLoading, error }: WeatherPanelProps) {
  const { t } = useI18n();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('weather.error')}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const WeatherIcon = getWeatherIcon(weatherData.current.weatherCode);

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('weather.current')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-8 sm:flex-row sm:justify-between sm:space-y-0">
            <div className="flex items-center gap-6">
              <WeatherIcon className="h-24 w-24 text-primary" />
              <div>
                <p className="text-6xl font-bold">{Math.round(weatherData.current.temperature)}°</p>
                <p className="mt-2 text-lg text-muted-foreground">
                  {t(getWeatherDescriptionKey(weatherData.current.weatherCode))}
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-muted-foreground">{t('weather.feelsLike')}</p>
              <p className="text-3xl font-semibold">
                {Math.round(weatherData.current.apparentTemperature)}°
              </p>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 p-4">
              <Wind className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t('weather.windSpeed')}</p>
                <p className="text-xl font-semibold">{weatherData.current.windSpeed} km/h</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 p-4">
              <Droplets className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t('weather.humidity')}</p>
                <p className="text-xl font-semibold">{weatherData.current.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 p-4">
              <Gauge className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t('weather.pressure')}</p>
                <p className="text-xl font-semibold">{weatherData.current.pressure} hPa</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 p-4">
              <Cloud className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t('weather.cloudCover')}</p>
                <p className="text-xl font-semibold">{weatherData.current.cloudCover}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Forecast */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('weather.hourlyForecast')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2">
              {weatherData.hourly.slice(0, 24).map((hour, index) => {
                const HourIcon = getWeatherIcon(hour.weatherCode);
                return (
                  <div
                    key={index}
                    className="flex min-w-[80px] flex-col items-center gap-2 rounded-lg border border-border/40 bg-background/60 p-3"
                  >
                    <p className="text-sm font-medium text-muted-foreground">{hour.time}</p>
                    <HourIcon className="h-8 w-8 text-primary" />
                    <p className="text-lg font-semibold">{Math.round(hour.temperature)}°</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Forecast */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('weather.dailyForecast')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weatherData.daily.map((day, index) => {
              const DayIcon = getWeatherIcon(day.weatherCode);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-background/60 p-4"
                >
                  <div className="flex items-center gap-4">
                    <p className="w-24 font-medium">{day.date}</p>
                    <DayIcon className="h-8 w-8 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {t(getWeatherDescriptionKey(day.weatherCode))}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{t('weather.high')}</p>
                      <p className="text-lg font-semibold">{Math.round(day.temperatureMax)}°</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{t('weather.low')}</p>
                      <p className="text-lg font-semibold text-muted-foreground">
                        {Math.round(day.temperatureMin)}°
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
