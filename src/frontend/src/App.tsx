import { useEffect, useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { LocationSearch } from './components/LocationSearch';
import { WeatherPanel } from './components/WeatherPanel';
import { BackgroundIllustration } from './components/BackgroundIllustration';
import { usePersistedLocation } from './hooks/usePersistedLocation';
import { useWeather } from './hooks/useWeather';
import { getWeatherTheme } from './lib/weatherTheme';
import { useI18n } from './i18n/useI18n';
import type { SavedLocation } from './hooks/usePersistedLocation';
import { Cloud, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function App() {
  const { location, setLocation, clearLocation } = usePersistedLocation();
  const [activeLocation, setActiveLocation] = useState<SavedLocation | null>(null);
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
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundIllustration theme={currentTheme} />
        
        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Header */}
          <header className="border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Cloud className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">{t('header.title')}</h1>
              </div>
              
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline">{locale === 'tr' ? 'TR' : 'EN'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setLocale('tr')}
                    className={locale === 'tr' ? 'bg-accent' : ''}
                  >
                    {t('language.turkish')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocale('en')}
                    className={locale === 'en' ? 'bg-accent' : ''}
                  >
                    {t('language.english')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto flex-1 px-4 py-8">
            <div className="mx-auto max-w-6xl space-y-6">
              {/* Location Search */}
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                currentLocation={activeLocation}
                onClearLocation={handleClearLocation}
              />

              {/* Weather Display */}
              {activeLocation && (
                <WeatherPanel
                  location={activeLocation}
                  weatherData={weatherData}
                  isLoading={isLoading}
                  error={error}
                />
              )}

              {/* Empty State */}
              {!activeLocation && (
                <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border/40 bg-card/60 backdrop-blur-sm">
                  <div className="text-center">
                    <Cloud className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
                    <h2 className="mb-2 text-xl font-semibold text-foreground">
                      {t('empty.title')}
                    </h2>
                    <p className="text-muted-foreground">
                      {t('empty.description')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} · {t('footer.builtWith')}{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.hostname : 'weather-app'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
