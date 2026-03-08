import { RotateCcw, Settings } from "lucide-react";
import { useI18n } from "../../i18n/useI18n";
import type { EventType } from "../../lib/eventPlannerCriteria";
import {
  DEFAULT_WEIGHTS,
  type WeatherFactorWeights,
} from "../../lib/eventSuitabilityScoring";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Slider } from "../ui/slider";

interface CriteriaCustomizerProps {
  eventType: EventType;
  currentWeights: WeatherFactorWeights | null;
  onWeightsChange: (weights: WeatherFactorWeights | null) => void;
}

export function CriteriaCustomizer({
  eventType: _eventType,
  currentWeights,
  onWeightsChange,
}: CriteriaCustomizerProps) {
  const { t } = useI18n();

  const weights = currentWeights || DEFAULT_WEIGHTS;

  const handleWeightChange = (
    factor: keyof WeatherFactorWeights,
    value: number[],
  ) => {
    onWeightsChange({
      ...weights,
      [factor]: value[0],
    });
  };

  const handleReset = () => {
    onWeightsChange(null);
  };

  const getImportanceLabel = (value: number) => {
    if (value === 1) return t("eventPlanner.importance.low");
    if (value === 2) return t("eventPlanner.importance.moderate");
    if (value === 3) return t("eventPlanner.importance.important");
    return t("eventPlanner.importance.critical");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          {t("eventPlanner.customizeCriteria")}
        </Button>
      </SheetTrigger>
      <SheetContent className="glass-surface backdrop-blur-xl bg-card">
        <SheetHeader>
          <SheetTitle>{t("eventPlanner.customizeCriteria")}</SheetTitle>
          <SheetDescription>
            {t("eventPlanner.customizeCriteriaDesc")}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {t("eventPlanner.rainImportance")}
              </span>
              <span className="text-sm text-foreground/60">
                {getImportanceLabel(weights.rain)}
              </span>
            </div>
            <Slider
              value={[weights.rain]}
              onValueChange={(value) => handleWeightChange("rain", value)}
              min={1}
              max={4}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {t("eventPlanner.windImportance")}
              </span>
              <span className="text-sm text-foreground/60">
                {getImportanceLabel(weights.wind)}
              </span>
            </div>
            <Slider
              value={[weights.wind]}
              onValueChange={(value) => handleWeightChange("wind", value)}
              min={1}
              max={4}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {t("eventPlanner.temperatureImportance")}
              </span>
              <span className="text-sm text-foreground/60">
                {getImportanceLabel(weights.temperature)}
              </span>
            </div>
            <Slider
              value={[weights.temperature]}
              onValueChange={(value) =>
                handleWeightChange("temperature", value)
              }
              min={1}
              max={4}
              step={1}
              className="w-full"
            />
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
            {t("eventPlanner.reset")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
