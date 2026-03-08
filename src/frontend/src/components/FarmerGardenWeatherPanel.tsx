import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Bug,
  CloudRain,
  Droplets,
  Loader2,
  Snowflake,
  Sprout,
  Sun,
  ThermometerSnowflake,
  Tractor,
  Wheat,
  Wind,
} from "lucide-react";
import type { SavedLocation } from "../hooks/usePersistedLocation";
import type { WeatherData } from "../hooks/useWeather";
import type { TranslationKey } from "../i18n/translations";
import { useI18n } from "../i18n/useI18n";
import {
  calculateFrostAdvisory,
  calculateHarvestingAdvisory,
  calculateIrrigationAdvisory,
  calculatePestControlAdvisory,
  calculateSeedingAdvisory,
  calculateSoilPrepAdvisory,
  calculateSprayingAdvisory,
} from "../lib/farmerAdvisories";

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
        <p className="text-base sm:text-lg text-foreground/60">
          {t("location.search.placeholder")}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-primary animate-spin" />
        <p className="text-base sm:text-lg text-foreground/60">
          Loading weather data...
        </p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-destructive" />
        <p className="text-base sm:text-lg text-foreground/60">
          {t("weather.error")}
        </p>
      </div>
    );
  }

  // Calculate all agricultural advisories
  const sprayingAdvisory = calculateSprayingAdvisory(weatherData);
  const irrigationAdvisory = calculateIrrigationAdvisory(weatherData);
  const harvestingAdvisory = calculateHarvestingAdvisory(weatherData);
  const frostAdvisory = calculateFrostAdvisory(weatherData);
  const seedingAdvisory = calculateSeedingAdvisory(weatherData);
  const soilPrepAdvisory = calculateSoilPrepAdvisory(weatherData);
  const pestControlAdvisory = calculatePestControlAdvisory(weatherData);

  const getStatusVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" => {
    if (status === "optimal" || status === "safe") return "default";
    if (status === "suitable" || status === "moderate" || status === "caution")
      return "secondary";
    return "destructive";
  };

  const getStatusLabel = (status: string): TranslationKey => {
    // Map various status values to the three main translation keys
    if (status === "optimal" || status === "safe")
      return "farmer.status.optimal";
    if (status === "suitable" || status === "moderate" || status === "caution")
      return "farmer.status.suitable";
    return "farmer.status.notRecommended";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-surface p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
            <Sprout className="w-7 h-7 sm:w-10 sm:h-10 text-success" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {t("farmer.title")}
            </h2>
            <p className="text-xs sm:text-sm text-foreground/60">
              {t("farmer.agriculturalWeatherInsights")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">
                {t("weather.humidity")}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              {weatherData.current.humidity}%
            </p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-accent/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <ThermometerSnowflake className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">
                {t("weather.feelsLike")}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              {weatherData.current.temperature !== null
                ? `${Math.round(weatherData.current.temperature)}°C`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Agricultural Weather Information Section */}
      <div className="glass-surface p-4 sm:p-6 rounded-2xl">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-primary" />
          {t("farmer.agriculturalWeatherInsights")}
        </h3>

        <div className="space-y-3">
          {/* Spraying Advisory */}
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CloudRain className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {t("farmer.spraying.title")}
                    </span>
                    <Badge
                      variant={getStatusVariant(sprayingAdvisory.status)}
                      className="text-xs"
                    >
                      {t(getStatusLabel(sprayingAdvisory.status))}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/70">
                    {t(sprayingAdvisory.message)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Irrigation Advisory */}
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Droplets className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {t("farmer.irrigation.title")}
                    </span>
                    <Badge
                      variant={getStatusVariant(irrigationAdvisory.status)}
                      className="text-xs"
                    >
                      {t(getStatusLabel(irrigationAdvisory.status))}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/70">
                    {t(irrigationAdvisory.message)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Harvesting Advisory */}
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Wheat className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {t("farmer.harvesting.title")}
                    </span>
                    <Badge
                      variant={getStatusVariant(harvestingAdvisory.status)}
                      className="text-xs"
                    >
                      {t(getStatusLabel(harvestingAdvisory.status))}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/70">
                    {t(harvestingAdvisory.message)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Frost Warning */}
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Snowflake className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {t("farmer.frost.title")}
                    </span>
                    <Badge
                      variant={getStatusVariant(frostAdvisory.status)}
                      className="text-xs"
                    >
                      {t(
                        `farmer.frost.status.${frostAdvisory.status}` as TranslationKey,
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/70">
                    {t(frostAdvisory.message)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seeding Advisory */}
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sprout className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {t("farmer.seeding.title")}
                    </span>
                    <Badge
                      variant={getStatusVariant(seedingAdvisory.status)}
                      className="text-xs"
                    >
                      {t(getStatusLabel(seedingAdvisory.status))}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/70">
                    {t(seedingAdvisory.message)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Soil Preparation Advisory */}
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Tractor className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {t("farmer.soilPrep.title")}
                    </span>
                    <Badge
                      variant={getStatusVariant(soilPrepAdvisory.status)}
                      className="text-xs"
                    >
                      {t(getStatusLabel(soilPrepAdvisory.status))}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/70">
                    {t(soilPrepAdvisory.message)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pest Control Advisory */}
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bug className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {t("farmer.pestControl.title")}
                    </span>
                    <Badge
                      variant={getStatusVariant(pestControlAdvisory.status)}
                      className="text-xs"
                    >
                      {t(getStatusLabel(pestControlAdvisory.status))}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/70">
                    {t(pestControlAdvisory.message)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
