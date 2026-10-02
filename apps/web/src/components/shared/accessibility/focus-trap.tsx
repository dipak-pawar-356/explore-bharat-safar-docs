'use client';

// Explore Bharat Safar — Accessible Focus Trap Utility
// WCAG 2.2 AA Success Criterion 2.1.2 (No Keyboard Trap)

import * as React from 'react';

export interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  isActive?: boolean;
  onEscape?: () => void;
  className?: string;
}

export function FocusTrap({
  children,
  active = true,
  isActive,
  onEscape,
  className,
}: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isTrapActive = isActive !== undefined ? isActive : active;

  React.useEffect(() => {
    if (!isTrapActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (firstElement && !container.contains(document.activeElement)) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isTrapActive, onEscape]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
