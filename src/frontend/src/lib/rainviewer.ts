export interface RadarFrame {
  time: number;
  path: string;
}

export interface RainViewerData {
  host: string;
  frames: RadarFrame[]; // Combined list for compatibility
  pastFrames: RadarFrame[]; // Separate past frames
  nowcastFrames: RadarFrame[]; // Separate nowcast (future) frames
}

const API_URL = 'https://api.rainviewer.com/public/weather-maps.json';

export async function fetchRainViewerData(): Promise<RainViewerData> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch RainViewer data');
  }

  const data = await response.json();
  
  // Preserve separate past and nowcast frames
  const pastFrames: RadarFrame[] = data.radar?.past || [];
  const nowcastFrames: RadarFrame[] = data.radar?.nowcast || [];
  
  return {
    host: data.host || '',
    frames: [...pastFrames, ...nowcastFrames], // Combined for compatibility
    pastFrames,
    nowcastFrames,
  };
}

/**
 * Helper to choose preferred playback frames.
 * Prefers nowcast (future) frames when available; falls back to past frames.
 */
export function getPreferredPlaybackFrames(radarData: RainViewerData | null | undefined): RadarFrame[] {
  if (!radarData) return [];
  
  // Prefer nowcast frames if available
  if (radarData.nowcastFrames.length > 0) {
    return radarData.nowcastFrames;
  }
  
  // Fallback to past frames
  return radarData.pastFrames;
}

/**
 * Find the initial frame index for playback.
 * Returns the earliest upcoming (nowcast) frame index, or 0 if none available.
 */
export function getInitialFrameIndex(frames: RadarFrame[]): number {
  if (frames.length === 0) return 0;
  
  const now = Date.now() / 1000;
  
  // Find the first frame at or after current time
  const upcomingIndex = frames.findIndex(frame => frame.time >= now);
  
  // If found, return that index; otherwise return 0 (earliest frame)
  return upcomingIndex >= 0 ? upcomingIndex : 0;
}
