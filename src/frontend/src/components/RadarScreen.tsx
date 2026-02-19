import { useState } from 'react';
import { useI18n } from '../i18n/useI18n';
import { RadarEmptyState } from './radar/RadarEmptyState';
import { RadarMap } from './radar/RadarMap';
import { RadarPlaybackControls } from './radar/RadarPlaybackControls';
import { RadarLayerToggles } from './radar/RadarLayerToggles';
import { RadarInfoPanel } from './radar/RadarInfoPanel';
import { RadarAlertControls } from './radar/RadarAlertControls';
import { RadarAlertBanner } from './radar/RadarAlertBanner';
import { RadarOverlayStatus } from './radar/RadarOverlayStatus';
import { RadarFrameModeToggle } from './radar/RadarFrameModeToggle';
import { RadarForecastLabel } from './radar/RadarForecastLabel';
import { useRainViewer } from '../hooks/useRainViewer';
import { useRadarPlayback } from '../hooks/useRadarPlayback';
import { useRadarAlerts } from '../hooks/useRadarAlerts';
import { useRadarOverlayData } from '../hooks/useRadarOverlayData';
import type { SavedLocation } from '../hooks/usePersistedLocation';
import type { WeatherData } from '../hooks/useWeather';

interface RadarScreenProps {
  location: SavedLocation | null;
  weatherData: WeatherData | null;
}

export function RadarScreen({ location, weatherData }: RadarScreenProps) {
  const { t } = useI18n();
  const [enabledLayers, setEnabledLayers] = useState<Set<string>>(new Set(['precipitation']));
  const [frameMode, setFrameMode] = useState<'forecast' | 'past'>('forecast');

  // Fetch RainViewer data
  const { data: radarData, isLoading: isRadarLoading, error: radarError } = useRainViewer(location);

  // Fetch overlay data for non-precipitation layers
  const {
    data: overlayData,
    isLoading: isOverlayLoading,
    error: overlayError,
  } = useRadarOverlayData(location);

  // Determine active frames based on mode
  const activeFrames =
    frameMode === 'forecast' && radarData?.nowcastFrames && radarData.nowcastFrames.length > 0
      ? radarData.nowcastFrames
      : radarData?.pastFrames || [];

  // Playback controls
  const {
    currentFrameIndex,
    isPlaying,
    play,
    pause,
    seekToFrame,
    previous,
    next,
  } = useRadarPlayback(activeFrames);

  // Alert system
  const {
    alertSettings,
    updateAlertSettings,
    activeAlert,
    dismissAlert,
  } = useRadarAlerts(location, radarData, activeFrames, currentFrameIndex);

  // Show empty state if no location
  if (!location) {
    return <RadarEmptyState />;
  }

  const currentFrame = activeFrames[currentFrameIndex] || null;
  const showForecastLabel = frameMode === 'forecast' && activeFrames.length > 0;

  const handleLayersChange = (layers: Set<string>) => {
    setEnabledLayers(layers);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Alert Banner */}
      {activeAlert && (
        <RadarAlertBanner alert={activeAlert} onDismiss={dismissAlert} />
      )}

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <RadarFrameModeToggle mode={frameMode} onModeChange={setFrameMode} />
        <div className="flex gap-2 sm:gap-3">
          <RadarLayerToggles
            enabledLayers={enabledLayers}
            onLayersChange={handleLayersChange}
          />
          <RadarAlertControls
            settings={alertSettings}
            onSettingsChange={updateAlertSettings}
          />
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] rounded-lg overflow-hidden glass-surface">
        <RadarMap
          location={location}
          radarData={radarData}
          currentFrame={currentFrame}
          enabledLayers={enabledLayers}
          overlayData={overlayData || null}
        />
        {showForecastLabel && <RadarForecastLabel />}
        <RadarOverlayStatus
          enabledLayers={enabledLayers}
          isLoading={isOverlayLoading}
          isError={!!overlayError}
          overlayData={overlayData}
        />
      </div>

      {/* Playback Controls */}
      <div className="glass-surface rounded-lg p-3 sm:p-4">
        <RadarPlaybackControls
          currentFrameIndex={currentFrameIndex}
          totalFrames={activeFrames.length}
          isPlaying={isPlaying}
          onPlay={play}
          onPause={pause}
          onSeek={seekToFrame}
          onPrevious={previous}
          onNext={next}
          currentFrame={currentFrame}
        />
      </div>

      {/* Info Panel */}
      <div className="glass-surface rounded-lg">
        <RadarInfoPanel
          location={location}
          radarData={radarData}
          playbackFrames={activeFrames}
          currentFrameIndex={currentFrameIndex}
        />
      </div>
    </div>
  );
}
