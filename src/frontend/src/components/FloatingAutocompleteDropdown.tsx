import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';

interface FloatingAutocompleteDropdownProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FloatingAutocompleteDropdown({
  anchorRef,
  isOpen,
  onClose,
  children,
  className = '',
}: FloatingAutocompleteDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    openUpward: boolean;
  }>({ top: 0, left: 0, width: 0, maxHeight: 300, openUpward: false });

  // Calculate position relative to anchor
  const updatePosition = () => {
    if (!anchorRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;
    
    // Reserve space for bottom nav (typically 80px) and some padding
    const bottomNavHeight = 80;
    const padding = 16;
    const availableSpaceBelow = spaceBelow - bottomNavHeight - padding;
    const availableSpaceAbove = spaceAbove - padding;

    // Decide whether to open upward or downward
    const openUpward = availableSpaceBelow < 200 && availableSpaceAbove > availableSpaceBelow;
    
    // Calculate max height based on available space
    const maxHeight = openUpward 
      ? Math.min(400, availableSpaceAbove)
      : Math.min(400, availableSpaceBelow);

    setPosition({
      top: openUpward ? anchorRect.top - maxHeight - 8 : anchorRect.bottom + 8,
      left: anchorRect.left,
      width: anchorRect.width,
      maxHeight,
      openUpward,
    });
  };

  // Update position on mount, when opening, and on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleUpdate = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, anchorRef]);

  // Handle outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Use capture phase to ensure we catch the event before other handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        maxHeight: `${position.maxHeight}px`,
        zIndex: 9999,
      }}
      className="animate-in fade-in-0 zoom-in-95"
    >
      <Card className={`glass-surface-strong shadow-xl overflow-hidden ${className}`}>
        <div className="overflow-y-auto" style={{ maxHeight: `${position.maxHeight}px` }}>
          {children}
        </div>
      </Card>
    </div>,
    document.body
  );
}
