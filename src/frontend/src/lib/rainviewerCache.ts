import type { RainViewerData } from './rainviewer';

const CACHE_KEY = 'rainviewer-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: RainViewerData;
  timestamp: number;
}

export function getRainViewerCache(): RainViewerData | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    if (age > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return entry.data;
  } catch {
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
