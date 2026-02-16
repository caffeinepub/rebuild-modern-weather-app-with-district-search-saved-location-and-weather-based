# Specification

## Summary
**Goal:** Default the radar/cloud playback experience to show upcoming-hours (nowcast) frames instead of historical (past) frames, with a safe fallback to past when nowcast is unavailable.

**Planned changes:**
- Update the RainViewer response parsing layer to keep past frames and nowcast (future) frames distinct, rather than returning only a single combined list.
- Change the Radar screen playback to use nowcast frames by default when available, selecting the earliest upcoming frame as the initial frame.
- Ensure the map’s radar tile overlay is driven by the same selected nowcast frame index as the playback controls, and keep existing radar alerts logic working when frame composition changes.

**User-visible outcome:** On the Radar screen, the timeline and animation show upcoming (forecast/nowcast) radar/cloud imagery by default; if no nowcast frames exist, the app automatically falls back to past frames.
