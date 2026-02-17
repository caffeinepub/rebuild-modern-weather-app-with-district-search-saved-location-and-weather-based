# Specification

## Summary
**Goal:** Fix Radar “Forecast” mode so it plays a real RainViewer nowcast animation for the next +90 minutes, starts automatically when frames exist, and stays up to date via refreshed backend caching.

**Planned changes:**
- Update the Radar Forecast playback logic to animate through RainViewer-provided future nowcast frames (up to +90 minutes) so the precipitation overlay advances frame-by-frame on the map.
- Start Forecast playback automatically when entering Forecast mode if there are at least 2 nowcast frames; ensure user Pause does not immediately auto-resume unless the mode is switched away and back (or frames re-initialize).
- Ensure switching between Past and Forecast stops playback cleanly without errors and allows playback again when returning to Forecast.
- Fix backend RainViewer cache behavior to refresh from the RainViewer API once TTL has expired, falling back to the last cached value on refresh failure (or empty string if none).
- Move the Forecast uncertainty banner text into the existing i18n system with English and Turkish translations, removing hardcoded UI strings.

**User-visible outcome:** In Radar Forecast mode, users see an automatically playing, smoothly advancing nowcast precipitation animation for the next 90 minutes when available, with correct messaging and up-to-date frames.
