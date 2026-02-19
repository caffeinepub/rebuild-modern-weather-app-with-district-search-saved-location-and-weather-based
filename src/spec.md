# Specification

## Summary
**Goal:** Fix the i18n provider error by wrapping the App component with I18nProvider in main.tsx.

**Planned changes:**
- Import I18nProvider from frontend/src/i18n/I18nProvider.tsx in main.tsx
- Wrap the App component with I18nProvider in the component hierarchy
- Ensure correct provider hierarchy: QueryClientProvider > InternetIdentityProvider > I18nProvider > App

**User-visible outcome:** The application loads without errors and multi-language support (Turkish, English) continues to work correctly.
