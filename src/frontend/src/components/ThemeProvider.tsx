import { createContext, useContext, type ReactNode } from 'react';
import { isDarkWeatherTheme } from '@/lib/weatherContrast';

type WeatherTheme = 'clear' | 'cloudy' | 'rain' | 'snow';

interface ThemeContextValue {
  theme: WeatherTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  theme: WeatherTheme;
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  const isDark = isDarkWeatherTheme(theme);
  
  return (
    <ThemeContext.Provider value={{ theme }}>
      <div 
        data-weather-theme={theme} 
        className={`transition-colors duration-700 ${isDark ? 'dark' : ''}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
