import type { RainViewerData, RadarFrame } from './rainviewer';

const CACHE_KEY = 'rainviewer-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: RainViewerData;
  timestamp: number;
}

/**
 * Validates and normalizes cached RainViewer data to ensure backward compatibility
 */
function normalizeCachedData(data: any): RainViewerData | null {
  if (!data || typeof data !== 'object') return null;
  
  // Validate host
  const host = typeof data.host === 'string' ? data.host : '';
  
  // Validate frames arrays
  const validateFrames = (frames: any): RadarFrame[] => {
    if (!Array.isArray(frames)) return [];
    return frames.filter(
      (frame): frame is RadarFrame =>
        frame &&
        typeof frame === 'object' &&
        typeof frame.time === 'number' &&
        typeof frame.path === 'string'
    );
  };
  
  // Handle old cache format (only had 'frames' field)
  if (data.frames && !data.pastFrames && !data.nowcastFrames) {
    // Old format - treat all frames as past frames
    const frames = validateFrames(data.frames);
    return {
      host,
      frames,
      pastFrames: frames,
      nowcastFrames: [],
    };
  }
  
  // Handle new format with separate past/nowcast
  const pastFrames = validateFrames(data.pastFrames);
  const nowcastFrames = validateFrames(data.nowcastFrames);
  const frames = validateFrames(data.frames);
  
  // If frames is empty but we have past/nowcast, rebuild it
  const combinedFrames = frames.length > 0 ? frames : [...pastFrames, ...nowcastFrames];
  
  return {
    host,
    frames: combinedFrames,
    pastFrames,
    nowcastFrames,
  };
}

export function getRainViewerCache(): RainViewerData | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    
    // Validate timestamp
    if (typeof entry.timestamp !== 'number') {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    const age = Date.now() - entry.timestamp;

    if (age > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Normalize and validate cached data
    const normalizedData = normalizeCachedData(entry.data);
    if (!normalizedData) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return normalizedData;
  } catch {
    // Clear invalid cache on any error
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore storage errors
    }
    return null;
  }
}

export function setRainViewerCache(data: RainViewerData): void {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore storage errors
  }
}
