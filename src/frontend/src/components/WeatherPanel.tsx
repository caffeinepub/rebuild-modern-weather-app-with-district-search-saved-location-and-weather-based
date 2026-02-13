import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Cloud,
  Wind,
  Droplets,
  Gauge,
  AlertCircle,
  Shirt,
  Layers,
  Umbrella,
  Wind as WindIcon,
} from 'lucide-react';
import type { SavedLocation } from '../hooks/usePersistedLocation';
import type { WeatherData } from '../hooks/useWeather';
import { getWeatherIcon, getWeatherDescriptionKey } from '../lib/weatherTheme';
import { useI18n } from '../i18n/useI18n';
import { formatDailyForecastDate } from '../lib/formatDailyForecastDate';
import { getClothingAdvisories } from '../lib/clothingAdvisories';
import { LaundryDryingRecommendation } from './LaundryDryingRecommendation';

interface WeatherPanelProps {
  location: SavedLocation;
  weatherData?: WeatherData;
  isLoading: boolean;
  error: Error | null;
}

const advisoryIcons = {
  light: Shirt,
  coat: Layers,
  umbrella: Umbrella,
  wind: WindIcon,
};

export function WeatherPanel({ location, weatherData, isLoading, error }: WeatherPanelProps) {
  const { t, locale } = useI18n();

  if (error) {
    return (
      <Alert variant="destructive" className="glass-surface rounded-xl">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="font-medium">
          {t('weather.error')}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="glass-surface rounded-2xl">
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
  const clothingAdvisories = getClothingAdvisories(weatherData);

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <Card className="glass-surface-strong rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('weather.current')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-6 py-8 sm:flex-row sm:justify-between sm:space-y-0">
            <div className="flex items-center gap-8">
              <div className="rounded-2xl bg-primary/10 p-4 shadow-glow">
                <WeatherIcon className="h-28 w-28 text-primary" />
              </div>
              <div>
                <p className="text-7xl font-bold">{Math.round(weatherData.current.temperature)}°</p>
                <p className="mt-3 text-xl font-semibold text-muted-foreground">
                  {t(getWeatherDescriptionKey(weatherData.current.weatherCode))}
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('weather.feelsLike')}</p>
              <p className="text-4xl font-bold mt-1">
                {Math.round(weatherData.current.apparentTemperature)}°
              </p>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-soft interactive-hover">
              <div className="rounded-lg bg-primary/15 p-2.5">
                <Wind className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('weather.windSpeed')}</p>
                <p className="text-2xl font-bold">{weatherData.current.windSpeed} km/h</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-soft interactive-hover">
              <div className="rounded-lg bg-primary/15 p-2.5">
                <Droplets className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('weather.humidity')}</p>
                <p className="text-2xl font-bold">{weatherData.current.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-soft interactive-hover">
              <div className="rounded-lg bg-primary/15 p-2.5">
                <Gauge className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('weather.pressure')}</p>
                <p className="text-2xl font-bold">{weatherData.current.pressure} hPa</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-soft interactive-hover">
              <div className="rounded-lg bg-primary/15 p-2.5">
                <Cloud className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('weather.cloudCover')}</p>
                <p className="text-2xl font-bold">{weatherData.current.cloudCover}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Should I Wear Card */}
      <Card className="glass-surface-strong rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{t('clothing.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {clothingAdvisories.map((advisory, index) => {
              const Icon = advisoryIcons[advisory.icon];
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-xl border-2 border-accent/20 bg-accent/10 p-5 shadow-soft interactive-hover"
                >
                  <div className="rounded-lg bg-accent/20 p-2.5">
                    <Icon className="h-7 w-7 text-accent flex-shrink-0" />
                  </div>
                  <p className="text-base font-semibold">{t(advisory.key)}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Laundry Drying Recommendation */}
      <LaundryDryingRecommendation weatherData={weatherData} />

      {/* Hourly Forecast */}
      <Card className="glass-surface-strong rounded-2xl">
        <CardHeader>
          <CardTitle className="font-bold">{t('weather.hourlyForecast')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2">
              {weatherData.hourly.slice(0, 24).map((hour, index) => {
                const HourIcon = getWeatherIcon(hour.weatherCode);
                return (
                  <div
                    key={index}
                    className="flex min-w-[90px] flex-col items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 shadow-soft interactive-hover"
                  >
                    <p className="text-sm font-bold text-muted-foreground">{hour.time}</p>
                    <div className="rounded-lg bg-primary/15 p-2">
                      <HourIcon className="h-9 w-9 text-primary" />
                    </div>
                    <p className="text-xl font-bold">{Math.round(hour.temperature)}°</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Forecast */}
      <Card className="glass-surface-strong rounded-2xl">
        <CardHeader>
          <CardTitle className="font-bold">{t('weather.dailyForecast')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weatherData.daily.map((day, index) => {
              const DayIcon = getWeatherIcon(day.weatherCode);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-soft interactive-hover"
                >
                  <div className="flex items-center gap-5">
                    <div className="rounded-lg bg-primary/15 p-2.5">
                      <DayIcon className="h-11 w-11 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">
                        {formatDailyForecastDate(day.date, locale)}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t(getWeatherDescriptionKey(day.weatherCode))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('weather.high')}</p>
                      <p className="text-2xl font-bold">{Math.round(day.temperatureMax)}°</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('weather.low')}</p>
                      <p className="text-2xl font-bold text-muted-foreground">
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
