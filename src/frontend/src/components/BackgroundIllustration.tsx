import { useEffect, useState } from 'react';
import { isDarkWeatherTheme } from '@/lib/weatherContrast';

type WeatherTheme = 'clear' | 'cloudy' | 'rain' | 'snow';

interface BackgroundIllustrationProps {
  theme: WeatherTheme;
}

const themeImages: Record<WeatherTheme, string> = {
  clear: '/assets/generated/bg-clear.dim_1600x900.png',
  cloudy: '/assets/generated/bg-cloudy.dim_1600x900.png',
  rain: '/assets/generated/bg-rain.dim_1600x900.png',
  snow: '/assets/generated/bg-snow.dim_1600x900.png',
};

export function BackgroundIllustration({ theme }: BackgroundIllustrationProps) {
  const [currentImage, setCurrentImage] = useState(themeImages[theme]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isDark = isDarkWeatherTheme(theme);

  useEffect(() => {
    const newImage = themeImages[theme];
    if (newImage !== currentImage) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentImage(newImage);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [theme, currentImage]);

  // Note: Background image selection and transition behavior are intentionally unchanged.
  // This component only displays weather-themed backgrounds; UI surface transparency
  // is controlled centrally via .glass-surface utilities in index.css.
  return (
    <div className="fixed inset-0 z-0">
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url(${currentImage})` }}
      />
      {/* Enhanced overlay for better readability */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark 
            ? 'bg-gradient-to-b from-black/30 via-black/20 to-black/40' 
            : 'bg-gradient-to-b from-white/25 via-white/15 to-white/30'
        }`}
      />
    </div>
  );
}
