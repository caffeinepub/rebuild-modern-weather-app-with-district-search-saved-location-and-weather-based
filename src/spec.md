# Specification

## Summary
**Goal:** Rebrand the app as “WeatherVerse” and add imminent (next ~1 hour) in-app weather alert banners, with an optional Android WebView bridge call for native notifications.

**Planned changes:**
- Update branding so “WeatherVerse” appears consistently (HTML document title and in-app header title) across English and Turkish locales.
- Add frontend-only detection of imminent rain, snow, storm/thunderstorm, and fog from the existing forecast (`useWeather` / Open-Meteo-derived `weatherData`) and display a dismissible in-app alert banner when triggered.
- Persist alert dismissal state (sessionStorage/localStorage) to avoid immediate reappearance for the same alert unless the event changes or enough time has passed.
- Add an optional Android WebView bridge integration that safely calls `window.Android.showNotification` (if present) when a newly-triggered imminent alert occurs, with suppression/cooldown to prevent duplicate calls and TypeScript-safe window typing.
- Apply a cohesive, modern WeatherVerse visual theme (colors/typography/component styling) consistent with existing Tailwind + shadcn glass-surface styling, including the new alert banner and any new alert/bridge-related UI.

**User-visible outcome:** The app consistently shows the “WeatherVerse” name, warns users in-app when rain/snow/storm/fog is expected within about the next hour for the selected location (in EN/TR), and can optionally trigger an Android-native notification via a WebView bridge when available.
