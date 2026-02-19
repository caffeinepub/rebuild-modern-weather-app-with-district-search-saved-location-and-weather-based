import { X, CloudRain, Snowflake, CloudLightning, CloudFog } from "lucide-react";
import { useI18n } from "../i18n/useI18n";
import type { ImminentAlert } from "../lib/imminentWeatherAlerts";

interface ImminentWeatherAlertBannerProps {
  alert: ImminentAlert;
  onDismiss: () => void;
}

export function ImminentWeatherAlertBanner({ alert, onDismiss }: ImminentWeatherAlertBannerProps) {
  const { t } = useI18n();

  const getIcon = () => {
    switch (alert.type) {
      case "rain":
        return <CloudRain className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "snow":
        return <Snowflake className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "storm":
        return <CloudLightning className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "fog":
        return <CloudFog className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const getSeverityStyles = () => {
    switch (alert.severity) {
      case "danger":
        return "bg-destructive/10 border-destructive/30 text-destructive";
      case "warning":
        return "bg-warning/10 border-warning/30 text-warning";
      default:
        return "bg-primary/10 border-primary/30 text-primary";
    }
  };

  return (
    <div className={`glass-surface-strong p-3 sm:p-4 rounded-xl border ${getSeverityStyles()}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm sm:text-base mb-1">{t(alert.titleKey)}</h3>
          <p className="text-xs sm:text-sm opacity-90">{t(alert.messageKey)}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg hover:bg-foreground/10 transition-colors focus:outline-none focus:ring-2 focus:ring-current min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
