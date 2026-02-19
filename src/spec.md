# Specification

## Summary
**Goal:** Restore the Radar tab to the bottom navigation between Driver and Beach tabs, displaying weather radar visualization using the location from the main weather section.

**Planned changes:**
- Add Radar tab to BottomNav component between Driver and Beach tabs
- Create RadarScreen component that uses location from main weather location state
- Integrate existing RadarMap component to display cloud and precipitation layers
- Wire up Radar tab in App.tsx to conditionally render RadarScreen
- Add internationalization strings for Radar tab label in Turkish and English

**User-visible outcome:** Users can access the Radar tab from the bottom navigation to view weather radar with cloud and precipitation overlays on a map, centered on the location they entered in the main weather section.
