# Specification

## Summary
**Goal:** Make all app window/panel “glass” surfaces consistently render at 30% opaque / 70% transparent across every tab, including the Weather tab’s Laundry Drying panel.

**Planned changes:**
- Update global `.glass-surface` and `.glass-surface-strong` styles to use a background alpha of `0.3` while preserving existing blur, borders, and shadows.
- Replace the Laundry Drying panel’s custom surface styling with the global glass surface utility so it matches the rest of the app.
- Review major panels across Weather, Farmer, Driver, Radar, Beach, and empty states to ensure they use the global glass utilities (or an equivalent 0.3 alpha surface) without changing layout or functionality.

**User-visible outcome:** All panels/windows throughout the app (including the Laundry Drying panel) have the same 30% opaque glass look, creating consistent transparency in both light and dark modes while background weather images remain unchanged.
