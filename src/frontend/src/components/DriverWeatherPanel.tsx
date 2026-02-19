import { Car, AlertTriangle, Loader2, Snowflake, CloudFog, Gauge, Navigation } from "lucide-react";
import { useI18n } from "../i18n/useI18n";
import { calculateRoadIceRisk, calculateFogWarning } from "../lib/driverAdvisories";
import { RouteLocationSearch } from "./RouteLocationSearch";
import { useRouteWeatherAnalysis } from "../hooks/useRouteWeatherAnalysis";
import { useState } from "react";
import type { WeatherData } from "../hooks/useWeather";
import type { SavedLocation } from "../hooks/usePersistedLocation";
import type { GeocodingResult } from "../lib/openMeteo";

interface DriverWeatherPanelProps {
  weatherData: WeatherData | undefined;
  isLoading: boolean;
  error: Error | null;
  location: SavedLocation | null;
}

export function DriverWeatherPanel({ weatherData, isLoading, error, location }: DriverWeatherPanelProps) {
  const { t } = useI18n();
  const [routeStart, setRouteStart] = useState<GeocodingResult | null>(null);
  const [routeEnd, setRouteEnd] = useState<GeocodingResult | null>(null);
  const { data: routeAnalysis, isLoading: isRouteLoading } = useRouteWeatherAnalysis(routeStart, routeEnd);

  if (!location) {
    return (
      <div className="glass-surface p-6 sm:p-8 rounded-2xl text-center">
        <Car className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-foreground/40" />
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

  const iceRisk = calculateRoadIceRisk(weatherData);
  const fogWarning = calculateFogWarning(weatherData);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-surface p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <Car className="w-7 h-7 sm:w-10 sm:h-10 text-accent" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{t("driver.title")}</h2>
            <p className="text-xs sm:text-sm text-foreground/60">Driving conditions and safety</p>
          </div>
        </div>

        {iceRisk && (
          <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-destructive/30 bg-destructive/5 mb-3 sm:mb-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <Snowflake className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">{t(iceRisk.messageKey)}</h3>
                <p className="text-sm sm:text-base text-foreground/80">{t(iceRisk.messageKey)}</p>
              </div>
            </div>
          </div>
        )}

        {fogWarning && (
          <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-warning/30 bg-warning/5 mb-3 sm:mb-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                <CloudFog className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">{t(fogWarning.messageKey)}</h3>
                <p className="text-sm sm:text-base text-foreground/80">{t(fogWarning.messageKey)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Gauge className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Tire Pressure</h3>
              <p className="text-sm sm:text-base text-foreground/80">
                Check tire pressure regularly for optimal safety and fuel efficiency.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-surface p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h3 className="text-lg sm:text-xl font-bold">Route Weather Analysis</h3>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <RouteLocationSearch
            label="Start Location"
            onLocationSelect={setRouteStart}
            onClear={() => setRouteStart(null)}
            currentLocation={routeStart}
          />

          <RouteLocationSearch
            label="End Location"
            onLocationSelect={setRouteEnd}
            onClear={() => setRouteEnd(null)}
            currentLocation={routeEnd}
          />

          {isRouteLoading && (
            <div className="text-center py-4 sm:py-6">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-primary animate-spin" />
              <p className="text-sm sm:text-base text-foreground/60">Analyzing route conditions...</p>
            </div>
          )}

          {routeAnalysis && !isRouteLoading && (
            <div
              className={`glass-surface p-4 sm:p-5 rounded-2xl border ${
                routeAnalysis.overallRisk === "danger"
                  ? "border-destructive/30 bg-destructive/5"
                  : routeAnalysis.overallRisk === "caution"
                    ? "border-warning/30 bg-warning/5"
                    : "border-success/30 bg-success/5"
              }`}
            >
              <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">{t(routeAnalysis.summaryKey)}</h4>
              <ul className="space-y-1 sm:space-y-2">
                {routeAnalysis.factors.map((factor, index) => (
                  <li key={index} className="text-xs sm:text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="flex-1">{String(factor)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
