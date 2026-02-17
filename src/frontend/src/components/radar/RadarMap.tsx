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
        zoom: 7,
        zoomControl: true,
        minZoom: 5,
        maxZoom: 9,
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
    mapRef.current.setView([location.latitude, location.longitude], 7);

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
          minZoom: 5,
          maxZoom: 9,
          maxNativeZoom: 7,
          pane: 'precipitationPane',
        });
        layer.addTo(mapRef.current);
        layersRef.current.set('precipitation', layer);
      } else {
        // Update existing precipitation layer via setUrl
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

      // Wind overlay (single point)
      if (enabledLayers.has('wind')) {
        const params = getOverlayDisplayParams('wind', overlayData);
        if (params) {
          const existingLayer = layersRef.current.get('wind');
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
            layersRef.current.set('wind', layer);
          }
        } else if (layersRef.current.has('wind')) {
          // Remove layer if no wind data
          mapRef.current.removeLayer(layersRef.current.get('wind'));
          layersRef.current.delete('wind');
        }
      }

      // Temperature overlay (grid or single point)
      if (enabledLayers.has('temperature')) {
        const params = getOverlayDisplayParams('temperature', overlayData);
        if (params) {
          // Remove existing temperature layers
          const existingLayers = layersRef.current.get('temperature');
          if (existingLayers) {
            if (Array.isArray(existingLayers)) {
              existingLayers.forEach(l => mapRef.current.removeLayer(l));
            } else {
              mapRef.current.removeLayer(existingLayers);
            }
          }

          // Check if we have a grid or single point
          if (Array.isArray(overlayData.temperature) && overlayData.temperature.length > 1) {
            // Grid of temperature points
            const tempLayers = overlayData.temperature.map(point => {
              const color = getTemperatureColor(point.value);
              const fillColor = getTemperatureFillColor(point.value);
              return L.circle([point.lat, point.lon], {
                radius: 5000,
                color,
                fillColor,
                fillOpacity: 0.4,
                weight: 1,
                pane: 'weatherOverlayPane',
              }).addTo(mapRef.current);
            });
            layersRef.current.set('temperature', tempLayers);
          } else {
            // Single point fallback
            const layer = L.circle([location.latitude, location.longitude], {
              radius: params.radius,
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
              pane: 'weatherOverlayPane',
            });
            layer.addTo(mapRef.current);
            layersRef.current.set('temperature', layer);
          }
        } else if (layersRef.current.has('temperature')) {
          // Remove layer if no temperature data
          const existingLayers = layersRef.current.get('temperature');
          if (Array.isArray(existingLayers)) {
            existingLayers.forEach(l => mapRef.current.removeLayer(l));
          } else {
            mapRef.current.removeLayer(existingLayers);
          }
          layersRef.current.delete('temperature');
        }
      }

      // Air Quality overlay
      if (enabledLayers.has('airQuality')) {
        const params = getOverlayDisplayParams('airQuality', overlayData);
        if (params) {
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
            layersRef.current.set('airQuality', layer);
          }
        } else if (layersRef.current.has('airQuality')) {
          // Remove layer if no AQI data
          mapRef.current.removeLayer(layersRef.current.get('airQuality'));
          layersRef.current.delete('airQuality');
        }
      }
    }
  }, [enabledLayers, currentFrame, radarData, overlayData, location]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}
