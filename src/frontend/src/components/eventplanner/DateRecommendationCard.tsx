import { Calendar, Droplets, Thermometer, Wind } from "lucide-react";
import { useI18n } from "../../i18n/useI18n";
import type { EventType } from "../../lib/eventPlannerCriteria";
import { getSuitabilityLevel } from "../../lib/eventSuitabilityScoring";
import type { SuitabilityResult } from "../../lib/eventSuitabilityScoring";
import { formatDailyForecastDate } from "../../lib/formatDailyForecastDate";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

interface DateRecommendationCardProps {
  result: SuitabilityResult;
  eventType: EventType;
  isTopPick: boolean;
}

export function DateRecommendationCard({
  result,
  eventType: _eventType,
  isTopPick,
}: DateRecommendationCardProps) {
  const { t, locale } = useI18n();
  const level = getSuitabilityLevel(result.score);

  const levelColors = {
    excellent:
      "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
    good: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
    fair: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
    poor: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
  };

  const cardBorderColors = {
    excellent: "border-green-500/30",
    good: "border-yellow-500/30",
    fair: "border-orange-500/30",
    poor: "border-red-500/30",
  };

  return (
    <Card
      className={`glass-surface p-4 rounded-xl border-2 ${cardBorderColors[level]} ${
        isTopPick ? "shadow-glow" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-semibold">
            {formatDailyForecastDate(result.date, locale)}
          </span>
        </div>
        <Badge className={`${levelColors[level]} font-bold text-lg px-3 py-1`}>
          {Math.round(result.score)}%
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="glass-surface p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground/60">
              {t("eventPlanner.temperature")}
            </span>
          </div>
          <p className="text-sm font-semibold">
            {result.temperatureMin !== null && result.temperatureMax !== null
              ? `${Math.round(result.temperatureMin)}° - ${Math.round(result.temperatureMax)}°`
              : "N/A"}
          </p>
        </div>

        <div className="glass-surface p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground/60">
              {t("eventPlanner.rain")}
            </span>
          </div>
          <p className="text-sm font-semibold">{result.rainProbability}%</p>
        </div>

        <div className="glass-surface p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Wind className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground/60">
              {t("eventPlanner.wind")}
            </span>
          </div>
          <p className="text-sm font-semibold">{result.windSpeed} km/h</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {t(`eventPlanner.suitability.${level}`)}
        </Badge>
        {isTopPick && (
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
            {t("eventPlanner.recommended")}
          </Badge>
        )}
      </div>
    </Card>
  );
}
