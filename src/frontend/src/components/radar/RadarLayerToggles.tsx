import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Check, Layers } from "lucide-react";
import { useI18n } from "../../i18n/useI18n";

interface RadarLayerTogglesProps {
  enabledLayers: Set<string>;
  onLayersChange: (layers: Set<string>) => void;
}

const AVAILABLE_LAYERS = [
  "precipitation",
  "storm",
  "snow",
  "wind",
  "temperature",
  "airQuality",
] as const;

export function RadarLayerToggles({
  enabledLayers,
  onLayersChange,
}: RadarLayerTogglesProps) {
  const { t } = useI18n();

  const toggleLayer = (layer: string) => {
    const newLayers = new Set(enabledLayers);
    if (newLayers.has(layer)) {
      newLayers.delete(layer);
    } else {
      newLayers.add(layer);
    }
    onLayersChange(newLayers);
  };

  return (
    <Sheet modal={false}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2 shadow-lg">
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">{t("radar.layers.title")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] bg-card border-border backdrop-blur-xl"
      >
        <SheetHeader>
          <SheetTitle>{t("radar.layers.title")}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {AVAILABLE_LAYERS.map((layer) => {
            const isActive = enabledLayers.has(layer);
            return (
              <div
                key={layer}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 border-2 border-primary/30"
                    : "bg-transparent border-2 border-transparent hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isActive && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                  <Label
                    htmlFor={layer}
                    className={`cursor-pointer ${isActive ? "font-medium text-primary" : ""}`}
                  >
                    {t(`radar.layers.${layer}` as any)}
                  </Label>
                </div>
                <Switch
                  id={layer}
                  checked={isActive}
                  onCheckedChange={() => toggleLayer(layer)}
                />
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
