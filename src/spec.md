# Specification

## Summary
**Goal:** Add app-wide bilingual UI (Turkish/English) with Turkish as the default language, including a header language toggle and complete translation coverage across the existing UI.

**Planned changes:**
- Implement a frontend i18n layer with two locales (tr, en) and default to Turkish on first load when no prior preference exists.
- Add a visible language switcher in the main header (near the existing title/icon) to toggle between TR and EN with immediate UI updates (no reload).
- Persist the selected language on the client (e.g., localStorage) and restore it on reload, with fallback to Turkish if missing/invalid.
- Replace existing hardcoded user-facing strings with i18n keys/values across current screens/components, including header/title, empty states, search UI (placeholder/errors/no results), weather panel labels/headings/messages, and localized weather condition descriptions derived from weather codes.

**User-visible outcome:** The app opens in Turkish by default, users can switch between Turkish and English from the header at any time, their choice is remembered after refresh, and all visible UI text (including weather condition descriptions) is translated in both languages.
