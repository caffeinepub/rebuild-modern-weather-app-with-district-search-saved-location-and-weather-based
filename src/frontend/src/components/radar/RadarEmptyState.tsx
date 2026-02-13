import { Cloud } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';

export function RadarEmptyState() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[600px] items-center justify-center rounded-lg glass-surface">
      <div className="text-center">
        <Cloud className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          {t('radar.empty.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('radar.empty.description')}
        </p>
      </div>
    </div>
  );
}
