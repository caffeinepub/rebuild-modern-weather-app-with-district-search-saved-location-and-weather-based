export interface RadarFrame {
  time: number;
  path: string;
}

export interface RainViewerData {
  host: string;
  frames: RadarFrame[];
}

const API_URL = 'https://api.rainviewer.com/public/weather-maps.json';

export async function fetchRainViewerData(): Promise<RainViewerData> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch RainViewer data');
  }

  const data = await response.json();
  
  // Combine past and nowcast frames
  const pastFrames: RadarFrame[] = data.radar?.past || [];
  const nowcastFrames: RadarFrame[] = data.radar?.nowcast || [];
  
  return {
    host: data.host || '',
    frames: [...pastFrames, ...nowcastFrames],
  };
}
