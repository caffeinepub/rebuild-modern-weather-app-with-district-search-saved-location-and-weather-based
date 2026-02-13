import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '../i18n/useI18n';
import { useMarineConditions } from '../hooks/useMarineConditions';
import type { SavedLocation } from '../hooks/usePersistedLocation';
import { Waves, Wind, Thermometer, Eye, Navigation, Clock, AlertCircle } from 'lucide-react';

interface BeachMarineScreenProps {
  location: SavedLocation | null;
}

export function BeachMarineScreen({ location }: BeachMarineScreenProps) {
  const { t } = useI18n();
  const { data: marineData, isLoading, error } = useMarineConditions(
    location?.latitude,
    location?.longitude
  );

  // Empty state when no location is selected
  if (!location) {
    return (
      <div className="flex min-h-[400px] items-center justify-center glass-surface rounded-2xl">
        <div className="text-center">
          <div className="mx-auto mb-6 rounded-2xl bg-primary/10 p-6 w-fit">
            <Waves className="h-20 w-20 text-primary" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            {t('beach.empty.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('beach.empty.description')}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="glass-surface rounded-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="glass-surface rounded-xl">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="font-medium">{t('beach.error')}</AlertDescription>
      </Alert>
    );
  }

  if (!marineData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-surface-strong rounded-2xl p-6">
        <h2 className="text-3xl font-bold mb-2">{t('beach.title')}</h2>
        <p className="text-lg font-medium text-muted-foreground">{location.name}</p>
      </div>

      {/* Sea Surface Temperature */}
      <Card className="glass-surface-strong rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="rounded-lg bg-primary/15 p-2">
              <Thermometer className="h-6 w-6 text-primary" />
            </div>
            {t('beach.sst.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marineData.seaSurfaceTemperature !== null ? (
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold">
                {marineData.seaSurfaceTemperature.toFixed(1)}
              </span>
              <span className="text-2xl font-semibold text-muted-foreground">°C</span>
            </div>
          ) : (
            <p className="text-lg font-medium text-muted-foreground">{t('beach.notAvailable')}</p>
          )}
        </CardContent>
      </Card>

      {/* Wave Conditions */}
      <Card className="glass-surface-strong rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="rounded-lg bg-primary/15 p-2">
              <Waves className="h-6 w-6 text-primary" />
            </div>
            {t('beach.waves.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border-2 border-accent/20 bg-accent/10 p-5">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">{t('beach.waves.height')}</p>
              {marineData.waveHeight !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{marineData.waveHeight.toFixed(1)}</span>
                  <span className="text-lg font-semibold text-muted-foreground">m</span>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">{t('beach.notAvailable')}</p>
              )}
            </div>
            <div className="rounded-xl border-2 border-accent/20 bg-accent/10 p-5">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">{t('beach.waves.period')}</p>
              {marineData.wavePeriod !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{marineData.wavePeriod.toFixed(1)}</span>
                  <span className="text-lg font-semibold text-muted-foreground">s</span>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">{t('beach.notAvailable')}</p>
              )}
            </div>
            <div className="rounded-xl border-2 border-accent/20 bg-accent/10 p-5">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">{t('beach.waves.direction')}</p>
              {marineData.waveDirection !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{marineData.waveDirection.toFixed(0)}</span>
                  <span className="text-lg font-semibold text-muted-foreground">°</span>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">{t('beach.notAvailable')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wind Conditions */}
      <Card className="glass-surface-strong rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="rounded-lg bg-primary/15 p-2">
              <Wind className="h-6 w-6 text-primary" />
            </div>
            {t('beach.wind.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border-2 border-accent/20 bg-accent/10 p-5">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">{t('beach.wind.speed')}</p>
              {marineData.windSpeed !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{marineData.windSpeed.toFixed(1)}</span>
                  <span className="text-lg font-semibold text-muted-foreground">km/h</span>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">{t('beach.notAvailable')}</p>
              )}
            </div>
            <div className="rounded-xl border-2 border-accent/20 bg-accent/10 p-5">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">{t('beach.wind.direction')}</p>
              {marineData.windDirection !== null ? (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/20 p-2">
                    <Navigation 
                      className="h-7 w-7 text-accent" 
                      style={{ transform: `rotate(${marineData.windDirection}deg)` }}
                    />
                  </div>
                  <span className="text-3xl font-bold">{marineData.windDirection.toFixed(0)}°</span>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">{t('beach.notAvailable')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility / Fog Indicator */}
      <Card className="glass-surface-strong rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="rounded-lg bg-primary/15 p-2">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            {t('beach.visibility.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marineData.visibility !== null ? (
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold">
                  {marineData.visibility >= 1000 
                    ? `${(marineData.visibility / 1000).toFixed(1)} km`
                    : `${marineData.visibility.toFixed(0)} m`
                  }
                </span>
              </div>
              {marineData.visibilityDerived && (
                <Badge variant="outline" className="text-xs font-semibold">
                  {t('beach.visibility.derived')}
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-lg font-medium text-muted-foreground">{t('beach.notAvailable')}</p>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{t('beach.lastUpdated')}</span>
      </div>
    </div>
  );
}
