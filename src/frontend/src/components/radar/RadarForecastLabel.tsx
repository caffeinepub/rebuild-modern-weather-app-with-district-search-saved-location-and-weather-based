import { AlertCircle } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';

export function RadarForecastLabel() {
  const { t } = useI18n();
  
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
      <div className="glass-surface px-4 py-2 rounded-lg border border-warning/40 shadow-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-warning">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{t('radar.forecast.uncertaintyLabel')}</span>
        </div>
      </div>
    </div>
  );
}
