import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Info } from 'lucide-react';
import type { WeatherData } from '../hooks/useWeather';
import { getLaundryDryingRecommendation } from '../lib/laundryDrying';
import { useI18n } from '../i18n/useI18n';

interface LaundryDryingRecommendationProps {
  weatherData: WeatherData;
}

export function LaundryDryingRecommendation({ weatherData }: LaundryDryingRecommendationProps) {
  const { t } = useI18n();
  const recommendation = getLaundryDryingRecommendation(weatherData);

  return (
    <Card className="glass-surface rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{t('laundry.title')}</CardTitle>
        <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">{t('laundry.note')}</p>
        </div>
      </CardHeader>
      <CardContent>
        {recommendation.hasGoodTimes ? (
          <div className="space-y-4">
            {/* Best Time */}
            {recommendation.bestRange && (
              <div className="rounded-xl border-2 border-success/30 bg-success/10 p-5 shadow-soft">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-success/20 p-2">
                    <Clock className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="text-lg font-bold text-success">{t('laundry.bestTime')}</h3>
                </div>
                <p className="text-2xl font-bold">
                  {recommendation.bestRange.start} - {recommendation.bestRange.end}
                </p>
              </div>
            )}

            {/* Alternative Times */}
            {recommendation.additionalRanges.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {t('laundry.alternativeTimes')}
                </h3>
                <div className="space-y-2">
                  {recommendation.additionalRanges.map((range, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 shadow-soft"
                    >
                      <Clock className="h-5 w-5 text-primary" />
                      <p className="text-lg font-bold">
                        {range.start} - {range.end}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="text-lg font-bold text-destructive mb-2">
              {t('laundry.noGoodTimes')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('laundry.noGoodTimes.desc')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
