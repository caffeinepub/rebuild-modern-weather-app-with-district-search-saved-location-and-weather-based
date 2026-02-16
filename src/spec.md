# Specification

## Summary
**Goal:** Expose a stable, URL-based JSON API on the WeatherVerse deployment so Android widgets (and other non-browser clients) can fetch weather data as JSON instead of HTML.

**Planned changes:**
- Add Motoko `http_request` handling for `/api/weather` to return the latest stored weather payload as deterministic JSON with the required keys (`city`, `current`, `daily`, `weekly`), using nulls/empty arrays when data is missing.
- Add a Motoko `http_request` route `/api/health` returning a small JSON health/version-style response with proper `Content-Type` and CORS headers.
- Add Motoko storage and an update method to upsert/publish the latest weather payload into canister state (no external DB; single-actor in `backend/main.mo`).
- Update the React frontend to call the backend publish method whenever fresh weather data is successfully fetched for the selected location, handling publish failures gracefully.

**User-visible outcome:** Visiting an API URL (e.g., `https://weatherverse-gy1.caffeine.xyz/api/weather` and `/api/health`) returns JSON with correct headers, and the JSON stays up-to-date based on what the frontend most recently published.
