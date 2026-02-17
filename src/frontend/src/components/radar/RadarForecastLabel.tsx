import { AlertCircle } from 'lucide-react';

export function RadarForecastLabel() {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
      <div className="glass-surface px-4 py-2 rounded-lg border border-warning/40 shadow-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-warning">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Short-term radar forecast – uncertainty applies</span>
        </div>
      </div>
    </div>
  );
}
