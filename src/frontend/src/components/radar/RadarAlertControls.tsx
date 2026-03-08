import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Bell, Check } from "lucide-react";
import { useState } from "react";
import type { RadarAlertSettings } from "../../hooks/useRadarAlerts";
import { useI18n } from "../../i18n/useI18n";

interface RadarAlertControlsProps {
  settings: RadarAlertSettings;
  onSettingsChange: (settings: RadarAlertSettings) => void;
}

export function RadarAlertControls({
  settings,
  onSettingsChange,
}: RadarAlertControlsProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen} modal={false}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2 shadow-lg">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">{t("radar.alerts.title")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] bg-card border-border backdrop-blur-xl"
      >
        <SheetHeader>
          <SheetTitle>{t("radar.alerts.title")}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Enable/Disable */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              settings.enabled
                ? "bg-primary/10 border-2 border-primary/30"
                : "bg-transparent border-2 border-transparent hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {settings.enabled && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
              <Label
                htmlFor="alerts-enabled"
                className={`cursor-pointer ${settings.enabled ? "font-medium text-primary" : ""}`}
              >
                {t("radar.alerts.enable")}
              </Label>
            </div>
            <Switch
              id="alerts-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) =>
                onSettingsChange({ ...settings, enabled })
              }
            />
          </div>

          {/* Radius Selector */}
          {settings.enabled && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border">
              <Label>{t("radar.alerts.radius")}</Label>
              <div className="space-y-2">
                <Slider
                  value={[settings.radiusKm]}
                  min={5}
                  max={20}
                  step={1}
                  onValueChange={([radiusKm]) =>
                    onSettingsChange({ ...settings, radiusKm })
                  }
                />
                <p className="text-sm text-muted-foreground text-center font-medium">
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
