import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import type { RadarAlert } from '../../hooks/useRadarAlerts';

interface RadarAlertBannerProps {
  alert: RadarAlert;
  onDismiss: () => void;
}

export function RadarAlertBanner({ alert, onDismiss }: RadarAlertBannerProps) {
  const { t } = useI18n();

  const getVariant = () => {
    switch (alert.severity) {
      case 'severe':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant()} className="relative">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{t(alert.titleKey as any)}</AlertTitle>
      <AlertDescription>{t(alert.messageKey as any)}</AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
