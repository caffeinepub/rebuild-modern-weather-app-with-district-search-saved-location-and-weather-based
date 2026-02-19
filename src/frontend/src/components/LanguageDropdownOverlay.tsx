import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n/useI18n";
import type { Locale } from "../i18n/translations";

export function LanguageDropdownOverlay() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg glass-surface-strong hover:bg-foreground/10 transition-colors min-h-[44px] sm:min-h-[40px]"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5 sm:w-4 sm:h-4" />
        <span className="text-sm sm:text-base font-medium">{locale === "tr" ? "TR" : "EN"}</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[100] glass-surface-strong rounded-xl shadow-lg overflow-hidden w-full sm:w-auto max-w-xs"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            <div className="py-2 sm:py-1">
              <button
                onClick={() => handleLocaleChange("tr")}
                className={`w-full px-4 py-3 sm:px-3 sm:py-2 text-left hover:bg-foreground/10 transition-colors min-h-[44px] sm:min-h-[36px] flex items-center ${
                  locale === "tr" ? "bg-primary/10 text-primary font-medium" : ""
                }`}
              >
                <span className="text-base sm:text-sm">Türkçe</span>
              </button>
              <button
                onClick={() => handleLocaleChange("en")}
                className={`w-full px-4 py-3 sm:px-3 sm:py-2 text-left hover:bg-foreground/10 transition-colors min-h-[44px] sm:min-h-[36px] flex items-center ${
                  locale === "en" ? "bg-primary/10 text-primary font-medium" : ""
                }`}
              >
                <span className="text-base sm:text-sm">English</span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
