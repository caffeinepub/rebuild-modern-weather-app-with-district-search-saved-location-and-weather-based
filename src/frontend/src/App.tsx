import { useEffect, useState, useRef } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { LocationSearch } from './components/LocationSearch';
import { WeatherPanel } from './components/WeatherPanel';
import { FarmerGardenWeatherPanel } from './components/FarmerGardenWeatherPanel';
import { DriverWeatherPanel } from './components/DriverWeatherPanel';
import { BeachMarineScreen } from './components/BeachMarineScreen';
import { BottomNav } from './components/BottomNav';
import { BackgroundIllustration } from './components/BackgroundIllustration';
import { InitialRenderErrorBoundary } from './components/InitialRenderErrorBoundary';
import { ImminentWeatherAlertBanner } from './components/ImminentWeatherAlertBanner';
import { LanguageDropdownOverlay } from './components/LanguageDropdownOverlay';
import { usePersistedLocation } from './hooks/usePersistedLocation';
import { useWeather } from './hooks/useWeather';
import { useImminentWeatherAlerts } from './hooks/useImminentWeatherAlerts';
import { usePublishWidgetWeather } from './hooks/usePublishWidgetWeather';
import { getWeatherTheme } from './lib/weatherTheme';
import { generatePublishKey, transformToWidgetPayload } from './lib/widgetWeatherPayload';
import { useI18n } from './i18n/useI18n';
import type { SavedLocation } from './hooks/usePersistedLocation';
import { Cloud, Heart } from 'lucide-react';
import { SiFacebook, SiX, SiInstagram } from 'react-icons/si';

function AppContent() {
  const { location, setLocation, clearLocation } = usePersistedLocation();
  const [activeLocation, setActiveLocation] = useState<SavedLocation | null>(null);
  const [activeTab, setActiveTab] = useState<'weather' | 'farmer' | 'driver' | 'beach'>('weather');
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

          <footer className="px-4 py-4 sm:px-6 sm:py-6 mt-auto pb-20 sm:pb-24">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              <div className="glass-surface p-4 sm:p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <a
                      href="https://www.facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-primary transition-colors"
                      aria-label="Facebook"
                    >
                      <SiFacebook className="w-5 h-5 sm:w-6 sm:h-6" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-primary transition-colors"
                      aria-label="X (Twitter)"
                    >
                      <SiX className="w-5 h-5 sm:w-6 sm:h-6" />
                    </a>
                    <a
                      href="https://www.instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-primary transition-colors"
                      aria-label="Instagram"
                    >
                      <SiInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
                    </a>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/60 text-center sm:text-left">
                    Powered by{" "}
                    <a
                      href="https://open-meteo.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open-Meteo
                    </a>
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs sm:text-sm text-foreground/60">
                  © {new Date().getFullYear()} WeatherVerse. Built with{" "}
                  <Heart className="inline w-3 h-3 sm:w-4 sm:h-4 text-destructive fill-destructive" />{" "}
                  using{" "}
                  <a
                    href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.hostname : "weatherverse-app"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    caffeine.ai
                  </a>
                </p>
              </div>
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
      <AppContent />
    </InitialRenderErrorBoundary>
  );
}

export default App;
