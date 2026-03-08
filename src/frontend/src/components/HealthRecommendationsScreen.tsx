import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Heart,
  Wind,
  XCircle,
} from "lucide-react";
import type { SavedLocation } from "../hooks/usePersistedLocation";
import type { WeatherData } from "../hooks/useWeather";
import { useI18n } from "../i18n/useI18n";
import {
  calculateAllergyIndex,
  calculateExerciseTimes,
  calculateMigraineTrigger,
  calculateRespiratoryWarning,
} from "../lib/healthAdvisories";

interface HealthRecommendationsScreenProps {
  location: SavedLocation | null;
  weatherData?: WeatherData;
  theme: string;
}

export function HealthRecommendationsScreen({
  location,
  weatherData,
  theme: _theme,
}: HealthRecommendationsScreenProps) {
  const { t } = useI18n();

  if (!location) {
    return (
      <div className="glass-surface rounded-2xl p-8 sm:p-12 text-center">
        <Heart className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-primary/40" />
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          {t("health.empty.title")}
        </h2>
        <p className="text-foreground/60">{t("health.empty.description")}</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="glass-surface rounded-2xl p-8 sm:p-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-foreground/10 rounded w-3/4" />
          <div className="space-y-4">
            <div className="h-32 bg-foreground/10 rounded" />
            <div className="h-32 bg-foreground/10 rounded" />
            <div className="h-32 bg-foreground/10 rounded" />
            <div className="h-32 bg-foreground/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const migraineTrigger = calculateMigraineTrigger(weatherData);
  const allergyIndex = calculateAllergyIndex(weatherData);
  const exerciseTimes = calculateExerciseTimes(weatherData);
  const respiratoryWarning = calculateRespiratoryWarning(weatherData);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
      case "safe":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "moderate":
      case "caution":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "high":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "veryHigh":
      case "danger":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-foreground/60 bg-foreground/5 border-foreground/10";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
      case "safe":
        return <CheckCircle2 className="w-5 h-5" />;
      case "moderate":
      case "caution":
        return <AlertTriangle className="w-5 h-5" />;
      case "high":
      case "veryHigh":
      case "danger":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-surface rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" />
          {t("health.title")}
        </h2>
        <p className="text-sm text-foreground/60">{location.name}</p>
      </div>

      {/* Migraine Alert */}
      <div className="glass-surface rounded-2xl p-4 sm:p-6 border border-white/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {t("health.migraine.title")}
            </h3>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(migraineTrigger.riskLevel)}`}
            >
              {getRiskIcon(migraineTrigger.riskLevel)}
              {t(migraineTrigger.messageKey)}
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">
              {t("health.migraine.pressureDrop")}
            </span>
            <span className="font-medium">
              {migraineTrigger.pressureDrop.toFixed(1)} hPa
            </span>
          </div>
          {migraineTrigger.riskLevel !== "low" && (
            <p className="text-foreground/80 mt-3 p-3 bg-foreground/5 rounded-lg">
              {t("health.migraine.advice")}
            </p>
          )}
        </div>
      </div>

      {/* Allergy Index */}
      <div className="glass-surface rounded-2xl p-4 sm:p-6 border border-white/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wind className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {t("health.allergy.title")}
            </h3>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(allergyIndex.riskLevel)}`}
            >
              {getRiskIcon(allergyIndex.riskLevel)}
              {t(allergyIndex.messageKey)}
            </div>
          </div>
        </div>
        {allergyIndex.factors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-foreground/60">
              {t("health.allergy.factors")}
            </p>
            <div className="flex flex-wrap gap-2">
              {allergyIndex.factors.map((factor) => (
                <span
                  key={factor}
                  className="px-3 py-1 bg-foreground/5 rounded-full text-xs font-medium"
                >
                  {t(`health.allergy.factor.${factor}` as any)}
                </span>
              ))}
            </div>
            <p className="text-foreground/80 mt-3 p-3 bg-foreground/5 rounded-lg text-sm">
              {t(`health.allergy.advice.${allergyIndex.riskLevel}` as any)}
            </p>
          </div>
        )}
      </div>

      {/* Exercise Times */}
      <div className="glass-surface rounded-2xl p-4 sm:p-6 border border-white/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {t("health.exercise.title")}
            </h3>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${exerciseTimes.activityType === "outdoor" ? "text-green-500 bg-green-500/10 border-green-500/20" : "text-blue-500 bg-blue-500/10 border-blue-500/20"}`}
            >
              {t(
                `health.exercise.activityType.${exerciseTimes.activityType}` as any,
              )}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {exerciseTimes.bestTime && (
            <div className="p-3 bg-foreground/5 rounded-lg">
              <p className="text-sm font-medium text-foreground/60 mb-1">
                {t("health.exercise.bestTime")}
              </p>
              <p className="text-lg font-semibold">
                {formatTime(exerciseTimes.bestTime.start)} -{" "}
                {formatTime(exerciseTimes.bestTime.end)}
              </p>
              {exerciseTimes.bestTime.reasons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {exerciseTimes.bestTime.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
                    >
                      {t(`health.exercise.factor.${reason}` as any)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {exerciseTimes.alternativeTimes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground/60 mb-2">
                {t("health.exercise.alternativeTime")}
              </p>
              <div className="space-y-2">
                {exerciseTimes.alternativeTimes.map((time) => (
                  <div
                    key={`${time.start}-${time.end}`}
                    className="p-2 bg-foreground/5 rounded-lg text-sm"
                  >
                    <span className="font-medium">
                      {formatTime(time.start)} - {formatTime(time.end)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Respiratory Warning */}
      <div className="glass-surface rounded-2xl p-4 sm:p-6 border border-white/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Droplets className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {t("health.respiratory.title")}
            </h3>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(respiratoryWarning.riskLevel)}`}
            >
              {getRiskIcon(respiratoryWarning.riskLevel)}
              {t(respiratoryWarning.messageKey)}
            </div>
          </div>
        </div>
        {respiratoryWarning.triggers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-foreground/60">
              {t("health.respiratory.triggers")}
            </p>
            <div className="flex flex-wrap gap-2">
              {respiratoryWarning.triggers.map((trigger) => (
                <span
                  key={trigger}
                  className="px-3 py-1 bg-foreground/5 rounded-full text-xs font-medium"
                >
                  {t(`health.respiratory.trigger.${trigger}` as any)}
                </span>
              ))}
            </div>
            <p className="text-foreground/80 mt-3 p-3 bg-foreground/5 rounded-lg text-sm">
              {t(
                `health.respiratory.advice.${respiratoryWarning.riskLevel}` as any,
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
