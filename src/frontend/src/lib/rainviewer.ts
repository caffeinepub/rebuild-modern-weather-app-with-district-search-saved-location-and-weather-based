export interface RadarFrame {
  time: number;
  path: string;
}

export interface RainViewerData {
  host: string;
  frames: RadarFrame[]; // Combined list (past + limited nowcast)
  pastFrames: RadarFrame[]; // Separate past frames
  nowcastFrames: RadarFrame[]; // Separate nowcast (future) frames, limited to +90 minutes
}

/**
 * Validates and normalizes a single radar frame entry
 */
function normalizeFrame(frame: any): RadarFrame | null {
  if (!frame || typeof frame !== 'object') return null;
  if (typeof frame.time !== 'number' || typeof frame.path !== 'string') return null;
  if (!isFinite(frame.time) || frame.time <= 0) return null;
  if (frame.path.trim() === '') return null;
  return { time: frame.time, path: frame.path };
}

/**
 * Validates and normalizes an array of radar frames
 */
function normalizeFrames(frames: any): RadarFrame[] {
  if (!Array.isArray(frames)) return [];
  return frames
    .map(normalizeFrame)
    .filter((frame): frame is RadarFrame => frame !== null);
}

/**
 * Filters nowcast frames to only include those within +90 minutes from current time
 * and ensures they are future-only and sorted by time
 */
function filterNowcastFrames(frames: RadarFrame[]): RadarFrame[] {
  const now = Date.now() / 1000;
  const maxTime = now + (90 * 60); // +90 minutes in seconds
  
  return frames
    .filter(frame => frame.time > now && frame.time <= maxTime) // Future-only and within 90 minutes
    .sort((a, b) => a.time - b.time); // Sort by time ascending
}

/**
 * Parses and normalizes RainViewer data from backend JSON string
 */
export function parseRainViewerData(jsonString: string): RainViewerData {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate and normalize past and nowcast frames
    const pastFrames = normalizeFrames(data.radar?.past).sort((a, b) => a.time - b.time);
    const rawNowcastFrames = normalizeFrames(data.radar?.nowcast);
    
    // Filter nowcast frames to +90 minutes limit, future-only, and sorted
    const nowcastFrames = filterNowcastFrames(rawNowcastFrames);
    
    return {
      host: typeof data.host === 'string' ? data.host : '',
      frames: [...pastFrames, ...nowcastFrames], // Combined timeline
      pastFrames,
      nowcastFrames,
    };
  } catch (error) {
    console.error('Failed to parse RainViewer data:', error);
    return {
      host: '',
      frames: [],
      pastFrames: [],
      nowcastFrames: [],
    };
  }
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
