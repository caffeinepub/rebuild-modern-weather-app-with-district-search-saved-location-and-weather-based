import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n/useI18n';

interface LanguageDropdownOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function LanguageDropdownOverlay({ isOpen, onClose, triggerRef }: LanguageDropdownOverlayProps) {
  const { locale, setLocale, t } = useI18n();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Update position based on trigger button
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 100; // Approximate height
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      
      // Position below trigger by default, or above if not enough space
      let top = rect.bottom + 8;
      if (spaceBelow < dropdownHeight + 16 && rect.top > dropdownHeight + 16) {
        top = rect.top - dropdownHeight - 8;
      }
      
      // Align to right edge of trigger
      const left = rect.right - 120; // 120px is min-width of dropdown
      
      setPosition({ top, left: Math.max(8, left) });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, triggerRef]);

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const handleLocaleChange = (newLocale: 'tr' | 'en') => {
    setLocale(newLocale);
    onClose();
  };

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[100] min-w-[120px] rounded-md border-2 glass-surface shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        onClick={() => handleLocaleChange('tr')}
        className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors first:rounded-t-md last:rounded-b-md ${
          locale === 'tr' 
            ? 'bg-primary/20 text-primary' 
            : 'hover:bg-accent/50'
        }`}
      >
        {t('language.turkish')}
      </button>
      <button
        onClick={() => handleLocaleChange('en')}
        className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors first:rounded-t-md last:rounded-b-md ${
          locale === 'en' 
            ? 'bg-primary/20 text-primary' 
            : 'hover:bg-accent/50'
        }`}
      >
        {t('language.english')}
      </button>
    </div>,
    document.body
  );
}
