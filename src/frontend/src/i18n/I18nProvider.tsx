import { createContext, useState, useEffect, ReactNode } from 'react';
import { translations, type Locale, type TranslationKey } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'app-locale';

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'tr' || stored === 'en') {
      return stored;
    }
  } catch (error) {
    console.error('Failed to read locale from localStorage:', error);
  }
  return 'tr'; // Default to Turkish
}

function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    console.error('Failed to store locale in localStorage:', error);
  }
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    storeLocale(newLocale);
  };

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations['tr'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
