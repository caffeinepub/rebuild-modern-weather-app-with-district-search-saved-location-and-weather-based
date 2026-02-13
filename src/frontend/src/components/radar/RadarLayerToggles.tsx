import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Layers } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';

interface RadarLayerTogglesProps {
  enabledLayers: Set<string>;
  onLayersChange: (layers: Set<string>) => void;
}

const AVAILABLE_LAYERS = [
  'precipitation',
  'storm',
  'snow',
  'wind',
  'temperature',
  'airQuality',
] as const;

export function RadarLayerToggles({ enabledLayers, onLayersChange }: RadarLayerTogglesProps) {
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2 shadow-lg">
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">{t('radar.layers.title')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>{t('radar.layers.title')}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {AVAILABLE_LAYERS.map((layer) => (
            <div key={layer} className="flex items-center justify-between">
              <Label htmlFor={layer} className="cursor-pointer">
                {t(`radar.layers.${layer}` as any)}
              </Label>
              <Switch
                id={layer}
                checked={enabledLayers.has(layer)}
                onCheckedChange={() => toggleLayer(layer)}
              />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
