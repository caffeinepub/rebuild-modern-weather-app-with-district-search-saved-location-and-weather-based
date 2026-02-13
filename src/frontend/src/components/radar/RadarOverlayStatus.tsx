import { useI18n } from '../../i18n/useI18n';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RadarOverlayStatusProps {
  enabledLayers: Set<string>;
  overlayData: any;
  isLoading: boolean;
  isError: boolean;
}

export function RadarOverlayStatus({ enabledLayers, overlayData, isLoading, isError }: RadarOverlayStatusProps) {
  const { t } = useI18n();

  // Don't show anything if only precipitation is enabled (it has its own loading state)
  const nonPrecipLayers = Array.from(enabledLayers).filter(layer => layer !== 'precipitation');
  if (nonPrecipLayers.length === 0) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[470] max-w-md">
        <Alert className="bg-background/30 backdrop-blur-sm border-border/40">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>{t('radar.overlay.loading')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[470] max-w-md">
        <Alert variant="destructive" className="bg-background/30 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('radar.overlay.error')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show no-data messages for specific layers
  if (overlayData) {
    const messages: string[] = [];

    if (enabledLayers.has('storm') && overlayData.stormIntensity === 0) {
      messages.push(t('radar.overlay.noStorm'));
    }

    if (enabledLayers.has('snow') && overlayData.snowfall === 0) {
      messages.push(t('radar.overlay.noSnow'));
    }

    if (enabledLayers.has('airQuality') && !overlayData.airQualityAvailable) {
      messages.push(t('radar.overlay.noAirQuality'));
    }

    if (messages.length > 0) {
      return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[470] max-w-md">
          <Alert className="bg-background/30 backdrop-blur-sm border-border/40">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {messages.map((msg, index) => (
                  <div key={index}>{msg}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return null;
}
