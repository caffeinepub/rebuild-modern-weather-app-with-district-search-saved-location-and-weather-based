import { Wind, Sun, CloudRain } from "lucide-react";
import { useI18n } from "../i18n/useI18n";
import { getLaundryDryingRecommendation } from "../lib/laundryDrying";
import type { WeatherData } from "../hooks/useWeather";

interface LaundryDryingRecommendationProps {
  weatherData: WeatherData;
}

export function LaundryDryingRecommendation({ weatherData }: LaundryDryingRecommendationProps) {
  const { t } = useI18n();
  const recommendation = getLaundryDryingRecommendation(weatherData);

  if (!recommendation || !recommendation.hasGoodTimes) {
    return null;
  }

  const getIcon = () => {
    return <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-success" />;
  };

  return (
    <div className="glass-surface p-4 sm:p-6 rounded-2xl border border-success/30 bg-success/5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-success/20">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">{t("laundry.title")}</h3>
          <p className="text-xs sm:text-sm text-foreground/60 mb-2 sm:mb-3 italic">
            {t("laundry.note")}
          </p>
          {recommendation.bestRange && (
            <div className="mb-2 sm:mb-3">
              <p className="text-sm sm:text-base font-medium text-success mb-1">
                {t("laundry.bestTime")}
              </p>
              <p className="text-base sm:text-lg font-bold">
                {recommendation.bestRange.start} - {recommendation.bestRange.end}
              </p>
            </div>
          )}
          {recommendation.additionalRanges.length > 0 && (
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm font-medium text-foreground/60">
                {t("laundry.alternativeTimes")}
              </p>
              {recommendation.additionalRanges.map((range, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-foreground/70">
                  <span className="font-medium">
                    {range.start} - {range.end}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
