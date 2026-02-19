import { Cloud, Sprout, Car, Waves, Radar } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

interface BottomNavProps {
  activeTab: 'weather' | 'farmer' | 'driver' | 'radar' | 'beach';
  onTabChange: (tab: 'weather' | 'farmer' | 'driver' | 'radar' | 'beach') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useI18n();

  const tabs = [
    { id: 'weather' as const, icon: Cloud, label: t('nav.weather') },
    { id: 'farmer' as const, icon: Sprout, label: t('nav.farmer') },
    { id: 'driver' as const, icon: Car, label: t('nav.driver') },
    { id: 'radar' as const, icon: Radar, label: t('nav.radar') },
    { id: 'beach' as const, icon: Waves, label: t('nav.beach') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-surface-strong border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around h-16 sm:h-14">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] ${
                  isActive
                    ? 'text-primary scale-110 shadow-glow'
                    : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                <Icon className={`w-6 h-6 sm:w-5 sm:h-5 ${isActive ? 'drop-shadow-glow' : ''}`} />
                <span className={`text-xs sm:text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
