import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Car,
  Snowflake,
  CloudFog,
  Gauge,
  AlertCircle,
} from 'lucide-react';
import type { SavedLocation } from '../hooks/usePersistedLocation';
import type { WeatherData } from '../hooks/useWeather';
import { useI18n } from '../i18n/useI18n';
import { calculateRoadIceRisk, calculateFogWarning } from '../lib/driverAdvisories';
import { calculateTirePressureRecommendation } from '../lib/tirePressure';
import { RouteLocationSearch } from './RouteLocationSearch';
import { useState } from 'react';
import { useRouteWeatherAnalysis } from '../hooks/useRouteWeatherAnalysis';
import type { GeocodingResult } from '../lib/openMeteo';

interface DriverWeatherPanelProps {
  location: SavedLocation;
  weatherData?: WeatherData;
  isLoading: boolean;
  error: Error | null;
}

export function DriverWeatherPanel({
  location,
  weatherData,
  isLoading,
  error,
}: DriverWeatherPanelProps) {
  const { t } = useI18n();
  const [routeStart, setRouteStart] = useState<GeocodingResult | null>(null);
  const [routeEnd, setRouteEnd] = useState<GeocodingResult | null>(null);

  const {
    data: routeAnalysis,
    isLoading: isRouteLoading,
    error: routeError,
  } = useRouteWeatherAnalysis(routeStart, routeEnd);

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
        {[...Array(3)].map((_, i) => (
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
        <AlertDescription>{t('driver.empty.description')}</AlertDescription>
      </Alert>
    );
  }

  const roadIceRisk = calculateRoadIceRisk(weatherData);
  const fogWarning = calculateFogWarning(weatherData);
  const tirePressure = calculateTirePressureRecommendation(weatherData.current.temperature, 'passenger');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('nav.driver')}</h2>
        <p className="text-sm text-muted-foreground">
          {location.name}, {location.country}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Road Ice Risk Card */}
        <Card className="glass-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Snowflake className="h-5 w-5" />
                {t('driver.ice.title')}
              </CardTitle>
              <Badge
                variant={
                  roadIceRisk.status === 'danger'
                    ? 'destructive'
                    : roadIceRisk.status === 'caution'
                      ? 'default'
                      : 'secondary'
                }
              >
                {t(`driver.ice.status.${roadIceRisk.status}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t(roadIceRisk.messageKey)}</p>
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('driver.ice.minTemp')}</span>
                <span className="font-semibold">{roadIceRisk.minTemp.toFixed(1)}°C</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fog Warning Card */}
        <Card className="glass-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CloudFog className="h-5 w-5" />
                {t('driver.fog.title')}
              </CardTitle>
              <Badge
                variant={
                  fogWarning.status === 'danger'
                    ? 'destructive'
                    : fogWarning.status === 'caution'
                      ? 'default'
                      : 'secondary'
                }
              >
                {t(`driver.fog.status.${fogWarning.status}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t(fogWarning.messageKey)}</p>
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('driver.fog.humidity')}</span>
                <span className="font-semibold">{fogWarning.humidity.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tire Pressure Card */}
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="h-5 w-5" />
              {t('driver.tire.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t(tirePressure.explanationKey)}</p>
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('driver.tire.currentTemp')}</span>
                <span className="font-semibold">{tirePressure.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('driver.tire.recommendation')}</span>
                <span className="font-semibold">
                  {tirePressure.adjustment}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Analysis Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">{t('driver.route.title')}</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <RouteLocationSearch
            placeholder={t('driver.route.startPlaceholder')}
            selectedLocation={routeStart}
            onLocationSelect={setRouteStart}
          />
          <RouteLocationSearch
            placeholder={t('driver.route.endPlaceholder')}
            selectedLocation={routeEnd}
            onLocationSelect={setRouteEnd}
          />
        </div>

        {routeStart && routeEnd && (
          <Card className="glass-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                {t('driver.route.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isRouteLoading && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              )}

              {routeError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{t('driver.route.error')}</AlertDescription>
                </Alert>
              )}

              {routeAnalysis && !isRouteLoading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('driver.route.overallRisk')}</span>
                    <Badge
                      variant={
                        routeAnalysis.overallRisk === 'danger'
                          ? 'destructive'
                          : routeAnalysis.overallRisk === 'caution'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {t(`driver.route.risk.${routeAnalysis.overallRisk}`)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{t(routeAnalysis.summaryKey)}</p>

                  {routeAnalysis.factors.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {t('driver.route.keyFactors')}
                      </p>
                      {routeAnalysis.factors.map((factor, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-muted-foreground">•</span>
                          <span>{t(factor.messageKey)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
