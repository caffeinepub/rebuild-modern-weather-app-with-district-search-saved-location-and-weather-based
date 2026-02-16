import { AlertTriangle, CloudRain, Snowflake, CloudLightning, CloudFog, X } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import type { ImminentAlert } from '../lib/imminentWeatherAlerts';

interface ImminentWeatherAlertBannerProps {
  alert: ImminentAlert;
  onDismiss: () => void;
}

export function ImminentWeatherAlertBanner({ alert, onDismiss }: ImminentWeatherAlertBannerProps) {
  const { t } = useI18n();

  const getIcon = () => {
    switch (alert.type) {
      case 'rain':
        return <CloudRain className="h-5 w-5" />;
      case 'snow':
        return <Snowflake className="h-5 w-5" />;
      case 'storm':
        return <CloudLightning className="h-5 w-5" />;
      case 'fog':
        return <CloudFog className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getBorderColor = () => {
    switch (alert.severity) {
      case 'danger':
        return 'border-destructive/50';
      case 'warning':
        return 'border-warning/50';
      default:
        return 'border-primary/50';
    }
  };

  const getBgColor = () => {
    switch (alert.severity) {
      case 'danger':
        return 'bg-destructive/10';
      case 'warning':
        return 'bg-warning/10';
      default:
        return 'bg-primary/10';
    }
  };

  const getIconBg = () => {
    switch (alert.severity) {
      case 'danger':
        return 'bg-destructive/20';
      case 'warning':
        return 'bg-warning/20';
      default:
        return 'bg-primary/20';
    }
  };

  return (
    <div 
      className={`glass-surface relative border-2 ${getBorderColor()} ${getBgColor()} rounded-lg p-4 shadow-glow-lg animate-in slide-in-from-top-2 duration-300`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${getIconBg()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-bold">
            {t(alert.titleKey)}
          </h3>
          <p className="text-base">
            {t(alert.messageKey)}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="h-8 w-8 rounded-lg hover:bg-background/20 focus:outline-none focus:ring-2 focus:ring-ring transition-colors flex items-center justify-center"
          aria-label={t('alert.imminent.dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
