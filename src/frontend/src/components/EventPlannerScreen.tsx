import { Calendar, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import type { SavedLocation } from "../hooks/usePersistedLocation";
import { useSessionState } from "../hooks/useSessionState";
import type { WeatherData } from "../hooks/useWeather";
import { useI18n } from "../i18n/useI18n";
import {
  EVENT_TYPE_CRITERIA,
  type EventType,
} from "../lib/eventPlannerCriteria";
import { rankDaysBySuitability } from "../lib/eventSuitabilityScoring";
import type { WeatherFactorWeights } from "../lib/eventSuitabilityScoring";
import { CriteriaCustomizer } from "./eventplanner/CriteriaCustomizer";
import { DateRangeSelector } from "./eventplanner/DateRangeSelector";
import { EventTypeSelector } from "./eventplanner/EventTypeSelector";
import { RecommendedDates } from "./eventplanner/RecommendedDates";
import { Card } from "./ui/card";

interface EventPlannerScreenProps {
  location: SavedLocation | null;
  weatherData: WeatherData | undefined;
}

export function EventPlannerScreen({
  location,
  weatherData,
}: EventPlannerScreenProps) {
  const { t } = useI18n();
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(
    null,
  );
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
    null,
  );
  const [customWeights, setCustomWeights] =
    useSessionState<WeatherFactorWeights | null>(
      "eventPlanner.customWeights",
      null,
    );

  // Reset weights when event type changes
  useEffect(() => {
    if (selectedEventType) {
      setCustomWeights(null);
    }
  }, [selectedEventType, setCustomWeights]);

  // Initialize date range to next 14 days
  useEffect(() => {
    if (!dateRange) {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 13);
      setDateRange({ start, end });
    }
  }, [dateRange]);

  if (!location) {
    return (
      <Card className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-foreground/40" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">
          {t("eventPlanner.emptyStateTitle")}
        </h3>
        <p className="text-sm sm:text-base text-foreground/60">
          {t("eventPlanner.emptyStateMessage")}
        </p>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-foreground/40" />
        <p className="text-base sm:text-lg text-foreground/60">
          {t("eventPlanner.loadingWeather")}
        </p>
      </Card>
    );
  }

  // Calculate suitability scores when event type and date range are selected
  const rankedDates =
    selectedEventType && dateRange
      ? rankDaysBySuitability(
          weatherData.daily,
          EVENT_TYPE_CRITERIA[selectedEventType],
          customWeights || undefined,
          dateRange.start,
          dateRange.end,
        )
      : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="glass-surface p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">
            {t("eventPlanner.title")}
          </h2>
          {selectedEventType && (
            <CriteriaCustomizer
              eventType={selectedEventType}
              currentWeights={customWeights}
              onWeightsChange={setCustomWeights}
            />
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          <EventTypeSelector
            selectedEventType={selectedEventType}
            onEventTypeChange={setSelectedEventType}
          />

          {selectedEventType && (
            <>
              <DateRangeSelector
                dateRange={dateRange}
                onRangeChange={setDateRange}
                maxDays={14}
              />

              {rankedDates.length > 0 && (
                <RecommendedDates
                  results={rankedDates}
                  eventType={selectedEventType}
                />
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
