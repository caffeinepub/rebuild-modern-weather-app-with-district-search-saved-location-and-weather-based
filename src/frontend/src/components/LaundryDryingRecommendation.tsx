import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind } from 'lucide-react';
import type { WeatherData } from '../hooks/useWeather';
import { getLaundryDryingRecommendation } from '../lib/laundryDrying';
import { useI18n } from '../i18n/useI18n';

interface LaundryDryingRecommendationProps {
  weatherData: WeatherData;
}

export function LaundryDryingRecommendation({
  weatherData,
}: LaundryDryingRecommendationProps) {
  const { t } = useI18n();
  const recommendation = getLaundryDryingRecommendation(weatherData);

  // Defensive check: ensure no degenerate time ranges are displayed
  const isValidRange = (start: string, end: string) => start !== end;

  return (
    <Card className="glass-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wind className="h-5 w-5 text-primary" />
          {t('laundry.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendation.hasGoodTimes ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">
              {t('laundry.message.positive')}
            </p>
            <div className="space-y-3">
              {recommendation.bestRange && isValidRange(recommendation.bestRange.start, recommendation.bestRange.end) && (
                <div className="rounded-lg border border-border/40 bg-background/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t('laundry.bestTime')}
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {recommendation.bestRange.start} – {recommendation.bestRange.end}
                  </p>
                </div>
              )}
              {recommendation.additionalRanges
                .filter((range) => isValidRange(range.start, range.end))
                .map((range, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border/40 bg-background/60 p-4"
                  >
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t('laundry.additionalTime')}
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {range.start} – {range.end}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/40 bg-background/60 p-4">
            <p className="text-sm font-medium text-muted-foreground">
              {t('laundry.message.negative')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
