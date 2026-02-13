import { useState, useEffect, useCallback } from 'react';
import type { SavedLocation } from './usePersistedLocation';
import type { RainViewerData } from '../lib/rainviewer';
import { useSessionState } from './useSessionState';

export interface RadarAlertSettings {
  enabled: boolean;
  radiusKm: number;
}

export interface RadarAlert {
  id: string;
  severity: 'warning' | 'severe';
  titleKey: string;
  messageKey: string;
  timestamp: number;
}

const DEFAULT_SETTINGS: RadarAlertSettings = {
  enabled: false,
  radiusKm: 10,
};

export function useRadarAlerts(
  location: SavedLocation | null,
  radarData: RainViewerData | null | undefined,
  currentFrameIndex: number
) {
  const [alertSettings, setAlertSettings] = useSessionState<RadarAlertSettings>(
    'radar-alert-settings',
    DEFAULT_SETTINGS
  );
  const [activeAlert, setActiveAlert] = useState<RadarAlert | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Check for severe conditions
  useEffect(() => {
    if (!alertSettings.enabled || !location || !radarData) {
      setActiveAlert(null);
      return;
    }

    // Simple heuristic: check if there are many frames (indicating heavy precipitation)
    const hasHeavyPrecipitation = radarData.frames.length > 15;
    
    if (hasHeavyPrecipitation && currentFrameIndex > radarData.frames.length - 5) {
      const alertId = `heavy-precip-${Date.now()}`;
      
      if (!dismissedAlerts.has(alertId)) {
        setActiveAlert({
          id: alertId,
          severity: 'severe',
          titleKey: 'radar.alert.heavy.title',
          messageKey: 'radar.alert.heavy.message',
          timestamp: Date.now(),
        });
      }
    }
  }, [alertSettings, location, radarData, currentFrameIndex, dismissedAlerts]);

  const updateAlertSettings = useCallback((settings: RadarAlertSettings) => {
    setAlertSettings(settings);
  }, [setAlertSettings]);

  const dismissAlert = useCallback(() => {
    if (activeAlert) {
      setDismissedAlerts((prev) => new Set(prev).add(activeAlert.id));
      setActiveAlert(null);
    }
  }, [activeAlert]);

  return {
    alertSettings,
    updateAlertSettings,
    activeAlert,
    dismissAlert,
  };
}
