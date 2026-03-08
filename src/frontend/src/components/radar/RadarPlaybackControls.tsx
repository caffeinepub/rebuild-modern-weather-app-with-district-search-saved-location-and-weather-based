import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { PlaybackSpeed } from "../../hooks/useRadarPlayback";
import { useI18n } from "../../i18n/useI18n";
import type { RadarFrame } from "../../lib/rainviewer";

interface RadarPlaybackControlsProps {
  currentFrameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  currentFrame: RadarFrame | null;
  isLoading?: boolean;
}

export function RadarPlaybackControls({
  currentFrameIndex,
  totalFrames,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onSeek,
  onPrevious,
  onNext,
  onSpeedChange,
  currentFrame,
  isLoading = false,
}: RadarPlaybackControlsProps) {
  const { t } = useI18n();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Show skeleton loading state when loading and no frames yet
  if (totalFrames === 0 && isLoading) {
    return (
      <div className="space-y-4" data-ocid="radar.playback.loading_state">
        {/* Timeline skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        {/* Controls skeleton */}
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
        {/* Speed skeleton */}
        <div className="flex items-center justify-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-36 rounded-md" />
        </div>
      </div>
    );
  }

  if (totalFrames === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        {t("radar.playback.noFrames")}
      </div>
    );
  }

  if (totalFrames === 1) {
    return (
      <div className="text-center text-muted-foreground py-4">
        {t("radar.playback.singleFrame")}
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
          <span>
            {currentFrameIndex + 1} / {totalFrames}
          </span>
          {currentFrame && <span>{formatTimestamp(currentFrame.time)}</span>}
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
            data-ocid="radar.playback.button"
          >
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={onPlay}
            disabled={totalFrames <= 1}
            data-ocid="radar.playback.button"
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

      {/* Speed Control */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs text-muted-foreground">
          {t("radar.speed.label")}
        </span>
        <ToggleGroup
          type="single"
          value={speed}
          onValueChange={(value) => {
            if (value) onSpeedChange(value as PlaybackSpeed);
          }}
          className="gap-1"
        >
          <ToggleGroupItem
            value="slow"
            aria-label={t("radar.speed.slow")}
            size="sm"
          >
            {t("radar.speed.slow")}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="normal"
            aria-label={t("radar.speed.normal")}
            size="sm"
          >
            {t("radar.speed.normal")}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="fast"
            aria-label={t("radar.speed.fast")}
            size="sm"
          >
            {t("radar.speed.fast")}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
