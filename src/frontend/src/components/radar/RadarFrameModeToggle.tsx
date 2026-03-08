import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Clock, CloudRain } from "lucide-react";
import { useI18n } from "../../i18n/useI18n";

interface RadarFrameModeToggleProps {
  mode: "forecast" | "past";
  onModeChange: (mode: "forecast" | "past") => void;
  nowcastAvailable: boolean;
}

export function RadarFrameModeToggle({
  mode,
  onModeChange,
  nowcastAvailable,
}: RadarFrameModeToggleProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-1">
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(value) => {
          if (value) onModeChange(value as "forecast" | "past");
        }}
        className="justify-start"
      >
        <ToggleGroupItem
          value="forecast"
          aria-label={t("radar.mode.forecast")}
          disabled={!nowcastAvailable}
          data-ocid="radar.mode.forecast.toggle"
          className="relative"
        >
          <CloudRain className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t("radar.mode.forecast")}</span>
          {!nowcastAvailable && (
            <span className="absolute -bottom-5 left-0 right-0 text-center text-[10px] text-muted-foreground whitespace-nowrap">
              {t("radar.mode.noForecast")}
            </span>
          )}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="past"
          aria-label={t("radar.mode.past")}
          data-ocid="radar.mode.past.toggle"
        >
          <Clock className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t("radar.mode.past")}</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
