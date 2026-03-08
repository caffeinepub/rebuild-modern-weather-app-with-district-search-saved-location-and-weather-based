import { useI18n } from "../../i18n/useI18n";
import type { EventType } from "../../lib/eventPlannerCriteria";
import type { SuitabilityResult } from "../../lib/eventSuitabilityScoring";
import { DateRecommendationCard } from "./DateRecommendationCard";

interface RecommendedDatesProps {
  results: SuitabilityResult[];
  eventType: EventType;
}

export function RecommendedDates({
  results,
  eventType,
}: RecommendedDatesProps) {
  const { t } = useI18n();

  if (results.length === 0) {
    return (
      <div className="glass-surface p-6 rounded-xl text-center">
        <p className="text-foreground/60">
          {t("eventPlanner.noRecommendations")}
        </p>
      </div>
    );
  }

  const topResult = results[0];
  const alternatives = results.slice(1, 4);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3">
          {t("eventPlanner.bestDay")}
        </h3>
        <DateRecommendationCard
          result={topResult}
          eventType={eventType}
          isTopPick
        />
      </div>

      {alternatives.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3">
            {t("eventPlanner.alternatives")}
          </h3>
          <div className="space-y-3">
            {alternatives.map((result) => (
              <DateRecommendationCard
                key={result.date}
                result={result}
                eventType={eventType}
                isTopPick={false}
              />
            ))}
          </div>
        </div>
      )}

      {topResult.score < 60 && (
        <div className="glass-surface p-4 rounded-xl border border-warning/30">
          <p className="text-sm text-foreground/80">
            {t("eventPlanner.lowScoreWarning")}
          </p>
        </div>
      )}
    </div>
  );
}
