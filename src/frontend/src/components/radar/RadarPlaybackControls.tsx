import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useI18n } from '../../i18n/useI18n';
import type { RadarFrame } from '../../lib/rainviewer';

interface RadarPlaybackControlsProps {
  currentFrameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  currentFrame: RadarFrame | null;
}

export function RadarPlaybackControls({
  currentFrameIndex,
  totalFrames,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  onPrevious,
  onNext,
  currentFrame,
}: RadarPlaybackControlsProps) {
  const { t } = useI18n();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (totalFrames === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        {t('radar.playback.noFrames')}
      </div>
    );
  }

  if (totalFrames === 1) {
    return (
      <div className="text-center text-muted-foreground py-4">
        {t('radar.playback.singleFrame')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Slider */}
      <div className="space-y-2">
        <Slider
          value={[currentFrameIndex]}
          onValueChange={([value]) => onSeek(value)}
          max={totalFrames - 1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currentFrameIndex + 1} / {totalFrames}</span>
          {currentFrame && (
            <span>{formatTimestamp(currentFrame.time)}</span>
          )}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={totalFrames <= 1}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        {isPlaying ? (
          <Button
            variant="default"
            size="icon"
            onClick={onPause}
            disabled={totalFrames <= 1}
          >
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={onPlay}
            disabled={totalFrames <= 1}
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={totalFrames <= 1}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
