import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Clock, CloudRain } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';

interface RadarFrameModeToggleProps {
  mode: 'forecast' | 'past';
  onModeChange: (mode: 'forecast' | 'past') => void;
}

export function RadarFrameModeToggle({ mode, onModeChange }: RadarFrameModeToggleProps) {
  const { t } = useI18n();

  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => {
        if (value) onModeChange(value as 'forecast' | 'past');
      }}
      className="justify-start"
    >
      <ToggleGroupItem value="forecast" aria-label={t('radar.mode.forecast')}>
        <CloudRain className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">{t('radar.mode.forecast')}</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="past" aria-label={t('radar.mode.past')}>
        <Clock className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">{t('radar.mode.past')}</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
