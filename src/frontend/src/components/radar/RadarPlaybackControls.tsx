import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import type { RadarFrameMode } from '../RadarScreen';

interface RadarPlaybackControlsProps {
  currentFrameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (index: number) => void;
  frameLabel: string;
  mode: RadarFrameMode;
}

export function RadarPlaybackControls({
  currentFrameIndex,
  totalFrames,
  isPlaying,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onSeek,
  frameLabel,
  mode,
}: RadarPlaybackControlsProps) {
  const { t } = useI18n();
  const isUserInteractingRef = useRef(false);
  const sliderValueRef = useRef(currentFrameIndex);

  // Track when user is actively dragging/interacting with slider
  useEffect(() => {
    sliderValueRef.current = currentFrameIndex;
  }, [currentFrameIndex]);

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    
    // Only trigger seek if this is a user-initiated change
    // (i.e., different from the current programmatic value)
    if (isUserInteractingRef.current || newValue !== sliderValueRef.current) {
      isUserInteractingRef.current = true;
      onSeek(newValue);
    }
  };

  const handleSliderCommit = () => {
    // Reset interaction flag after user releases slider
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 50);
  };

  const modeLabel = mode === 'forecast' ? t('radar.playback.forecast') : t('radar.playback.past');

  // Disable controls when there are insufficient frames (0 or 1)
  const hasInsufficientFrames = totalFrames <= 1;
  const noFramesMessage = totalFrames === 0 
    ? t('radar.playback.noFrames') 
    : totalFrames === 1 
    ? t('radar.playback.singleFrame')
    : '';

  // Only disable play/pause when there are insufficient frames
  const isPlayPauseDisabled = hasInsufficientFrames;

  return (
    <div className="space-y-4">
      {/* Timeline Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{modeLabel}</span>
          <span className="font-medium">{frameLabel || '—'}</span>
        </div>
        <Slider
          value={[currentFrameIndex]}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          max={Math.max(0, totalFrames - 1)}
          step={1}
          disabled={hasInsufficientFrames}
          className="w-full"
        />
      </div>

      {/* Playback Buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={hasInsufficientFrames || currentFrameIndex === 0}
          aria-label="Previous frame"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={isPlaying ? onPause : onPlay}
          disabled={isPlayPauseDisabled}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={hasInsufficientFrames || currentFrameIndex === totalFrames - 1}
          aria-label="Next frame"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Empty State Message */}
      {noFramesMessage && (
        <p className="text-center text-sm text-muted-foreground">{noFramesMessage}</p>
      )}
    </div>
  );
}
