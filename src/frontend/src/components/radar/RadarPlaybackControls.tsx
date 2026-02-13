import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';

interface RadarPlaybackControlsProps {
  currentFrameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onFrameChange: (index: number) => void;
  frameLabel: string;
  isPastFrame: boolean;
}

export function RadarPlaybackControls({
  currentFrameIndex,
  totalFrames,
  isPlaying,
  onPlay,
  onPause,
  onFrameChange,
  frameLabel,
  isPastFrame,
}: RadarPlaybackControlsProps) {
  const { t } = useI18n();

  const handlePrevious = () => {
    if (currentFrameIndex > 0) {
      onFrameChange(currentFrameIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentFrameIndex < totalFrames - 1) {
      onFrameChange(currentFrameIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {isPastFrame ? t('radar.playback.past') : t('radar.playback.nowcast')}
          </span>
          <span className="font-medium">{frameLabel}</span>
        </div>
        <Slider
          value={[currentFrameIndex]}
          min={0}
          max={Math.max(0, totalFrames - 1)}
          step={1}
          onValueChange={([value]) => onFrameChange(value)}
          className="w-full"
        />
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentFrameIndex === 0}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={isPlaying ? onPause : onPlay}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentFrameIndex === totalFrames - 1}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
