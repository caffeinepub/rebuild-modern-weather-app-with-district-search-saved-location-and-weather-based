import type { Locale } from '../i18n/translations';

/**
 * Formats a daily forecast date (ISO string) into a localized short format.
 * Returns format like "Mon, Jan 15" (en) or "Pzt, Oca 15" (tr).
 */
export function formatDailyForecastDate(isoDate: string, locale: Locale): string {
  const date = new Date(isoDate);
  
  // Map app locales to Intl locales
  const intlLocale = locale === 'tr' ? 'tr-TR' : 'en-US';
  
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
