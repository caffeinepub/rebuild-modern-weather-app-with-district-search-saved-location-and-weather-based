import type { backendInterface, RainViewerFrames } from '../backend';

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

/**
 * Converts backend RainViewerFrames to frontend RadarFrame format
 */
function convertBackendFrame(frame: RainViewerFrames): RadarFrame {
  return {
    time: Number(frame.timestamp),
    path: frame.path,
  };
}

/**
 * Splits a combined frames array into past and nowcast based on current time
 */
export function splitFramesByTime(frames: RadarFrame[]): {
  pastFrames: RadarFrame[];
  nowcastFrames: RadarFrame[];
} {
  const now = Date.now() / 1000;
  
  const pastFrames: RadarFrame[] = [];
  const nowcastFrames: RadarFrame[] = [];
  
  for (const frame of frames) {
    if (frame.time < now) {
      pastFrames.push(frame);
    } else {
      nowcastFrames.push(frame);
    }
  }
  
  return { pastFrames, nowcastFrames };
}

/**
 * Fetches RainViewer metadata from the backend proxy
 */
export async function fetchRainViewerData(actor: backendInterface): Promise<RainViewerData> {
  const backendData = await actor.fetchAndCacheRainViewerMetadata();
  
  // Convert backend format to frontend format
  const pastFrames = backendData.pastFrames.map(convertBackendFrame);
  const nowcastFrames = backendData.nowcastFrames.map(convertBackendFrame);
  const combinedFrames = backendData.combinedFrames.map(convertBackendFrame);
  
  return {
    host: backendData.host,
    frames: combinedFrames.length > 0 ? combinedFrames : [...pastFrames, ...nowcastFrames],
    pastFrames,
    nowcastFrames,
  };
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
