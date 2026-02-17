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

  // Update precipitation layer when currentFrame changes
  useEffect(() => {
    if (!mapRef.current || !mapReadyRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Handle precipitation layer separately for reliable frame updates
    if (enabledLayers.has('precipitation') && radarData && currentFrame) {
      const tileUrl = `${radarData.host}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;
      
      if (!layersRef.current.has('precipitation')) {
        // Create new precipitation layer
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
        // Update existing precipitation layer URL to trigger frame change
        const existingLayer = layersRef.current.get('precipitation');
        if (existingLayer) {
          existingLayer.setUrl(tileUrl);
          // Force redraw to ensure visual update
          existingLayer.redraw();
        }
      }
    } else if (layersRef.current.has('precipitation') && (!currentFrame || !radarData || !enabledLayers.has('precipitation'))) {
      // Remove precipitation layer if currentFrame, radarData becomes unavailable, or layer is disabled
      const layer = layersRef.current.get('precipitation');
      if (layer) {
        mapRef.current.removeLayer(layer);
        layersRef.current.delete('precipitation');
      }
    }
  }, [currentFrame, radarData, enabledLayers, mapReadyRef.current]);

  // Update other radar overlays based on enabled layers
  useEffect(() => {
    if (!mapRef.current || !mapReadyRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Remove layers that are no longer enabled (except precipitation, handled separately)
    layersRef.current.forEach((layer, key) => {
      if (key !== 'precipitation' && !enabledLayers.has(key)) {
        if (Array.isArray(layer)) {
          // Handle layer groups (like temperature grid)
          layer.forEach(l => mapRef.current.removeLayer(l));
        } else {
          mapRef.current.removeLayer(layer);
        }
        layersRef.current.delete(key);
      }
    });

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

      // Temperature overlay (grid of circles)
      if (enabledLayers.has('temperature') && overlayData.temperatureGrid) {
        const existingLayers = layersRef.current.get('temperature');
        
        // Remove old temperature layers
        if (existingLayers && Array.isArray(existingLayers)) {
          existingLayers.forEach(l => mapRef.current.removeLayer(l));
        }

        // Create new temperature grid
        const tempLayers: any[] = [];
        overlayData.temperatureGrid.forEach(point => {
          const color = getTemperatureColor(point.temp);
          const fillColor = getTemperatureFillColor(point.temp);
          
          const circle = L.circle([point.lat, point.lon], {
            radius: 15000, // 15km radius for each grid point
            color: color,
            fillColor: fillColor,
            fillOpacity: 0.4,
            weight: 1,
            pane: 'weatherOverlayPane',
          });
          
          circle.bindPopup(`${point.temp.toFixed(1)}°C`);
          circle.addTo(mapRef.current);
          tempLayers.push(circle);
        });

        layersRef.current.set('temperature', tempLayers);
      } else if (layersRef.current.has('temperature')) {
        // Remove temperature layers if disabled
        const existingLayers = layersRef.current.get('temperature');
        if (existingLayers && Array.isArray(existingLayers)) {
          existingLayers.forEach(l => mapRef.current.removeLayer(l));
        }
        layersRef.current.delete('temperature');
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
  }, [enabledLayers, overlayData, location]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
