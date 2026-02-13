import { useEffect, useState, useRef } from 'react';
import type { WeatherData } from './useWeather';
import type { SavedLocation } from './usePersistedLocation';
import type { Locale } from '../i18n/translations';
import { evaluateImminentWeatherAlerts, type ImminentAlert } from '../lib/imminentWeatherAlerts';

const DISMISS_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
const ANDROID_BRIDGE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

interface DismissState {
  key: string;
  timestamp: number;
}

interface AndroidBridgeState {
  key: string;
  timestamp: number;
}

/**
 * Hook that manages imminent weather alerts with dismissal persistence and optional Android WebView bridge notifications.
 */
export function useImminentWeatherAlerts(
  weatherData: WeatherData | undefined,
  activeLocation: SavedLocation | null,
  locale: Locale
) {
  const [activeAlert, setActiveAlert] = useState<ImminentAlert | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const previousAlertKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!weatherData || !activeLocation) {
      setActiveAlert(null);
      setIsDismissed(false);
      return;
    }

    const alert = evaluateImminentWeatherAlerts(weatherData);

    if (!alert) {
      setActiveAlert(null);
      setIsDismissed(false);
      previousAlertKeyRef.current = null;
      return;
    }

    // Check if this alert was dismissed recently
    const dismissKey = `imminent-alert-dismiss-${alert.key}`;
    const dismissStateStr = sessionStorage.getItem(dismissKey);
    if (dismissStateStr) {
      try {
        const dismissState: DismissState = JSON.parse(dismissStateStr);
        const timeSinceDismiss = Date.now() - dismissState.timestamp;
        if (dismissState.key === alert.key && timeSinceDismiss < DISMISS_COOLDOWN_MS) {
          setActiveAlert(null);
          setIsDismissed(true);
          return;
        }
      } catch (e) {
        // Invalid state, continue
      }
    }

    setActiveAlert(alert);
    setIsDismissed(false);

    // Check if this is a new alert (different from previous)
    const isNewAlert = previousAlertKeyRef.current !== alert.key;
    previousAlertKeyRef.current = alert.key;

    // Call Android bridge if available and this is a new alert
    if (isNewAlert && typeof window !== 'undefined' && window.Android?.showNotification) {
      // Check Android bridge cooldown
      const androidBridgeKey = `imminent-alert-android-${alert.key}`;
      const androidBridgeStateStr = sessionStorage.getItem(androidBridgeKey);
      let shouldCallBridge = true;

      if (androidBridgeStateStr) {
        try {
          const androidBridgeState: AndroidBridgeState = JSON.parse(androidBridgeStateStr);
          const timeSinceLastCall = Date.now() - androidBridgeState.timestamp;
          if (androidBridgeState.key === alert.key && timeSinceLastCall < ANDROID_BRIDGE_COOLDOWN_MS) {
            shouldCallBridge = false;
          }
        } catch (e) {
          // Invalid state, continue
        }
      }

      if (shouldCallBridge) {
        try {
          // Get localized title and message (simplified - in production you'd use the translation function)
          const title = getAlertTitle(alert.type, locale);
          const message = getAlertMessage(alert.type, locale);
          
          window.Android.showNotification(title, message, alert.type);

          // Store Android bridge call state
          const androidBridgeState: AndroidBridgeState = {
            key: alert.key,
            timestamp: Date.now(),
          };
          sessionStorage.setItem(androidBridgeKey, JSON.stringify(androidBridgeState));
        } catch (error) {
          console.error('Failed to call Android bridge:', error);
        }
      }
    }
  }, [weatherData, activeLocation, locale]);

  const dismiss = () => {
    if (!activeAlert) return;

    const dismissKey = `imminent-alert-dismiss-${activeAlert.key}`;
    const dismissState: DismissState = {
      key: activeAlert.key,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(dismissKey, JSON.stringify(dismissState));

    setActiveAlert(null);
    setIsDismissed(true);
  };

  return {
    activeAlert,
    isDismissed,
    dismiss,
  };
}

// Helper functions for Android bridge (simplified localization)
function getAlertTitle(type: string, locale: Locale): string {
  const titles: Record<string, Record<Locale, string>> = {
    rain: { tr: 'Yağmur Uyarısı', en: 'Rain Alert' },
    snow: { tr: 'Kar Uyarısı', en: 'Snow Alert' },
    storm: { tr: 'Fırtına Uyarısı', en: 'Storm Alert' },
    fog: { tr: 'Sis Uyarısı', en: 'Fog Alert' },
  };
  return titles[type]?.[locale] || 'Weather Alert';
}

function getAlertMessage(type: string, locale: Locale): string {
  const messages: Record<string, Record<Locale, string>> = {
    rain: { 
      tr: '1 saat içinde yağmur başlayacak. Şemsiyenizi almayı unutmayın!', 
      en: 'Rain expected within 1 hour. Don\'t forget your umbrella!' 
    },
    snow: { 
      tr: '1 saat içinde kar yağışı başlayacak. Dikkatli olun!', 
      en: 'Snow expected within 1 hour. Be careful!' 
    },
    storm: { 
      tr: '1 saat içinde fırtına başlayacak. Güvenli bir yerde kalın!', 
      en: 'Storm expected within 1 hour. Stay in a safe place!' 
    },
    fog: { 
      tr: '1 saat içinde sis etkili olacak. Dikkatli sürün!', 
      en: 'Fog expected within 1 hour. Drive carefully!' 
    },
  };
  return messages[type]?.[locale] || 'Weather event expected within 1 hour.';
}
