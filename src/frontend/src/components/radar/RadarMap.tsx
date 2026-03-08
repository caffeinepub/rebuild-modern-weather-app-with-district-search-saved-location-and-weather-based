import { useEffect, useRef, useState } from "react";
import type { SavedLocation } from "../../hooks/usePersistedLocation";
import type { RadarOverlayData } from "../../hooks/useRadarOverlayData";
import {
  getOverlayDisplayParams,
  getTemperatureColor,
  getTemperatureFillColor,
} from "../../lib/radarOverlays";
import type { RadarFrame, RainViewerData } from "../../lib/rainviewer";

interface RadarMapProps {
  location: SavedLocation;
  currentFrame: RadarFrame | null;
  enabledLayers: Set<string>;
  radarData: RainViewerData | null | undefined;
  overlayData: RadarOverlayData | null;
}

export function RadarMap({
  location,
  currentFrame,
  enabledLayers,
  radarData,
  overlayData,
}: RadarMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<Map<string, any>>(new Map());
  const markersRef = useRef<any[]>([]);

  // A/B double-buffer layers for precipitation
  const layerARef = useRef<any>(null);
  const layerBRef = useRef<any>(null);
  // true => layerA is visible, false => layerB is visible
  const activeBufferRef = useRef<boolean>(true);
  const swapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Replace mapReadyRef (anti-pattern) with proper React state
  const [mapReady, setMapReady] = useState<boolean>(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const L = (window as any).L;
    if (!L) {
      // Load Leaflet dynamically
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
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
      map.createPane("precipitationPane");
      map.getPane("precipitationPane").style.zIndex = 450;

      map.createPane("weatherOverlayPane");
      map.getPane("weatherOverlayPane").style.zIndex = 460;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Add location marker
      const marker = L.marker([location.latitude, location.longitude])
        .addTo(map)
        .bindPopup(location.name);

      markersRef.current.push(marker);

      mapRef.current = map;

      // Set map ready state — this triggers dependent useEffects
      setMapReady(true);
    }

    return () => {
      if (swapTimeoutRef.current) {
        clearTimeout(swapTimeoutRef.current);
        swapTimeoutRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerARef.current = null;
        layerBRef.current = null;
      }
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Update location marker when location changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const L = (window as any).L;
    if (!L) return;

    // Update map view
    mapRef.current.setView([location.latitude, location.longitude], 7);

    // Update marker
    for (const marker of markersRef.current) {
      mapRef.current.removeLayer(marker);
    }
    markersRef.current = [];

    const marker = L.marker([location.latitude, location.longitude])
      .addTo(mapRef.current)
      .bindPopup(location.name);

    markersRef.current.push(marker);

    // Clear all overlay layers when location changes
    for (const layer of layersRef.current.values()) {
      if (Array.isArray(layer)) {
        for (const l of layer) {
          mapRef.current.removeLayer(l);
        }
      } else {
        mapRef.current.removeLayer(layer);
      }
    }
    layersRef.current.clear();

    // Also remove A/B buffer layers
    if (layerARef.current) {
      mapRef.current.removeLayer(layerARef.current);
      layerARef.current = null;
    }
    if (layerBRef.current) {
      mapRef.current.removeLayer(layerBRef.current);
      layerBRef.current = null;
    }
    activeBufferRef.current = true;
  }, [location, mapReady]);

  // Double-buffered precipitation layer update
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const L = (window as any).L;
    if (!L) return;

    if (!enabledLayers.has("precipitation") || !radarData || !currentFrame) {
      // Remove both A/B layers if precipitation is disabled or no data
      if (layerARef.current) {
        mapRef.current.removeLayer(layerARef.current);
        layerARef.current = null;
      }
      if (layerBRef.current) {
        mapRef.current.removeLayer(layerBRef.current);
        layerBRef.current = null;
      }
      activeBufferRef.current = true;
      return;
    }

    const tileUrl = `${radarData.host}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    // Initialize both layers on first use
    if (!layerARef.current) {
      const layerA = L.tileLayer(tileUrl, {
        opacity: 0.6,
        minZoom: 5,
        maxZoom: 9,
        maxNativeZoom: 7,
        pane: "precipitationPane",
      });
      layerA.addTo(mapRef.current);
      layerARef.current = layerA;
      activeBufferRef.current = true;

      // Also create layerB (hidden) for future double-buffering
      const layerB = L.tileLayer(tileUrl, {
        opacity: 0,
        minZoom: 5,
        maxZoom: 9,
        maxNativeZoom: 7,
        pane: "precipitationPane",
      });
      layerB.addTo(mapRef.current);
      layerBRef.current = layerB;
      return;
    }

    // Determine which layer is currently the "back" buffer (loading target)
    const frontLayer = activeBufferRef.current
      ? layerARef.current
      : layerBRef.current;
    const backLayer = activeBufferRef.current
      ? layerBRef.current
      : layerARef.current;

    if (!backLayer) return;

    // Cancel any pending timeout for previous frame
    if (swapTimeoutRef.current) {
      clearTimeout(swapTimeoutRef.current);
      swapTimeoutRef.current = null;
    }

    // Load new URL into the back layer
    backLayer.setUrl(tileUrl);

    // Swap handler: make back visible, hide front
    const doSwap = () => {
      if (swapTimeoutRef.current) {
        clearTimeout(swapTimeoutRef.current);
        swapTimeoutRef.current = null;
      }
      backLayer.setOpacity(0.6);
      if (frontLayer) frontLayer.setOpacity(0);
      // Flip the active buffer flag
      activeBufferRef.current = !activeBufferRef.current;
    };

    // Listen for back layer load completion
    const onLoad = () => {
      backLayer.off("load", onLoad);
      doSwap();
    };
    backLayer.on("load", onLoad);

    // Fallback: swap after 2 seconds even if tiles haven't finished loading
    swapTimeoutRef.current = setTimeout(() => {
      backLayer.off("load", onLoad);
      doSwap();
    }, 2000);
  }, [currentFrame, radarData, enabledLayers, mapReady]);

  // Update other radar overlays based on enabled layers
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const L = (window as any).L;
    if (!L) return;

    // Remove layers that are no longer enabled (except precipitation, handled separately)
    for (const [key, layer] of layersRef.current.entries()) {
      if (key !== "precipitation" && !enabledLayers.has(key)) {
        if (Array.isArray(layer)) {
          for (const l of layer) {
            mapRef.current.removeLayer(l);
          }
        } else {
          mapRef.current.removeLayer(layer);
        }
        layersRef.current.delete(key);
      }
    }

    // Add/update other weather overlays if enabled and data is available
    if (overlayData) {
      // Storm overlay
      if (enabledLayers.has("storm")) {
        const params = getOverlayDisplayParams("storm", overlayData);
        if (params) {
          const existingLayer = layersRef.current.get("storm");
          if (existingLayer) {
            existingLayer.setLatLng([location.latitude, location.longitude]);
            existingLayer.setRadius(params.radius);
            existingLayer.setStyle({
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
            });
          } else {
            const layer = L.circle([location.latitude, location.longitude], {
              radius: params.radius,
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
              pane: "weatherOverlayPane",
            });
            layer.addTo(mapRef.current);
            layersRef.current.set("storm", layer);
          }
        } else if (layersRef.current.has("storm")) {
          mapRef.current.removeLayer(layersRef.current.get("storm"));
          layersRef.current.delete("storm");
        }
      }

      // Snow overlay
      if (enabledLayers.has("snow")) {
        const params = getOverlayDisplayParams("snow", overlayData);
        if (params) {
          const existingLayer = layersRef.current.get("snow");
          if (existingLayer) {
            existingLayer.setLatLng([location.latitude, location.longitude]);
            existingLayer.setRadius(params.radius);
            existingLayer.setStyle({
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
            });
          } else {
            const layer = L.circle([location.latitude, location.longitude], {
              radius: params.radius,
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
              pane: "weatherOverlayPane",
            });
            layer.addTo(mapRef.current);
            layersRef.current.set("snow", layer);
          }
        } else if (layersRef.current.has("snow")) {
          mapRef.current.removeLayer(layersRef.current.get("snow"));
          layersRef.current.delete("snow");
        }
      }

      // Wind overlay (single point)
      if (enabledLayers.has("wind")) {
        const params = getOverlayDisplayParams("wind", overlayData);
        if (params) {
          const existingLayer = layersRef.current.get("wind");
          if (existingLayer) {
            existingLayer.setLatLng([location.latitude, location.longitude]);
            existingLayer.setRadius(params.radius);
            existingLayer.setStyle({
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
            });
          } else {
            const layer = L.circle([location.latitude, location.longitude], {
              radius: params.radius,
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
              pane: "weatherOverlayPane",
            });
            layer.addTo(mapRef.current);
            layersRef.current.set("wind", layer);
          }
        } else if (layersRef.current.has("wind")) {
          mapRef.current.removeLayer(layersRef.current.get("wind"));
          layersRef.current.delete("wind");
        }
      }

      // Temperature overlay (grid of circles)
      if (enabledLayers.has("temperature") && overlayData.temperatureGrid) {
        const existingLayers = layersRef.current.get("temperature");

        // Remove old temperature layers
        if (existingLayers && Array.isArray(existingLayers)) {
          for (const l of existingLayers) {
            mapRef.current.removeLayer(l);
          }
        }

        // Create new temperature grid
        const tempLayers: any[] = [];
        for (const point of overlayData.temperatureGrid) {
          const color = getTemperatureColor(point.temp);
          const fillColor = getTemperatureFillColor(point.temp);

          const circle = L.circle([point.lat, point.lon], {
            radius: 15000,
            color: color,
            fillColor: fillColor,
            fillOpacity: 0.4,
            weight: 1,
            pane: "weatherOverlayPane",
          });

          circle.bindPopup(`${point.temp.toFixed(1)}°C`);
          circle.addTo(mapRef.current);
          tempLayers.push(circle);
        }

        layersRef.current.set("temperature", tempLayers);
      } else if (layersRef.current.has("temperature")) {
        const existingLayers = layersRef.current.get("temperature");
        if (existingLayers && Array.isArray(existingLayers)) {
          for (const l of existingLayers) {
            mapRef.current.removeLayer(l);
          }
        }
        layersRef.current.delete("temperature");
      }

      // Air Quality overlay
      if (enabledLayers.has("airQuality")) {
        const params = getOverlayDisplayParams("airQuality", overlayData);
        if (params) {
          const existingLayer = layersRef.current.get("airQuality");
          if (existingLayer) {
            existingLayer.setLatLng([location.latitude, location.longitude]);
            existingLayer.setRadius(params.radius);
            existingLayer.setStyle({
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
            });
          } else {
            const layer = L.circle([location.latitude, location.longitude], {
              radius: params.radius,
              color: params.color,
              fillColor: params.fillColor,
              fillOpacity: params.opacity,
              pane: "weatherOverlayPane",
            });
            layer.addTo(mapRef.current);
            layersRef.current.set("airQuality", layer);
          }
        } else if (layersRef.current.has("airQuality")) {
          mapRef.current.removeLayer(layersRef.current.get("airQuality"));
          layersRef.current.delete("airQuality");
        }
      }
    }
  }, [enabledLayers, overlayData, location, mapReady]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
