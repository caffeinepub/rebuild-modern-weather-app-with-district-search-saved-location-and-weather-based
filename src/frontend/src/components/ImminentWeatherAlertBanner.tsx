import { AlertTriangle, CloudRain, Snowflake, CloudLightning, CloudFog, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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

  const getVariant = () => {
    return alert.severity === 'danger' ? 'destructive' : 'default';
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

  return (
    <Alert 
      variant={getVariant()} 
      className={`glass-surface relative border-3 ${getBorderColor()} shadow-glow-lg animate-in slide-in-from-top-2 duration-300`}
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${
          alert.severity === 'danger' 
            ? 'bg-destructive/20' 
            : alert.severity === 'warning'
            ? 'bg-warning/20'
            : 'bg-primary/20'
        }`}>
          {getIcon()}
        </div>
        <div className="flex-1 space-y-1">
          <AlertTitle className="text-lg font-bold">
            {t(alert.titleKey)}
          </AlertTitle>
          <AlertDescription className="text-base">
            {t(alert.messageKey)}
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="h-8 w-8 rounded-lg hover:bg-background/20 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('alert.imminent.dismiss')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
