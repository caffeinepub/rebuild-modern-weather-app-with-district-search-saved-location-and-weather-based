import { useEffect, useState } from 'react';
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
import { I18nProvider } from './i18n/I18nProvider';
import { usePersistedLocation } from './hooks/usePersistedLocation';
import { useWeather } from './hooks/useWeather';
import { useImminentWeatherAlerts } from './hooks/useImminentWeatherAlerts';
import { getWeatherTheme } from './lib/weatherTheme';
import { useI18n } from './i18n/useI18n';
import type { SavedLocation } from './hooks/usePersistedLocation';
import type { TranslationKey } from './i18n/translations';
import { Cloud, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function AppContent() {
  const { location, setLocation, clearLocation } = usePersistedLocation();
  const [activeLocation, setActiveLocation] = useState<SavedLocation | null>(null);
  const [activeTab, setActiveTab] = useState<'weather' | 'farmer' | 'driver' | 'radar' | 'beach'>('weather');
  const { locale, setLocale, t } = useI18n();

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

  const getEmptyStateKey = (): { title: TranslationKey; description: TranslationKey } => {
    switch (activeTab) {
      case 'farmer':
        return { title: 'farmer.empty.title', description: 'farmer.empty.description' };
      case 'driver':
        return { title: 'driver.empty.title', description: 'driver.empty.description' };
      case 'radar':
        return { title: 'radar.empty.title', description: 'radar.empty.description' };
      case 'beach':
        return { title: 'beach.empty.title', description: 'beach.empty.description' };
      default:
        return { title: 'empty.title', description: 'empty.description' };
    }
  };

  const emptyState = getEmptyStateKey();

  return (
    <ThemeProvider theme={currentTheme}>
      <div className="relative min-h-screen overflow-x-hidden flex flex-col">
        <BackgroundIllustration theme={currentTheme} />
        
        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Header */}
          <header className="glass-surface-strong border-b-2">
            <div className="container mx-auto flex items-center justify-between px-4 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 shadow-glow">
                  <Cloud className="h-9 w-9 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">WeatherVerse</h1>
              </div>
              
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 font-semibold border-2 hover:border-primary/50 hover:bg-primary/5 focus-ring-strong">
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline">{locale === 'tr' ? 'TR' : 'EN'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-surface">
                  <DropdownMenuItem
                    onClick={() => setLocale('tr')}
                    className={`cursor-pointer font-medium ${locale === 'tr' ? 'bg-primary/20 text-primary' : 'hover:bg-accent/50'}`}
                  >
                    {t('language.turkish')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocale('en')}
                    className={`cursor-pointer font-medium ${locale === 'en' ? 'bg-primary/20 text-primary' : 'hover:bg-accent/50'}`}
                  >
                    {t('language.english')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto flex-1 px-4 py-8 pb-24">
            <div className="mx-auto max-w-6xl space-y-6">
              {/* Imminent Weather Alert Banner */}
              {activeAlert && activeLocation && (
                <ImminentWeatherAlertBanner alert={activeAlert} onDismiss={dismiss} />
              )}

              {/* Location Search - hide on radar tab */}
              {activeTab !== 'radar' && (
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  currentLocation={activeLocation}
                  onClearLocation={handleClearLocation}
                />
              )}

              {/* Tab Content */}
              {activeTab === 'radar' ? (
                <RadarScreen
                  location={activeLocation}
                  onLocationSelect={handleLocationSelect}
                  onClearLocation={handleClearLocation}
                />
              ) : activeTab === 'beach' ? (
                <BeachMarineScreen location={activeLocation} />
              ) : activeLocation ? (
                <>
                  {activeTab === 'weather' && (
                    <WeatherPanel
                      location={activeLocation}
                      weatherData={weatherData}
                      isLoading={isLoading}
                      error={error}
                    />
                  )}
                  {activeTab === 'farmer' && (
                    <FarmerGardenWeatherPanel
                      location={activeLocation}
                      weatherData={weatherData}
                      isLoading={isLoading}
                      error={error}
                    />
                  )}
                  {activeTab === 'driver' && (
                    <DriverWeatherPanel
                      location={activeLocation}
                      weatherData={weatherData}
                      isLoading={isLoading}
                      error={error}
                    />
                  )}
                </>
              ) : (
                <div className="flex min-h-[400px] items-center justify-center glass-surface rounded-2xl">
                  <div className="text-center">
                    <div className="mx-auto mb-6 rounded-2xl bg-primary/10 p-6 w-fit">
                      <Cloud className="h-20 w-20 text-primary" />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-foreground">
                      {t(emptyState.title)}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {t(emptyState.description)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="glass-surface-strong border-t-2 mt-auto">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} · {t('footer.builtWith')}{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.hostname : 'weather-app'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline hover:text-accent transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </footer>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-20">
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
