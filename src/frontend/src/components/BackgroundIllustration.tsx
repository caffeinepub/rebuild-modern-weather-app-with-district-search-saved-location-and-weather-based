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

  return (
    <div className="fixed inset-0 z-0">
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url(${currentImage})` }}
      />
      {/* Stable overlay that doesn't fade with image transitions */}
      <div 
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark 
            ? 'bg-gradient-to-b from-black/70 via-black/60 to-black/75' 
            : 'bg-gradient-to-b from-background/60 via-background/40 to-background/80'
        }`}
      />
    </div>
  );
}
