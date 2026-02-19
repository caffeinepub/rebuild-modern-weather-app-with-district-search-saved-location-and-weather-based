# Specification

## Summary
**Goal:** Fix the I18n provider error by properly wrapping the App component with I18nProvider in main.tsx.

**Planned changes:**
- Wrap the App component with I18nProvider in frontend/src/main.tsx
- Ensure the I18nProvider is placed correctly within the existing provider hierarchy

**User-visible outcome:** The application loads without the "useI18n must be used within an I18nProvider" error, and all i18n functionality works correctly.
