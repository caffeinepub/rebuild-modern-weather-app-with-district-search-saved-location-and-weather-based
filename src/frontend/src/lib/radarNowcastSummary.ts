import type { RainViewerData } from './rainviewer';
import type { SavedLocation } from '../hooks/usePersistedLocation';
import type { TranslationKey } from '../i18n/translations';

interface RadarSummary {
  startTime: string;
  duration: string;
  intensity: TranslationKey;
  direction: string;
}

export function computeRadarSummary(
  radarData: RainViewerData | null | undefined,
  currentFrameIndex: number,
  location: SavedLocation
): RadarSummary {
  if (!radarData || radarData.frames.length === 0) {
    return {
      startTime: '--',
      duration: '--',
      intensity: 'radar.intensity.none',
      direction: '--',
    };
  }

  const currentFrame = radarData.frames[currentFrameIndex];
  const now = Date.now() / 1000;
  
  // Calculate start time
  let startTime = '--';
  if (currentFrame) {
    const minutesUntilStart = Math.round((currentFrame.time - now) / 60);
    if (minutesUntilStart > 0) {
      startTime = `${minutesUntilStart} min`;
    } else if (minutesUntilStart === 0) {
      startTime = 'Now';
    } else {
      startTime = 'Started';
    }
  }

  // Estimate duration (based on number of frames)
  const duration = `~${Math.round(radarData.frames.length * 5)} min`;

  // Estimate intensity (simple heuristic based on frame count)
  let intensity: TranslationKey = 'radar.intensity.none';
  if (radarData.frames.length > 20) {
    intensity = 'radar.intensity.heavy';
  } else if (radarData.frames.length > 10) {
    intensity = 'radar.intensity.moderate';
  } else if (radarData.frames.length > 0) {
    intensity = 'radar.intensity.light';
  }

  // Direction (simplified - would need frame-to-frame analysis)
  const direction = 'NE'; // Placeholder

  return {
    startTime,
    duration,
    intensity,
    direction,
  };
}
