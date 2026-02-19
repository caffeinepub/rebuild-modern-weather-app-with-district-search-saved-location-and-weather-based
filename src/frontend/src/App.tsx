import { useEffect, useState, useRef } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { LocationSearch } from './components/LocationSearch';
import { WeatherPanel } from './components/WeatherPanel';
import { FarmerGardenWeatherPanel } from './components/FarmerGardenWeatherPanel';
import { DriverWeatherPanel } from './components/DriverWeatherPanel';
import { RadarScreen } from './components/RadarScreen';
import { BeachMarineScreen } from './components/BeachMarineScreen';
import { BottomNav } from './components/BottomNav';
import { BackgroundIllustration } from './components/BackgroundIllustration';
import { InitialRenderErrorBoundary } from './components/InitialRenderErrorBoundary';
import { ImminentWeatherAlertBanner } from './components/ImminentWeatherAlertBanner';
import { LanguageDropdownOverlay } from './components/LanguageDropdownOverlay';
import { I18nProvider } from './i18n/I18nProvider';
import { usePersistedLocation } from './hooks/usePersistedLocation';
import { useWeather } from './hooks/useWeather';
import { useImminentWeatherAlerts } from './hooks/useImminentWeatherAlerts';
import { usePublishWidgetWeather } from './hooks/usePublishWidgetWeather';
import { getWeatherTheme } from './lib/weatherTheme';
import { generatePublishKey, transformToWidgetPayload } from './lib/widgetWeatherPayload';
import { useI18n } from './i18n/useI18n';
import type { SavedLocation } from './hooks/usePersistedLocation';
import { Cloud } from 'lucide-react';

function AppContent() {
  const { location, setLocation, clearLocation } = usePersistedLocation();
  const [activeLocation, setActiveLocation] = useState<SavedLocation | null>(null);
  const [activeTab, setActiveTab] = useState<'weather' | 'farmer' | 'driver' | 'radar' | 'beach'>('weather');
  const { locale, t } = useI18n();
  const lastPublishedDataRef = useRef<string | null>(null);

  // Initialize active location from persisted data
  useEffect(() => {
    if (location) {
      setActiveLocation(location);
    }
  }, [location]);

  // Fetch weather for active location
  const { data: weatherData, isLoading, error } = useWeather(
    activeLocation?.latitude,
    activeLocation?.longitude
  );

  // Imminent weather alerts
  const { activeAlert, dismiss } = useImminentWeatherAlerts(weatherData, activeLocation, locale);

  // Backend publishing hook
  const { publish } = usePublishWidgetWeather();

  // Publish weather data to backend when successfully fetched
  useEffect(() => {
    if (weatherData && activeLocation) {
      try {
        const publishKey = generatePublishKey(activeLocation);
        const dataHash = JSON.stringify({
          temp: weatherData.current.temperature,
          code: weatherData.current.weatherCode,
          time: weatherData.hourly[0]?.timestamp,
        });

        if (lastPublishedDataRef.current !== dataHash) {
          const payload = transformToWidgetPayload(weatherData, activeLocation);
          publish({ key: publishKey, payload });
          lastPublishedDataRef.current = dataHash;
        }
      } catch (err) {
        console.warn('Failed to prepare weather data for publishing:', err);
      }
    }
  }, [weatherData, activeLocation, publish]);

  // Determine current theme based on weather
  const currentTheme = weatherData ? getWeatherTheme(weatherData.current.weatherCode) : 'clear';

  const handleLocationSelect = (newLocation: SavedLocation) => {
    setLocation(newLocation);
    setActiveLocation(newLocation);
  };

  const handleClearLocation = () => {
    clearLocation();
    setActiveLocation(null);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <div className="min-h-screen relative">
        <BackgroundIllustration theme={currentTheme} />
        
        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  WeatherVerse
                </h1>
              </div>
              <LanguageDropdownOverlay />
            </div>
          </header>

          <main className="flex-1 px-4 py-3 sm:px-6 sm:py-4 pb-20 sm:pb-24">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              {activeAlert && (
                <ImminentWeatherAlertBanner
                  alert={activeAlert}
                  onDismiss={dismiss}
                />
              )}

              <LocationSearch
                onLocationSelect={handleLocationSelect}
                currentLocation={activeLocation}
                onClearLocation={handleClearLocation}
              />

              {activeTab === 'weather' && (
                <WeatherPanel
                  weatherData={weatherData}
                  isLoading={isLoading}
                  error={error}
                  location={activeLocation}
                />
              )}

              {activeTab === 'farmer' && (
                <FarmerGardenWeatherPanel
                  weatherData={weatherData}
                  isLoading={isLoading}
                  error={error}
                  location={activeLocation}
                />
              )}

              {activeTab === 'driver' && (
                <DriverWeatherPanel
                  weatherData={weatherData}
                  isLoading={isLoading}
                  error={error}
                  location={activeLocation}
                />
              )}

              {activeTab === 'radar' && (
                <RadarScreen
                  location={activeLocation}
                  weatherData={weatherData || null}
                />
              )}

              {activeTab === 'beach' && (
                <BeachMarineScreen
                  location={activeLocation}
                  weatherData={weatherData}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </div>
          </main>

          <footer className="px-4 py-3 sm:px-6 sm:py-4 mt-auto pb-20 sm:pb-24">
            <div className="max-w-7xl mx-auto text-center">
              <a
                href="https://sites.google.com/view/weatherverse/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-foreground/60 hover:text-primary transition-colors hover:underline"
              >
                Gizlilik Politikası
              </a>
            </div>
          </footer>

          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <InitialRenderErrorBoundary>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </InitialRenderErrorBoundary>
  );
}

export default App;
