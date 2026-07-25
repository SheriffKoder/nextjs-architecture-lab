/**
 * DropdownContainer Component
 *
 * Purpose: Renders the dropdown in a portal (`document.body`) so it is not clipped
 * by overflow/stacking in tables, and positions it detached below the trigger (with flip + clamp).
 * Used in: DropdownList / EditableCell
 *
 * Flip: when there isn’t room below, the panel is bottom-anchored to the trigger so short
 * menus sit flush above it (do not subtract MENU_MAX_HEIGHT — that shifts small lists up).
 */

'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DropdownContainerProps } from '../../types/dropdown';

/** Viewport / flip math — keep in sync with panel `max-h` below */
const MENU_MAX_HEIGHT = 280;
const GAP_PX = 6;
const VIEWPORT_PAD = 8;

type MenuPosition = {
  top: number | 'auto';
  bottom: number | 'auto';
  left: number;
  width: number;
  maxHeight: number;
};

export function DropdownContainer({
  isOpen,
  onClose,
  children,
  className = '',
  triggerElement,
}: DropdownContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition>({
    top: 0,
    bottom: 'auto',
    left: 0,
    width: 200,
    maxHeight: MENU_MAX_HEIGHT,
  });

  const calculatePosition = useCallback(() => {
    if (!triggerElement) return;

    const rect = triggerElement.getBoundingClientRect();
    const width = Math.max(rect.width, 200);

    let left = rect.left;
    if (left + width > window.innerWidth - VIEWPORT_PAD) {
      left = Math.max(VIEWPORT_PAD, window.innerWidth - width - VIEWPORT_PAD);
    }

    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
    const spaceAbove = rect.top - VIEWPORT_PAD;
    // Prefer below unless the max-height panel clearly won’t fit and above has more room.
    const openAbove =
      spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow;

    if (openAbove) {
      const maxHeight = Math.min(MENU_MAX_HEIGHT, Math.max(0, spaceAbove - GAP_PX));
      setPosition({
        top: 'auto',
        // Anchor menu bottom to trigger top — works for any content height.
        bottom: window.innerHeight - rect.top + GAP_PX,
        left,
        width,
        maxHeight,
      });
      return;
    }

    const maxHeight = Math.min(MENU_MAX_HEIGHT, Math.max(0, spaceBelow - GAP_PX));
    setPosition({
      top: rect.bottom + GAP_PX,
      bottom: 'auto',
      left,
      width,
      maxHeight,
    });
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
      // Let the trigger toggle itself — otherwise mousedown closes and click re-opens.
      if (triggerElement?.contains(target)) return;
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
      className={`fixed z-50 flex min-h-0 flex-col overflow-hidden rounded-md border border-border bg-background/80 p-1.5 shadow-lg backdrop-blur-sm ${className}`}
      style={{
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
      }}
    >
      {children}
    </div>
  );

  return createPortal(dropdownContent, document.body);
}
