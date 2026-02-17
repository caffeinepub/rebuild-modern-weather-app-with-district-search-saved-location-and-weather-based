import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CloudRain, History } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import type { RadarFrameMode } from '../RadarScreen';

interface RadarFrameModeToggleProps {
  mode: RadarFrameMode;
  onModeChange: (mode: RadarFrameMode) => void;
}

export function RadarFrameModeToggle({ mode, onModeChange }: RadarFrameModeToggleProps) {
  const { t } = useI18n();

  return (
    <div className="flex justify-center">
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(value) => {
          if (value) onModeChange(value as RadarFrameMode);
        }}
        className="glass-surface inline-flex rounded-lg p-1"
      >
        <ToggleGroupItem
          value="forecast"
          aria-label={t('radar.mode.forecast')}
          className="flex items-center gap-2 px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <CloudRain className="h-4 w-4" />
          <span className="font-medium">{t('radar.mode.forecast')}</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="past"
          aria-label={t('radar.mode.past')}
          className="flex items-center gap-2 px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <History className="h-4 w-4" />
          <span className="font-medium">{t('radar.mode.past')}</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
