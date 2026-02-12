type WeatherTheme = 'clear' | 'cloudy' | 'rain' | 'snow';

/**
 * Determines whether a given weather theme should be treated as having a dark background.
 * Rain and snow themes typically have darker, more dramatic backgrounds.
 */
export function isDarkWeatherTheme(theme: WeatherTheme): boolean {
  return theme === 'rain' || theme === 'snow';
}
