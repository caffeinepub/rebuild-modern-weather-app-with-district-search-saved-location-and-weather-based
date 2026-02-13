import { useEffect, useRef } from 'react';
import type { SavedLocation } from '../../hooks/usePersistedLocation';
import type { RainViewerData, RadarFrame } from '../../lib/rainviewer';
import type { RadarOverlayData } from '../../hooks/useRadarOverlayData';
import { getOverlayDisplayParams, getTemperatureColor, getTemperatureFillColor } from '../../lib/radarOverlays';

interface RadarMapProps {
  location: SavedLocation;
  currentFrame: RadarFrame | null;
  enabledLayers: Set<string>;
  radarData: RainViewerData | null | undefined;
  overlayData: RadarOverlayData | null;
}

export function RadarMap({ location, currentFrame, enabledLayers, radarData, overlayData }: RadarMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<Map<string, any>>(new Map());
  const markersRef = useRef<any[]>([]);
  const mapReadyRef = useRef<boolean>(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Use Leaflet for simplicity (Mapbox requires API key)
    const L = (window as any).L;
    if (!L) {
      // Load Leaflet dynamically
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        initMap();
      };
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      const L = (window as any).L;
      const map = L.map(mapContainerRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 8,
        zoomControl: true,
      });

      // Create custom panes for different overlay types
      map.createPane('precipitationPane');
      map.getPane('precipitationPane').style.zIndex = 450;

      map.createPane('weatherOverlayPane');
      map.getPane('weatherOverlayPane').style.zIndex = 460;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add location marker
      const marker = L.marker([location.latitude, location.longitude])
        .addTo(map)
        .bindPopup(location.name);
      
      markersRef.current.push(marker);

      mapRef.current = map;
      
      // Mark map as ready after a short delay to ensure Leaflet is fully initialized
      setTimeout(() => {
        mapReadyRef.current = true;
      }, 100);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapReadyRef.current = false;
      }
    };
  }, [location]);

  // Update location marker when location changes
  useEffect(() => {
    if (!mapRef.current || !mapReadyRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Update map view
    mapRef.current.setView([location.latitude, location.longitude], 8);

    // Update marker
    markersRef.current.forEach(marker => mapRef.current.removeLayer(marker));
    markersRef.current = [];

    const marker = L.marker([location.latitude, location.longitude])
      .addTo(mapRef.current)
      .bindPopup(location.name);
    
    markersRef.current.push(marker);

    // Clear all overlay layers when location changes
    layersRef.current.forEach((layer) => {
      if (Array.isArray(layer)) {
        layer.forEach(l => mapRef.current.removeLayer(l));
      } else {
        mapRef.current.removeLayer(layer);
      }
    });
    layersRef.current.clear();
  }, [location]);

  // Update radar overlays based on enabled layers
  useEffect(() => {
    if (!mapRef.current || !mapReadyRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Remove layers that are no longer enabled
    layersRef.current.forEach((layer, key) => {
      if (!enabledLayers.has(key)) {
        if (Array.isArray(layer)) {
          // Handle layer groups (like temperature grid)
          layer.forEach(l => mapRef.current.removeLayer(l));
        } else {
          mapRef.current.removeLayer(layer);
        }
        layersRef.current.delete(key);
      }
    });

    // Add/update precipitation layer if enabled
    if (enabledLayers.has('precipitation') && radarData && currentFrame) {
      if (!layersRef.current.has('precipitation')) {
        const tileUrl = `${radarData.host}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;
        const layer = L.tileLayer(tileUrl, {
          opacity: 0.6,
          maxNativeZoom: 7,
          maxZoom: 12,
          pane: 'precipitationPane',
        });
        layer.addTo(mapRef.current);
        layersRef.current.set('precipitation', layer);
      } else {
        // Update existing precipitation layer
        const existingLayer = layersRef.current.get('precipitation');
        const tileUrl = `${radarData.host}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;
        existingLayer.setUrl(tileUrl);
      }
    }

    // Add/update other weather overlays if enabled and data is available
    if (overlayData) {
      // Storm overlay
      if (enabledLayers.has('storm')) {
        const params = getOverlayDisplayParams('storm', overlayData);
        if (params) {
          const existingLayer = layersRef.current.get('storm');
          if (existingLayer) {
            // Update existing layer
            existingLayer.setLatLng([location.latitude, location.longitude]);
            existingLayer.setRadius(params.radius);
            existingLayer.setStyle({
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
            });
          } else {
            // Create new layer
            const layer = L.circle([location.latitude, location.longitude], {
              radius: params.radius,
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
              pane: 'weatherOverlayPane',
            });
            layer.addTo(mapRef.current);
            layersRef.current.set('storm', layer);
          }
        } else if (layersRef.current.has('storm')) {
          // Remove layer if no storm data
          mapRef.current.removeLayer(layersRef.current.get('storm'));
          layersRef.current.delete('storm');
        }
      }

      // Snow overlay
      if (enabledLayers.has('snow')) {
        const params = getOverlayDisplayParams('snow', overlayData);
        if (params) {
          const existingLayer = layersRef.current.get('snow');
          if (existingLayer) {
            // Update existing layer
            existingLayer.setLatLng([location.latitude, location.longitude]);
            existingLayer.setRadius(params.radius);
            existingLayer.setStyle({
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
            });
          } else {
            // Create new layer
            const layer = L.circle([location.latitude, location.longitude], {
              radius: params.radius,
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
              pane: 'weatherOverlayPane',
            });
            layer.addTo(mapRef.current);
            layersRef.current.set('snow', layer);
          }
        } else if (layersRef.current.has('snow')) {
          // Remove layer if no snow data
          mapRef.current.removeLayer(layersRef.current.get('snow'));
          layersRef.current.delete('snow');
        }
      }

      // Wind overlay (arrows/vectors)
      if (enabledLayers.has('wind')) {
        const params = getOverlayDisplayParams('wind', overlayData);
        if (params && params.windSpeed !== undefined && params.windSpeed > 1) {
          const existingMarker = layersRef.current.get('wind');
          if (existingMarker) {
            // Update existing marker
            existingMarker.setLatLng([location.latitude, location.longitude]);
            const windIcon = L.divIcon({
              html: `<div style="transform: rotate(${params.windDirection}deg); font-size: 24px;">➤</div>`,
              className: 'wind-arrow-icon',
              iconSize: [30, 30],
            });
            existingMarker.setIcon(windIcon);
            existingMarker.getPopup()?.setContent(`Wind: ${params.windSpeed?.toFixed(1)} km/h`);
          } else {
            // Create new marker
            const windIcon = L.divIcon({
              html: `<div style="transform: rotate(${params.windDirection}deg); font-size: 24px;">➤</div>`,
              className: 'wind-arrow-icon',
              iconSize: [30, 30],
            });
            const marker = L.marker([location.latitude, location.longitude], {
              icon: windIcon,
              pane: 'weatherOverlayPane',
            }).bindPopup(`Wind: ${params.windSpeed?.toFixed(1)} km/h`);
            marker.addTo(mapRef.current);
            layersRef.current.set('wind', marker);
          }
        } else if (layersRef.current.has('wind')) {
          // Remove marker if no wind data
          mapRef.current.removeLayer(layersRef.current.get('wind'));
          layersRef.current.delete('wind');
        }
      }

      // Temperature overlay (heatmap-style with multiple circles)
      if (enabledLayers.has('temperature')) {
        const existingLayers = layersRef.current.get('temperature');
        
        if (overlayData.temperatureGrid && overlayData.temperatureGrid.length > 0) {
          if (existingLayers && Array.isArray(existingLayers)) {
            // Update existing layers
            const gridSize = overlayData.temperatureGrid.length;
            
            // Remove excess layers if grid size decreased
            if (existingLayers.length > gridSize) {
              for (let i = gridSize; i < existingLayers.length; i++) {
                mapRef.current.removeLayer(existingLayers[i]);
              }
              existingLayers.splice(gridSize);
            }
            
            // Update or create layers to match grid
            overlayData.temperatureGrid.forEach((point, index) => {
              const color = getTemperatureColor(point.temp);
              const fillColor = getTemperatureFillColor(point.temp);
              
              if (existingLayers[index]) {
                existingLayers[index].setLatLng([point.lat, point.lon]);
                existingLayers[index].setStyle({
                  color: color,
                  fillColor: fillColor,
                  fillOpacity: 0.5,
                });
                existingLayers[index].getPopup()?.setContent(`${point.temp.toFixed(1)}°C`);
              } else {
                const layer = L.circle([point.lat, point.lon], {
                  radius: 8000,
                  color: color,
                  fillColor: fillColor,
                  fillOpacity: 0.5,
                  weight: 2,
                  pane: 'weatherOverlayPane',
                }).bindPopup(`${point.temp.toFixed(1)}°C`);
                layer.addTo(mapRef.current);
                existingLayers.push(layer);
              }
            });
          } else {
            // Remove old single layer if it exists
            if (existingLayers && !Array.isArray(existingLayers)) {
              mapRef.current.removeLayer(existingLayers);
            }
            
            // Create new layers
            const layers: any[] = [];
            overlayData.temperatureGrid.forEach((point) => {
              const color = getTemperatureColor(point.temp);
              const fillColor = getTemperatureFillColor(point.temp);
              const layer = L.circle([point.lat, point.lon], {
                radius: 8000,
                color: color,
                fillColor: fillColor,
                fillOpacity: 0.5,
                weight: 2,
                pane: 'weatherOverlayPane',
              }).bindPopup(`${point.temp.toFixed(1)}°C`);
              layer.addTo(mapRef.current);
              layers.push(layer);
            });
            layersRef.current.set('temperature', layers);
          }
        } else {
          // Fallback to single circle if no grid data
          const params = getOverlayDisplayParams('temperature', overlayData);
          if (params && params.temperature !== undefined) {
            if (existingLayers && !Array.isArray(existingLayers)) {
              // Update existing single layer
              existingLayers.setLatLng([location.latitude, location.longitude]);
              existingLayers.setStyle({
                color: params.color,
                fillColor: params.fillColor,
                fillOpacity: params.opacity,
              });
              existingLayers.getPopup()?.setContent(`Temperature: ${params.temperature?.toFixed(1)}°C`);
            } else {
              // Remove old grid layers if they exist
              if (existingLayers && Array.isArray(existingLayers)) {
                existingLayers.forEach(l => mapRef.current.removeLayer(l));
              }
              // Create new single layer
              const layer = L.circle([location.latitude, location.longitude], {
                radius: params.radius,
                color: params.color,
                fillColor: params.fillColor,
                fillOpacity: params.opacity,
                weight: 2,
                pane: 'weatherOverlayPane',
              }).bindPopup(`Temperature: ${params.temperature?.toFixed(1)}°C`);
              layer.addTo(mapRef.current);
              layersRef.current.set('temperature', layer);
            }
          }
        }
      }

      // Air quality overlay
      if (enabledLayers.has('airQuality')) {
        const params = getOverlayDisplayParams('airQuality', overlayData);
        if (params && params.aqi !== undefined) {
          const existingLayer = layersRef.current.get('airQuality');
          if (existingLayer) {
            // Update existing layer
            existingLayer.setLatLng([location.latitude, location.longitude]);
            existingLayer.setRadius(params.radius);
            existingLayer.setStyle({
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
            });
            existingLayer.getPopup()?.setContent(`AQI: ${params.aqi?.toFixed(0)}`);
          } else {
            // Create new layer
            const layer = L.circle([location.latitude, location.longitude], {
              radius: params.radius,
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
              weight: 2,
              pane: 'weatherOverlayPane',
            }).bindPopup(`AQI: ${params.aqi?.toFixed(0)}`);
            layer.addTo(mapRef.current);
            layersRef.current.set('airQuality', layer);
          }
        } else if (layersRef.current.has('airQuality')) {
          // Remove layer if no AQI data
          mapRef.current.removeLayer(layersRef.current.get('airQuality'));
          layersRef.current.delete('airQuality');
        }
      }
    }
  }, [location, currentFrame, enabledLayers, radarData, overlayData]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}
