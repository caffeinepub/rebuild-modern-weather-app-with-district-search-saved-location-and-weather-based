import { Sprout, Droplets, AlertTriangle, Loader2, ThermometerSnowflake, Sun } from "lucide-react";
import { useI18n } from "../i18n/useI18n";
import type { WeatherData } from "../hooks/useWeather";
import type { SavedLocation } from "../hooks/usePersistedLocation";

interface FarmerGardenWeatherPanelProps {
  weatherData: WeatherData | undefined;
  isLoading: boolean;
  error: Error | null;
  location: SavedLocation | null;
}

export function FarmerGardenWeatherPanel({
  weatherData,
  isLoading,
  error,
  location,
}: FarmerGardenWeatherPanelProps) {
  const { t } = useI18n();

  if (!location) {
    return (
      <div className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <Sprout className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-foreground/40" />
        <p className="text-base sm:text-lg text-foreground/60">{t("location.search.placeholder")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-primary animate-spin" />
        <p className="text-base sm:text-lg text-foreground/60">Loading weather data...</p>
      </div>
    );
  }

  if (error || !weatherData) {
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
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
            <Sprout className="w-7 h-7 sm:w-10 sm:h-10 text-success" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{t("farmer.title")}</h2>
            <p className="text-xs sm:text-sm text-foreground/60">Agricultural weather insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">Humidity</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{weatherData.current.humidity}%</p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-accent/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <ThermometerSnowflake className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">Temperature</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              {weatherData.current.temperature !== null
                ? `${Math.round(weatherData.current.temperature)}°C`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-primary/30 bg-primary/5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Weather Advisory</h3>
            <p className="text-sm sm:text-base text-foreground/80">
              Current conditions are suitable for outdoor agricultural activities. Monitor weather updates regularly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
