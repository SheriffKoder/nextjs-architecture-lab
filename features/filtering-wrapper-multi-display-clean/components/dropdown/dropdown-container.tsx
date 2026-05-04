/**
 * DropdownContainer Component
 * 
 * Purpose: Provides absolute positioned container for dropdown
 * Used in: DropdownList for proper positioning and z-index management
 * Why: Ensures dropdown appears above other elements without affecting layout
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DropdownContainerProps } from '../../types/dropdown';

export function DropdownContainer({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  triggerElement
}: DropdownContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 200 });

  useEffect(() => {
    if (!isOpen || !triggerElement) return;

    const calculatePosition = () => {
      const rect = triggerElement.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
        width: Math.max(rect.width, 200)
      });
    };

    calculatePosition();

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
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
  }, [isOpen, onClose, triggerElement]);

  if (!isOpen) return null;

  const dropdownContent = (
    <div
      ref={containerRef}
      className={`fixed z-[10] bg-background/80 backdrop-blur-sm border border-border rounded-md shadow-lg ${className}`}
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: '200px',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );

  // Use portal to render outside the table's DOM hierarchy
  return createPortal(dropdownContent, document.body);
}
