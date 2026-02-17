import type { RainViewerData, RadarFrame } from './rainviewer';
import { splitFramesByTime } from './rainviewer';

const CACHE_KEY = 'rainviewer-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: RainViewerData;
  timestamp: number;
}

/**
 * Validates that cached data is usable for both forecast and past modes
 */
function isCacheUsableForForecast(data: RainViewerData): boolean {
  // If we have nowcast frames, cache is usable
  if (Array.isArray(data.nowcastFrames) && data.nowcastFrames.length > 0) {
    return true;
  }
  
  // If we have combined frames with future timestamps, we can derive nowcast
  if (Array.isArray(data.frames) && data.frames.length > 0) {
    const now = Date.now() / 1000;
    const hasFutureFrames = data.frames.some(frame => frame.time >= now);
    return hasFutureFrames;
  }
  
  return false;
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
  
  // Get all available frame arrays
  let pastFrames = validateFrames(data.pastFrames);
  let nowcastFrames = validateFrames(data.nowcastFrames);
  let frames = validateFrames(data.frames);
  
  // Handle old cache format (only had 'frames' field) or missing split arrays
  if (frames.length > 0 && (pastFrames.length === 0 && nowcastFrames.length === 0)) {
    // Split combined frames by timestamp
    const split = splitFramesByTime(frames);
    pastFrames = split.pastFrames;
    nowcastFrames = split.nowcastFrames;
  }
  
  // If frames is empty but we have past/nowcast, rebuild it
  if (frames.length === 0 && (pastFrames.length > 0 || nowcastFrames.length > 0)) {
    frames = [...pastFrames, ...nowcastFrames];
  }
  
  // If we still have combined frames but empty nowcast, try splitting again
  if (frames.length > 0 && nowcastFrames.length === 0) {
    const split = splitFramesByTime(frames);
    if (split.nowcastFrames.length > 0) {
      pastFrames = split.pastFrames;
      nowcastFrames = split.nowcastFrames;
    }
  }
  
  return {
    host,
    frames,
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

/**
 * Validates that cached data is structurally valid and usable for forecast mode
 */
export function validateCacheForForecast(data: RainViewerData | null): boolean {
  if (!data) return false;
  
  // Must have host
  if (!data.host) return false;
  
  // Must have valid frame arrays
  if (!Array.isArray(data.frames)) return false;
  if (!Array.isArray(data.pastFrames)) return false;
  if (!Array.isArray(data.nowcastFrames)) return false;
  
  // Check if usable for forecast
  return isCacheUsableForForecast(data);
}
