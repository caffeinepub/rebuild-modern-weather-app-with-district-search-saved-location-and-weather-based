import { Button } from '@/components/ui/button';
import { Cloud, Sprout, Truck, Radio, Waves } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

interface BottomNavProps {
  activeTab: 'weather' | 'farmer' | 'driver' | 'radar' | 'beach';
  onTabChange: (tab: 'weather' | 'farmer' | 'driver' | 'radar' | 'beach') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useI18n();

  return (
    <nav className="glass-surface-strong border-t-2">
      <div className="container mx-auto flex items-center justify-center gap-2 px-2 py-4">
        <Button
          variant={activeTab === 'weather' ? 'default' : 'ghost'}
          size="lg"
          onClick={() => onTabChange('weather')}
          className={`flex-1 max-w-[120px] gap-2 font-semibold transition-all ${
            activeTab === 'weather' 
              ? 'shadow-glow scale-105' 
              : 'hover:bg-accent/30 hover:scale-105 hover:border-primary/30 border-2 border-transparent'
          }`}
        >
          <Cloud className="h-5 w-5" />
          <span className="hidden sm:inline">{t('nav.weather')}</span>
        </Button>
        <Button
          variant={activeTab === 'farmer' ? 'default' : 'ghost'}
          size="lg"
          onClick={() => onTabChange('farmer')}
          className={`flex-1 max-w-[120px] gap-2 font-semibold transition-all ${
            activeTab === 'farmer' 
              ? 'shadow-glow scale-105' 
              : 'hover:bg-accent/30 hover:scale-105 hover:border-primary/30 border-2 border-transparent'
          }`}
        >
          <Sprout className="h-5 w-5" />
          <span className="hidden sm:inline">{t('nav.farmer')}</span>
        </Button>
        <Button
          variant={activeTab === 'driver' ? 'default' : 'ghost'}
          size="lg"
          onClick={() => onTabChange('driver')}
          className={`flex-1 max-w-[120px] gap-2 font-semibold transition-all ${
            activeTab === 'driver' 
              ? 'shadow-glow scale-105' 
              : 'hover:bg-accent/30 hover:scale-105 hover:border-primary/30 border-2 border-transparent'
          }`}
        >
          <Truck className="h-5 w-5" />
          <span className="hidden sm:inline">{t('nav.driver')}</span>
        </Button>
        <Button
          variant={activeTab === 'radar' ? 'default' : 'ghost'}
          size="lg"
          onClick={() => onTabChange('radar')}
          className={`flex-1 max-w-[120px] gap-2 font-semibold transition-all ${
            activeTab === 'radar' 
              ? 'shadow-glow scale-105' 
              : 'hover:bg-accent/30 hover:scale-105 hover:border-primary/30 border-2 border-transparent'
          }`}
        >
          <Radio className="h-5 w-5" />
          <span className="hidden sm:inline">{t('nav.radar')}</span>
        </Button>
        <Button
          variant={activeTab === 'beach' ? 'default' : 'ghost'}
          size="lg"
          onClick={() => onTabChange('beach')}
          className={`flex-1 max-w-[120px] gap-2 font-semibold transition-all ${
            activeTab === 'beach' 
              ? 'shadow-glow scale-105' 
              : 'hover:bg-accent/30 hover:scale-105 hover:border-primary/30 border-2 border-transparent'
          }`}
        >
          <Waves className="h-5 w-5" />
          <span className="hidden sm:inline">{t('nav.beach')}</span>
        </Button>
      </div>
    </nav>
  );
}
