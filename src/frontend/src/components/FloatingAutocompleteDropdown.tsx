import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

interface FloatingAutocompleteDropdownProps {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement>;
  onClose: () => void;
  children: ReactNode;
}

export function FloatingAutocompleteDropdown({
  isOpen,
  anchorRef,
  onClose,
  children,
}: FloatingAutocompleteDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 0 });
  const [flipUpward, setFlipUpward] = useState(false);

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownMaxHeight = Math.min(320, Math.max(240, viewportHeight * 0.4));

      const shouldFlipUp = spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;

      setFlipUpward(shouldFlipUp);
      setPosition({
        top: shouldFlipUp ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        maxHeight: shouldFlipUp
          ? Math.min(dropdownMaxHeight, spaceAbove - 16)
          : Math.min(dropdownMaxHeight, spaceBelow - 16),
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, anchorRef]);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-50 glass-surface-strong rounded-xl shadow-lg overflow-hidden"
      style={{
        top: flipUpward ? "auto" : `${position.top}px`,
        bottom: flipUpward ? `${window.innerHeight - position.top}px` : "auto",
        left: `${position.left}px`,
        width: `${position.width}px`,
        maxHeight: `${position.maxHeight}px`,
      }}
    >
      <div className="overflow-y-auto max-h-full">
        {children}
      </div>
    </div>,
    document.body
  );
}
