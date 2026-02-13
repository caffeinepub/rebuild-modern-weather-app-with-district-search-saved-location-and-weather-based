import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Snowflake,
  Droplets,
  CloudRain,
  Sprout,
  Wind,
  AlertCircle,
  ThermometerSnowflake,
} from 'lucide-react';
import type { SavedLocation } from '../hooks/usePersistedLocation';
import type { WeatherData } from '../hooks/useWeather';
import { useI18n } from '../i18n/useI18n';
import {
  calculateFrostAdvisory,
  calculateSoilMoistureAdvisory,
  calculatePrecipitationAdvisory,
  calculatePlantingAdvisory,
  calculateSprayingAdvisory,
} from '../lib/farmerAdvisories';

interface FarmerGardenWeatherPanelProps {
  location: SavedLocation;
  weatherData?: WeatherData;
  isLoading: boolean;
  error: Error | null;
}

export function FarmerGardenWeatherPanel({
  location,
  weatherData,
  isLoading,
  error,
}: FarmerGardenWeatherPanelProps) {
  const { t } = useI18n();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t('weather.error')}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="glass-surface">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!weatherData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t('farmer.noData')}</AlertDescription>
      </Alert>
    );
  }

  const frostAdvisory = calculateFrostAdvisory(weatherData);
  const soilMoistureAdvisory = calculateSoilMoistureAdvisory(weatherData);
  const precipitationAdvisory = calculatePrecipitationAdvisory(weatherData);
  const plantingAdvisory = calculatePlantingAdvisory(weatherData);
  const sprayingAdvisory = calculateSprayingAdvisory(weatherData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('farmer.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {location.name}, {location.country}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Frost Alert Card */}
        <Card className="glass-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Snowflake className="h-5 w-5" />
                {t('farmer.frost.title')}
              </CardTitle>
              <Badge
                variant={
                  frostAdvisory.status === 'danger'
                    ? 'destructive'
                    : frostAdvisory.status === 'warning'
                      ? 'default'
                      : 'secondary'
                }
              >
                {t(`farmer.frost.status.${frostAdvisory.status}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t(frostAdvisory.message)}</p>
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('farmer.frost.minTemp')}</span>
                <span className="font-semibold flex items-center gap-1">
                  <ThermometerSnowflake className="h-4 w-4" />
                  {frostAdvisory.minTemp.toFixed(1)}°C
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('farmer.frost.timeframe')}</span>
                <span className="font-semibold">{t('farmer.frost.next12h')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Soil Moisture Card */}
        <Card className="glass-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplets className="h-5 w-5" />
                {t('farmer.soil.title')}
              </CardTitle>
              <Badge
                variant={
                  soilMoistureAdvisory.status === 'optimal'
                    ? 'secondary'
                    : 'default'
                }
              >
                {t(`farmer.soil.status.${soilMoistureAdvisory.status}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t(soilMoistureAdvisory.message)}</p>
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('farmer.soil.avgMoisture')}</span>
                <span className="font-semibold flex items-center gap-1">
                  <Droplets className="h-4 w-4" />
                  {soilMoistureAdvisory.avgMoisture.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('farmer.soil.timeframe')}</span>
                <span className="font-semibold">{t('farmer.soil.next24h')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Precipitation Simulation Card */}
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CloudRain className="h-5 w-5" />
              {t('farmer.precip.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t(precipitationAdvisory.message)}</p>
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('farmer.precip.total24h')}</span>
                <span className="font-semibold flex items-center gap-1">
                  <CloudRain className="h-4 w-4" />
                  {precipitationAdvisory.totalPrecip.toFixed(1)} mm
                </span>
              </div>
              {precipitationAdvisory.nextHours.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('farmer.precip.upcoming')}
                  </p>
                  {precipitationAdvisory.nextHours.slice(0, 3).map((hour, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>{hour.time}</span>
                      <span className="font-medium">{hour.amount.toFixed(1)} mm</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Planting/Irrigation Advisory Card */}
        <Card className="glass-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sprout className="h-5 w-5" />
                {t('farmer.planting.title')}
              </CardTitle>
              <Badge
                variant={
                  plantingAdvisory.status === 'favorable'
                    ? 'secondary'
                    : plantingAdvisory.status === 'moderate'
                      ? 'default'
                      : 'destructive'
                }
              >
                {t(`farmer.planting.status.${plantingAdvisory.status}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t(plantingAdvisory.message)}</p>
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t('farmer.planting.factors')}
              </p>
              {plantingAdvisory.factors.map((factor, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-muted-foreground">•</span>
                  <span>{t(factor)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border/40">
                <span className="text-muted-foreground">{t('farmer.planting.timeframe')}</span>
                <span className="font-semibold">{t('farmer.planting.next48h')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spraying Safety Card */}
        <Card className="glass-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wind className="h-5 w-5" />
                {t('farmer.spraying.title')}
              </CardTitle>
              <Badge
                variant={
                  sprayingAdvisory.status === 'safe'
                    ? 'secondary'
                    : sprayingAdvisory.status === 'caution'
                      ? 'default'
                      : 'destructive'
                }
              >
                {t(`farmer.spraying.status.${sprayingAdvisory.status}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t(sprayingAdvisory.message)}</p>
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('farmer.spraying.windSpeed')}</span>
                <span className="font-semibold flex items-center gap-1">
                  <Wind className="h-4 w-4" />
                  {sprayingAdvisory.windSpeed.toFixed(1)} km/h
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('farmer.spraying.windDirection')}</span>
                <span className="font-semibold">{sprayingAdvisory.windDirection}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border/40">
                <span className="text-muted-foreground">{t('farmer.spraying.timeframe')}</span>
                <span className="font-semibold">{t('farmer.spraying.next6h')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
