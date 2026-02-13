import type { RadarOverlayData } from '../hooks/useRadarOverlayData';

interface OverlayDisplayParams {
  radius: number;
  color: string;
  fillColor: string;
  opacity: number;
  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
  aqi?: number;
}

export function getOverlayDisplayParams(
  layerType: string,
  data: RadarOverlayData
): OverlayDisplayParams | null {
  switch (layerType) {
    case 'storm':
      if (data.stormIntensity > 0) {
        return {
          radius: 15000 + data.stormIntensity * 2000,
          color: '#ff4444',
          fillColor: '#ff4444',
          opacity: Math.min(0.3 + data.stormIntensity * 0.05, 0.7),
        };
      }
      return null;

    case 'snow':
      if (data.snowfall > 0) {
        return {
          radius: 10000 + data.snowfall * 1000,
          color: '#88ccff',
          fillColor: '#ccf0ff',
          opacity: Math.min(0.3 + data.snowfall * 0.1, 0.6),
        };
      }
      return null;

    case 'wind':
      // Show wind overlay even for low speeds (>1 km/h)
      if (data.windSpeed > 1) {
        return {
          radius: 0,
          color: '#666666',
          fillColor: '#666666',
          opacity: 0.8,
          windSpeed: data.windSpeed,
          windDirection: data.windDirection,
        };
      }
      return null;

    case 'temperature':
      // Always return params for temperature (even if 0°C)
      return {
        radius: 12000,
        color: getTemperatureColor(data.temperature),
        fillColor: getTemperatureFillColor(data.temperature),
        opacity: 0.5,
        temperature: data.temperature,
      };

    case 'airQuality':
      // Only show if air quality data is available
      if (!data.airQualityAvailable || data.airQualityIndex === null) {
        return null;
      }

      // AQI color scale: green (good) -> yellow (moderate) -> red (unhealthy)
      let aqiColor: string;
      let aqiFillColor: string;
      
      if (data.airQualityIndex <= 50) {
        aqiColor = '#00cc00';
        aqiFillColor = '#66ff66';
      } else if (data.airQualityIndex <= 100) {
        aqiColor = '#ffcc00';
        aqiFillColor = '#ffeb99';
      } else if (data.airQualityIndex <= 150) {
        aqiColor = '#ff9900';
        aqiFillColor = '#ffcc66';
      } else {
        aqiColor = '#ff0000';
        aqiFillColor = '#ff6666';
      }

      return {
        radius: 10000,
        color: aqiColor,
        fillColor: aqiFillColor,
        opacity: 0.35,
        aqi: data.airQualityIndex,
      };

    default:
      return null;
  }
}

// Helper function to get temperature border color
export function getTemperatureColor(temp: number): string {
  if (temp < -10) return '#0033cc';
  if (temp < 0) return '#0066ff';
  if (temp < 10) return '#00cc99';
  if (temp < 20) return '#66ff66';
  if (temp < 25) return '#ffcc00';
  if (temp < 30) return '#ff9900';
  return '#ff3300';
}

// Helper function to get temperature fill color
export function getTemperatureFillColor(temp: number): string {
  if (temp < -10) return '#3366ff';
  if (temp < 0) return '#4da6ff';
  if (temp < 10) return '#66ffcc';
  if (temp < 20) return '#99ff99';
  if (temp < 25) return '#ffeb99';
  if (temp < 30) return '#ffcc66';
  return '#ff9966';
}

// Helper function to get intensity value for heatmap points
export function getTemperatureIntensity(temp: number): number {
  // Map temperature to intensity (0-1 scale)
  // Normalize around typical range (-20°C to 40°C)
  const normalized = (temp + 20) / 60;
  return Math.max(0, Math.min(1, normalized));
}
