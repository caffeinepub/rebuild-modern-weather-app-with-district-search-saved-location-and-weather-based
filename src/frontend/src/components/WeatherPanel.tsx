import { Cloud, Droplets, Wind, Eye, Gauge, Sun, Leaf, AlertTriangle, Loader2 } from "lucide-react";
import { useI18n } from "../i18n/useI18n";
import { LaundryDryingRecommendation } from "./LaundryDryingRecommendation";
import { formatDailyForecastDate } from "../lib/formatDailyForecastDate";
import { getWeatherDescriptionKey } from "../lib/weatherTheme";
import type { WeatherData } from "../hooks/useWeather";
import type { SavedLocation } from "../hooks/usePersistedLocation";

interface WeatherPanelProps {
  weatherData: WeatherData | undefined;
  isLoading: boolean;
  error: Error | null;
  location: SavedLocation | null;
}

export function WeatherPanel({ weatherData, isLoading, error, location }: WeatherPanelProps) {
  const { t, locale } = useI18n();

  if (!location) {
    return (
      <div className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <Cloud className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-foreground/40" />
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

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return t("weather.aqi.good");
    if (aqi <= 100) return t("weather.aqi.moderate");
    if (aqi <= 150) return t("weather.aqi.poor");
    if (aqi <= 200) return t("weather.aqi.poor");
    if (aqi <= 300) return t("weather.aqi.veryPoor");
    return t("weather.aqi.veryPoor");
  };

  const getUVCategory = (uv: number) => {
    if (uv <= 2) return t("weather.uv.low");
    if (uv <= 5) return t("weather.uv.moderate");
    if (uv <= 7) return t("weather.uv.high");
    if (uv <= 10) return t("weather.uv.veryHigh");
    return t("weather.uv.extreme");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-surface p-4 sm:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
              {weatherData.current.temperature !== null
                ? `${Math.round(weatherData.current.temperature)}°C`
                : "N/A"}
            </h2>
            <p className="text-base sm:text-lg text-foreground/80">
              {t(getWeatherDescriptionKey(weatherData.current.weatherCode))}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Cloud className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">{t("weather.humidity")}</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{weatherData.current.humidity}%</p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-accent/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">{t("weather.windSpeed")}</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{weatherData.current.windSpeed} km/h</p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-secondary/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">{t("weather.visibility")}</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              {weatherData.current.visibility ? (weatherData.current.visibility / 1000).toFixed(1) : "N/A"} km
            </p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl border border-success/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/60">{t("weather.pressure")}</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{weatherData.current.pressure} hPa</p>
            {weatherData.current.pressureTrend && (
              <p className="text-xs sm:text-sm text-foreground/60 mt-1">
                {weatherData.current.pressureTrend > 0 ? "↑" : "↓"}{" "}
                {Math.abs(weatherData.current.pressureTrend).toFixed(1)} hPa
              </p>
            )}
          </div>

          {weatherData.current.uvIndex !== undefined && (
            <div className="glass-surface p-3 sm:p-4 rounded-xl border border-warning/20">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                </div>
                <span className="text-xs sm:text-sm text-foreground/60">{t("weather.uvIndex")}</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{weatherData.current.uvIndex}</p>
              <p className="text-xs sm:text-sm text-foreground/60 mt-1">{getUVCategory(weatherData.current.uvIndex)}</p>
            </div>
          )}

          {weatherData.current.aqi !== undefined && (
            <div className="glass-surface p-3 sm:p-4 rounded-xl border border-destructive/20">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                </div>
                <span className="text-xs sm:text-sm text-foreground/60">{t("weather.aqi")}</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{weatherData.current.aqi}</p>
              <p className="text-xs sm:text-sm text-foreground/60 mt-1">{getAQICategory(weatherData.current.aqi)}</p>
            </div>
          )}
        </div>
      </div>

      <LaundryDryingRecommendation weatherData={weatherData} />

      <div className="glass-surface p-4 sm:p-6 rounded-2xl">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t("weather.hourly")}</h3>
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex gap-3 sm:gap-4 min-w-max pb-2">
            {weatherData.hourly.slice(0, 24).map((hour, index) => (
              <div key={index} className="glass-surface p-3 sm:p-4 rounded-xl text-center min-w-[80px] sm:min-w-[90px]">
                <p className="text-xs sm:text-sm text-foreground/60 mb-2">{hour.time}</p>
                <p className="text-lg sm:text-xl font-bold mb-2">
                  {hour.temperature !== null ? `${Math.round(hour.temperature)}°` : "-"}
                </p>
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-xs sm:text-sm">{hour.precipitation}mm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                    <span className="text-xs sm:text-sm">{hour.windSpeed}km/h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-surface p-4 sm:p-6 rounded-2xl">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t("weather.daily")}</h3>
        <div className="space-y-3 sm:space-y-4">
          {weatherData.daily.map((day, index) => (
            <div key={index} className="glass-surface p-3 sm:p-4 rounded-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base mb-1">
                    {formatDailyForecastDate(day.date, locale)}
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/60">
                    {t(getWeatherDescriptionKey(day.weatherCode))}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <span className="text-base sm:text-lg font-bold">
                      {day.temperatureMax !== null ? `${Math.round(day.temperatureMax)}°` : "-"}
                    </span>
                    <span className="text-sm sm:text-base text-foreground/60">
                      {day.temperatureMin !== null ? `${Math.round(day.temperatureMin)}°` : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <Droplets className="w-4 h-4 text-primary" />
                    <span className="text-xs sm:text-sm">{day.precipitationSum}mm</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
