import { Cloud, Sprout, Truck, Radio, Waves } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

interface BottomNavProps {
  activeTab: 'weather' | 'farmer' | 'driver' | 'radar' | 'beach';
  onTabChange: (tab: 'weather' | 'farmer' | 'driver' | 'radar' | 'beach') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useI18n();

  const buttonClass = (isActive: boolean) => `
    flex-1 max-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg
    font-semibold transition-all text-sm
    ${isActive 
      ? 'bg-primary text-primary-foreground shadow-glow scale-105' 
      : 'bg-transparent text-foreground hover:bg-accent/30 hover:scale-105 hover:border-primary/30 border-2 border-transparent'
    }
  `;

  return (
    <nav className="glass-surface-strong border-t-2">
      <div className="container mx-auto flex items-center justify-center gap-2 px-2 py-4">
        <button
          onClick={() => onTabChange('weather')}
          className={buttonClass(activeTab === 'weather')}
        >
          <Cloud className="h-5 w-5" />
          <span className="hidden sm:inline">{t('nav.weather')}</span>
        </button>
        <button
          onClick={() => onTabChange('farmer')}
          className={buttonClass(activeTab === 'farmer')}
        >
          <Sprout className="h-5 w-5" />
          <span className="hidden sm:inline">{t('nav.farmer')}</span>
        </button>
        <button
          onClick={() => onTabChange('driver')}
          className={buttonClass(activeTab === 'driver')}
        >
          <Truck className="h-5 w-5" />
          <span className="hidden sm:inline">{t('nav.driver')}</span>
        </button>
        <button
          onClick={() => onTabChange('radar')}
          className={buttonClass(activeTab === 'radar')}
        >
          <Radio className="h-5 w-5" />
          <span className="hidden sm:inline">{t('nav.radar')}</span>
        </button>
        <button
          onClick={() => onTabChange('beach')}
          className={buttonClass(activeTab === 'beach')}
        >
          <Waves className="h-5 w-5" />
          <span className="hidden sm:inline">{t('nav.beach')}</span>
        </button>
      </div>
    </nav>
  );
}
