/**
 * DropdownContainer Component
 *
 * Purpose: Renders the dropdown in a portal (`document.body`) so it is not clipped
 * by overflow/stacking in tables, and positions it detached below the trigger (with flip + clamp).
 * Used in: DropdownList / EditableCell
 */

'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DropdownContainerProps } from '../../types/dropdown';

/** Viewport / flip math — keep in sync with panel `max-h` below */
const MENU_MAX_HEIGHT = 280;
const GAP_PX = 6;
const VIEWPORT_PAD = 8;

export function DropdownContainer({
  isOpen,
  onClose,
  children,
  className = '',
  triggerElement,
}: DropdownContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 200 });

  const calculatePosition = useCallback(() => {
    if (!triggerElement) return;

    const rect = triggerElement.getBoundingClientRect();
    const width = Math.max(rect.width, 200);

    let left = rect.left;
    if (left + width > window.innerWidth - VIEWPORT_PAD) {
      left = Math.max(VIEWPORT_PAD, window.innerWidth - width - VIEWPORT_PAD);
    }

    let top = rect.bottom + GAP_PX;
    if (top + MENU_MAX_HEIGHT > window.innerHeight - VIEWPORT_PAD) {
      top = rect.top - MENU_MAX_HEIGHT - GAP_PX;
    }
    top = Math.max(
      VIEWPORT_PAD,
      Math.min(top, window.innerHeight - MENU_MAX_HEIGHT - VIEWPORT_PAD),
    );

    setPosition({ top, left, width });
  }, [triggerElement]);

  useLayoutEffect(() => {
    if (!isOpen || !triggerElement) return;
    calculatePosition();
  }, [isOpen, triggerElement, calculatePosition]);

  useEffect(() => {
    if (!isOpen || !triggerElement) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      onClose();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleScroll = () => {
      calculatePosition();
    };

    const handleResize = () => {
      calculatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onClose, triggerElement, calculatePosition]);

  if (!isOpen || typeof document === 'undefined') return null;

  const dropdownContent = (
    <div
      ref={containerRef}
      className={`fixed z-50 flex min-h-0 max-h-[min(280px,calc(100dvh-2rem))] flex-col overflow-hidden rounded-md border border-border bg-background/80 p-1.5 shadow-lg backdrop-blur-sm ${className}`}
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
    >
      {children}
    </div>
  );

  return createPortal(dropdownContent, document.body);
}
