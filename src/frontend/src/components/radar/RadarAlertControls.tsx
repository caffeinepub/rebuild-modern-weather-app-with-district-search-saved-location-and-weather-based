import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Bell } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import type { RadarAlertSettings } from '../../hooks/useRadarAlerts';

interface RadarAlertControlsProps {
  settings: RadarAlertSettings;
  onSettingsChange: (settings: RadarAlertSettings) => void;
}

export function RadarAlertControls({ settings, onSettingsChange }: RadarAlertControlsProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2 shadow-lg">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">{t('radar.alerts.title')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>{t('radar.alerts.title')}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="alerts-enabled" className="cursor-pointer">
              {t('radar.alerts.enable')}
            </Label>
            <Switch
              id="alerts-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => onSettingsChange({ ...settings, enabled })}
            />
          </div>

          {/* Radius Selector */}
          {settings.enabled && (
            <div className="space-y-3">
              <Label>{t('radar.alerts.radius')}</Label>
              <div className="space-y-2">
                <Slider
                  value={[settings.radiusKm]}
                  min={5}
                  max={20}
                  step={1}
                  onValueChange={([radiusKm]) => onSettingsChange({ ...settings, radiusKm })}
                />
                <p className="text-sm text-muted-foreground text-center">
                  {settings.radiusKm} km
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
