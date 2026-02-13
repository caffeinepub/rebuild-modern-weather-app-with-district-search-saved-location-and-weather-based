import { Clock, Droplets, Navigation, Gauge } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import type { SavedLocation } from '../../hooks/usePersistedLocation';
import type { RainViewerData } from '../../lib/rainviewer';
import { computeRadarSummary } from '../../lib/radarNowcastSummary';

interface RadarInfoPanelProps {
  location: SavedLocation;
  radarData: RainViewerData | null | undefined;
  currentFrameIndex: number;
}

export function RadarInfoPanel({ location, radarData, currentFrameIndex }: RadarInfoPanelProps) {
  const { t } = useI18n();

  const summary = computeRadarSummary(radarData, currentFrameIndex, location);

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Start Time */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{t('radar.info.startTime')}</span>
          </div>
          <p className="text-lg font-semibold">{summary.startTime}</p>
        </div>

        {/* Duration */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>{t('radar.info.duration')}</span>
          </div>
          <p className="text-lg font-semibold">{summary.duration}</p>
        </div>

        {/* Intensity */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="h-4 w-4" />
            <span>{t('radar.info.intensity')}</span>
          </div>
          <p className="text-lg font-semibold">{t(summary.intensity as any)}</p>
        </div>

        {/* Direction */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation className="h-4 w-4" />
            <span>{t('radar.info.direction')}</span>
          </div>
          <p className="text-lg font-semibold">{summary.direction}</p>
        </div>
      </div>
    </div>
  );
}
