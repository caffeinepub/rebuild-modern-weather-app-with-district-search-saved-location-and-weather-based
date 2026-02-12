import { useState, useEffect } from 'react';

export interface SavedLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

const STORAGE_KEY = 'weather-app-location';

export function usePersistedLocation() {
  const [location, setLocationState] = useState<SavedLocation | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedLocation;
        setLocationState(parsed);
      }
    } catch (error) {
      console.error('Failed to load persisted location:', error);
    }
  }, []);

  const setLocation = (newLocation: SavedLocation) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
      setLocationState(newLocation);
    } catch (error) {
      console.error('Failed to persist location:', error);
    }
  };

  const clearLocation = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setLocationState(null);
    } catch (error) {
      console.error('Failed to clear location:', error);
    }
  };

  return {
    location,
    setLocation,
    clearLocation,
  };
}
