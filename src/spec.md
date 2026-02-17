# Specification

## Summary
**Goal:** Add a backend RainViewer proxy with caching so the client can fetch RainViewer metadata and radar tiles without calling RainViewer directly.

**Planned changes:**
- Implement a backend method to fetch RainViewer public JSON metadata, normalize it into a stable structure (host, past frames, nowcast frames, combined frames), validate it, and return safe errors/empty results on invalid payloads.
- Add a 10-minute TTL cache for the RainViewer JSON metadata with lazy refresh (serve cached value immediately; if expired, return last value and trigger a single background refresh; deduplicate concurrent refreshes).
- Implement a backend tile proxy method to fetch RainViewer radar tile PNGs on-demand and return tile bytes to the frontend, guarding invalid z/x/y and enforcing zoom range 5–9.
- Minimize redundant outbound RainViewer requests by avoiding repeated metadata fetches and reducing repeat tile fetches when feasible, including single in-flight refresh behavior.
- Keep (or provide equivalent) backend health check functionality returning status + version + timestamp.

**User-visible outcome:** The app can call backend methods to retrieve RainViewer radar metadata and PNG tiles (with caching and validation) and can still perform a backend health check, without the browser contacting RainViewer directly.
