import { useState, useMemo } from 'react';
import { RadarEmptyState } from './radar/RadarEmptyState';
import { RadarMap } from './radar/RadarMap';
import { RadarPlaybackControls } from './radar/RadarPlaybackControls';
import { RadarLayerToggles } from './radar/RadarLayerToggles';
import { RadarInfoPanel } from './radar/RadarInfoPanel';
import { RadarAlertBanner } from './radar/RadarAlertBanner';
import { RadarAlertControls } from './radar/RadarAlertControls';
import { RadarOverlayStatus } from './radar/RadarOverlayStatus';
import { useRainViewer } from '../hooks/useRainViewer';
import { useRadarPlayback } from '../hooks/useRadarPlayback';
import { useRadarAlerts } from '../hooks/useRadarAlerts';
import { useRadarOverlayData } from '../hooks/useRadarOverlayData';
import { getPreferredPlaybackFrames, getInitialFrameIndex } from '../lib/rainviewer';
import { LocationSearch } from './LocationSearch';
import type { SavedLocation } from '../hooks/usePersistedLocation';
import { useI18n } from '../i18n/useI18n';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RadarScreenProps {
  location: SavedLocation | null;
  onLocationSelect: (location: SavedLocation) => void;
  onClearLocation: () => void;
}

export function RadarScreen({ location, onLocationSelect, onClearLocation }: RadarScreenProps) {
  const { t } = useI18n();
  const [enabledLayers, setEnabledLayers] = useState<Set<string>>(new Set(['precipitation']));

  // Fetch radar data
  const { data: radarData, isLoading, error } = useRainViewer(location);

  // Fetch overlay data for non-precipitation layers
  const { 
    data: overlayData, 
    isLoading: isOverlayLoading, 
    isError: isOverlayError 
  } = useRadarOverlayData(location);

  // Compute preferred playback frames (nowcast-only when available; otherwise past)
  const playbackFrames = useMemo(() => getPreferredPlaybackFrames(radarData), [radarData]);
  
  // Compute initial frame index (earliest upcoming nowcast frame)
  const initialFrameIndex = useMemo(() => getInitialFrameIndex(playbackFrames), [playbackFrames]);

  // Playback state
  const {
    currentFrameIndex,
    isPlaying,
    play,
    pause,
    setFrameIndex,
    getCurrentFrame,
    getFrameLabel,
    isPastFrame,
  } = useRadarPlayback(playbackFrames, initialFrameIndex);

  // Alert system
  const { alertSettings, updateAlertSettings, activeAlert, dismissAlert } = useRadarAlerts(
    location,
    radarData,
    playbackFrames,
    currentFrameIndex
  );

  const currentFrame = getCurrentFrame();

  if (!location) {
    return (
      <div className="space-y-4">
        <LocationSearch
          onLocationSelect={onLocationSelect}
          currentLocation={location}
          onClearLocation={onClearLocation}
        />
        <RadarEmptyState />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center rounded-lg glass-surface">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">{t('radar.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <LocationSearch
          onLocationSelect={onLocationSelect}
          currentLocation={location}
          onClearLocation={onClearLocation}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('radar.error')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Location Search */}
      <LocationSearch
        onLocationSelect={onLocationSelect}
        currentLocation={location}
        onClearLocation={onClearLocation}
      />

      {/* Alert Banner */}
      {activeAlert && (
        <RadarAlertBanner alert={activeAlert} onDismiss={dismissAlert} />
      )}

      {/* Main Radar Container */}
      <div className="relative rounded-lg overflow-hidden glass-surface">
        {/* Map */}
        <div className="relative h-[600px]">
          <RadarMap
            location={location}
            currentFrame={currentFrame}
            enabledLayers={enabledLayers}
            radarData={radarData}
            overlayData={overlayData || null}
          />

          {/* Overlay Status - Non-blocking feedback */}
          <RadarOverlayStatus
            enabledLayers={enabledLayers}
            overlayData={overlayData}
            isLoading={isOverlayLoading}
            isError={isOverlayError}
          />

          {/* Layer Toggles Overlay - Always visible with high z-index */}
          <div className="radar-layer-toggle-container">
            <RadarLayerToggles
              enabledLayers={enabledLayers}
              onLayersChange={setEnabledLayers}
            />
          </div>

          {/* Alert Controls Overlay */}
          <div className="radar-alert-controls-container">
            <RadarAlertControls
              settings={alertSettings}
              onSettingsChange={updateAlertSettings}
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="border-t border-border/40 bg-background/30 backdrop-blur-sm p-4">
          <RadarPlaybackControls
            currentFrameIndex={currentFrameIndex}
            totalFrames={playbackFrames.length}
            isPlaying={isPlaying}
            onPlay={play}
            onPause={pause}
            onFrameChange={setFrameIndex}
            frameLabel={getFrameLabel(currentFrameIndex)}
            isPastFrame={isPastFrame(currentFrameIndex)}
          />
        </div>

        {/* Info Panel */}
        <div className="border-t border-border/40 bg-background/30 backdrop-blur-sm">
          <RadarInfoPanel
            location={location}
            radarData={radarData}
            playbackFrames={playbackFrames}
            currentFrameIndex={currentFrameIndex}
          />
        </div>
      </div>
    </div>
  );
}
