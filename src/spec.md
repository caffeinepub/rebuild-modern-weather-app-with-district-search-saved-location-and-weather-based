# Specification

## Summary
**Goal:** Add 90-minute RainViewer nowcast playback with clear forecast labeling, enforce radar map zoom/tile constraints, and route RainViewer data through a backend cache.

**Planned changes:**
- Combine RainViewer past frames with nowcast frames limited to +90 minutes, and expose a single unified frames list to existing playback/overlay hooks (useRainViewer, useRadarPlayback, useRadarOverlayData) without breaking their APIs.
- Show a visible label “Short-term radar forecast – uncertainty applies” only when viewing forecast/nowcast frames (hidden on past frames), positioned so it does not block map interaction.
- Constrain Leaflet radar map zoom to minZoom=5 and maxZoom=9, and ensure precipitation tiles use RainViewer v2 256px tile format; update tile URL per frame without recreating the map.
- Implement backend caching for RainViewer weather-maps data (TTL 10 minutes) with passive refresh: serve stale cached data immediately when expired (if available) and refresh in the background; fetch fresh data only when no cache exists; retain last good value on refresh failure.
- Update frontend RainViewer fetching to use the backend-cached endpoint instead of calling https://api.rainviewer.com/public/weather-maps.json directly, while keeping the existing useRainViewer hook as the integration point.

**User-visible outcome:** Users can play radar animation through past frames and up to 90 minutes of short-term forecast frames, see a clear uncertainty label when viewing forecast frames, experience consistent zoom limits (5–9), and get reliable radar data loading backed by a 10-minute cache.
