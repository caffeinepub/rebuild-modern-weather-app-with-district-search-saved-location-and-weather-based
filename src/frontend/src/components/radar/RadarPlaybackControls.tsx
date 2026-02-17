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

  const handlePrevious = () => {
    if (currentFrameIndex > 0) {
      onSeek(currentFrameIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentFrameIndex < totalFrames - 1) {
      onSeek(currentFrameIndex + 1);
    }
  };

  const modeLabel = mode === 'forecast' ? t('radar.playback.forecast') : t('radar.playback.past');

  // Disable controls when there are insufficient frames
  const hasInsufficientFrames = totalFrames <= 1;
  const noFramesMessage = totalFrames === 0 
    ? t('radar.playback.noFrames') 
    : totalFrames === 1 
    ? t('radar.playback.singleFrame')
    : '';

  return (
    <div className="space-y-4">
      {/* Timeline Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {modeLabel}
          </span>
          <span className="font-medium">{frameLabel || noFramesMessage}</span>
        </div>
        <Slider
          value={[currentFrameIndex]}
          min={0}
          max={Math.max(0, totalFrames - 1)}
          step={1}
          onValueChange={handleSliderChange}
          onPointerDown={() => { isUserInteractingRef.current = true; }}
          onPointerUp={handleSliderCommit}
          onKeyDown={() => { isUserInteractingRef.current = true; }}
          onKeyUp={handleSliderCommit}
          disabled={hasInsufficientFrames}
          className="w-full"
        />
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentFrameIndex === 0 || hasInsufficientFrames}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={isPlaying ? onPause : onPlay}
          disabled={hasInsufficientFrames}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentFrameIndex === totalFrames - 1 || hasInsufficientFrames}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
