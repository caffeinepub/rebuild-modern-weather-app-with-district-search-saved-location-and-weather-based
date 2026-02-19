import { Waves, Wind, Thermometer, Eye, AlertTriangle, Loader2, Droplets } from "lucide-react";
import { useI18n } from "../i18n/useI18n";
import { useMarineConditions } from "../hooks/useMarineConditions";
import type { WeatherData } from "../hooks/useWeather";
import type { SavedLocation } from "../hooks/usePersistedLocation";

interface BeachMarineScreenProps {
  location: SavedLocation | null;
  weatherData: WeatherData | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function BeachMarineScreen({ location, weatherData, isLoading, error }: BeachMarineScreenProps) {
  const { t } = useI18n();
  const { data: marineData, isLoading: isMarineLoading } = useMarineConditions(
    location?.latitude,
    location?.longitude
  );

  if (!location) {
    return (
      <div className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <Waves className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-foreground/40" />
        <p className="text-base sm:text-lg text-foreground/60">{t("location.search.placeholder")}</p>
      </div>
    );
  }

  if (isLoading || isMarineLoading) {
    return (
      <div className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-primary animate-spin" />
        <p className="text-base sm:text-lg text-foreground/60">Loading marine data...</p>
      </div>
    );
  }

  if (error || !weatherData || !marineData) {
    return (
      <div className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-destructive" />
        <p className="text-base sm:text-lg text-foreground/60">{t("weather.error")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-surface p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Waves className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{t("beach.title")}</h2>
            <p className="text-xs sm:text-sm text-foreground/60">Marine and coastal conditions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">Wave Height</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              {marineData.waveHeight !== null ? marineData.waveHeight.toFixed(1) : "N/A"}m
            </p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-accent/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">Wave Period</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              {marineData.wavePeriod !== null ? marineData.wavePeriod.toFixed(1) : "N/A"}s
            </p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-secondary/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">Wave Direction</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{marineData.waveDirection}°</p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-success/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">Sea Temperature</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              {marineData.seaSurfaceTemperature !== null ? marineData.seaSurfaceTemperature.toFixed(1) : "N/A"}°C
            </p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-warning/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">Wind Speed</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{weatherData.current.windSpeed.toFixed(1)} km/h</p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-destructive/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">Visibility</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              {weatherData.current.visibility ? (weatherData.current.visibility / 1000).toFixed(1) : "N/A"} km
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
