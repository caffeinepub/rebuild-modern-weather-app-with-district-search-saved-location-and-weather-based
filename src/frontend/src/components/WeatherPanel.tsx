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
  Sun,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react';
import type { SavedLocation } from '../hooks/usePersistedLocation';
import type { WeatherData } from '../hooks/useWeather';
import { getWeatherIcon, getWeatherDescriptionKey } from '../lib/weatherTheme';
import { useI18n } from '../i18n/useI18n';
import type { TranslationKey } from '../i18n/translations';
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

function isFoggy(weatherCode: number, visibility?: number): boolean {
  // WMO codes 45 and 48 are fog
  if (weatherCode === 45 || weatherCode === 48) {
    return true;
  }
  // Also consider low visibility as foggy (< 1000m)
  if (visibility !== undefined && visibility < 1000) {
    return true;
  }
  return false;
}

function getAQICategoryKey(aqi?: number): TranslationKey | null {
  if (aqi === undefined || aqi === null) {
    return null;
  }
  
  if (aqi <= 20) return 'weather.aqi.good';
  if (aqi <= 40) return 'weather.aqi.fair';
  if (aqi <= 60) return 'weather.aqi.moderate';
  if (aqi <= 80) return 'weather.aqi.poor';
  return 'weather.aqi.veryPoor';
}

function getAQIColor(aqi?: number): string {
  if (aqi === undefined || aqi === null) {
    return 'text-muted-foreground';
  }
  
  if (aqi <= 20) return 'text-green-600';
  if (aqi <= 40) return 'text-yellow-600';
  if (aqi <= 60) return 'text-orange-600';
  if (aqi <= 80) return 'text-red-600';
  return 'text-purple-600';
}

function getUVCategoryKey(uv?: number): TranslationKey | null {
  if (uv === undefined || uv === null) {
    return null;
  }
  
  if (uv < 3) return 'weather.uv.low';
  if (uv < 6) return 'weather.uv.moderate';
  if (uv < 8) return 'weather.uv.high';
  if (uv < 11) return 'weather.uv.veryHigh';
  return 'weather.uv.extreme';
}

function getUVColor(uv?: number): string {
  if (uv === undefined || uv === null) {
    return 'text-muted-foreground';
  }
  
  if (uv < 3) return 'text-green-600';
  if (uv < 6) return 'text-yellow-600';
  if (uv < 8) return 'text-orange-600';
  if (uv < 11) return 'text-red-600';
  return 'text-purple-600';
}

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
  const fogStatus = isFoggy(weatherData.current.weatherCode, weatherData.current.visibility);
  const aqiCategoryKey = getAQICategoryKey(weatherData.current.aqi);
  const aqiColor = getAQIColor(weatherData.current.aqi);
  const uvCategoryKey = getUVCategoryKey(weatherData.current.uvIndex);
  const uvColor = getUVColor(weatherData.current.uvIndex);

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
                {weatherData.current.pressureTrend !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    {weatherData.current.pressureTrend > 0.5 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : weatherData.current.pressureTrend < -0.5 ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {weatherData.current.pressureTrend > 0 ? '+' : ''}
                      {weatherData.current.pressureTrend.toFixed(1)} {t('weather.pressureTrend')}
                    </span>
                  </div>
                )}
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

            {weatherData.current.uvIndex !== undefined && (
              <div className="flex items-center gap-4 rounded-xl border-2 border-warning/20 bg-warning/5 p-5 shadow-soft interactive-hover">
                <div className="rounded-lg bg-warning/15 p-2.5">
                  <Sun className="h-8 w-8 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('weather.uvIndex')}</p>
                  <p className="text-2xl font-bold">{weatherData.current.uvIndex.toFixed(1)}</p>
                  {uvCategoryKey && (
                    <p className={`text-xs font-semibold mt-1 ${uvColor}`}>
                      {t(uvCategoryKey)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {weatherData.current.visibility !== undefined && (
              <div className="flex items-center gap-4 rounded-xl border-2 border-accent/20 bg-accent/5 p-5 shadow-soft interactive-hover">
                <div className="rounded-lg bg-accent/15 p-2.5">
                  <Eye className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('weather.visibility')}</p>
                  <p className="text-2xl font-bold">{(weatherData.current.visibility / 1000).toFixed(1)} km</p>
                  {fogStatus && (
                    <p className="text-xs font-semibold text-warning mt-1">
                      {t('weather.fog')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {weatherData.current.aqi !== undefined && (
              <div className="flex items-center gap-4 rounded-xl border-2 border-success/20 bg-success/5 p-5 shadow-soft interactive-hover">
                <div className="rounded-lg bg-success/15 p-2.5">
                  <Wind className="h-8 w-8 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('weather.aqi')}</p>
                  <p className="text-2xl font-bold">{weatherData.current.aqi}</p>
                  {aqiCategoryKey && (
                    <p className={`text-xs font-semibold mt-1 ${aqiColor}`}>
                      {t(aqiCategoryKey)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* What Should I Wear */}
      <Card className="glass-surface rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{t('weather.whatToWear')}</CardTitle>
          <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">{t('weather.whatToWear.note')}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {clothingAdvisories.map((advisory) => {
              const Icon = advisoryIcons[advisory.icon];
              return (
                <div
                  key={advisory.key}
                  className="flex items-center gap-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-soft interactive-hover"
                >
                  <div className="rounded-lg bg-primary/15 p-2.5">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-semibold leading-tight">{t(advisory.key)}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Laundry Drying Recommendation */}
      <LaundryDryingRecommendation weatherData={weatherData} />

      {/* Hourly Forecast */}
      <Card className="glass-surface rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{t('weather.hourly')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {weatherData.hourly.slice(0, 24).map((hour, index) => {
              const HourIcon = getWeatherIcon(hour.weatherCode);
              return (
                <div
                  key={hour.timestamp}
                  className="flex min-w-[100px] flex-col items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 shadow-soft interactive-hover"
                >
                  <p className="text-sm font-bold text-muted-foreground">
                    {index === 0 ? t('weather.hourly.now') : hour.time}
                  </p>
                  <div className="rounded-lg bg-primary/10 p-2">
                    <HourIcon className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{Math.round(hour.temperature)}°</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Droplets className="h-4 w-4" />
                    <span className="font-semibold">{hour.precipitation.toFixed(1)}mm</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Forecast */}
      <Card className="glass-surface rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{t('weather.daily')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weatherData.daily.map((day) => {
              const DayIcon = getWeatherIcon(day.weatherCode);
              return (
                <div
                  key={day.date}
                  className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-soft interactive-hover"
                >
                  <div className="flex items-center gap-6">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <DayIcon className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {formatDailyForecastDate(day.date, locale)}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {t(getWeatherDescriptionKey(day.weatherCode))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-3xl font-bold">{Math.round(day.temperatureMax)}°</p>
                      <p className="text-lg text-muted-foreground font-semibold">
                        {Math.round(day.temperatureMin)}°
                      </p>
                    </div>
                    {day.precipitationSum > 0 && (
                      <div className="flex items-center gap-2 text-primary">
                        <Droplets className="h-6 w-6" />
                        <span className="text-lg font-bold">{day.precipitationSum.toFixed(1)}mm</span>
                      </div>
                    )}
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
