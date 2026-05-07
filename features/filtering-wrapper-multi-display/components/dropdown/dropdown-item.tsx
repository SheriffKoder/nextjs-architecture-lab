/**
 * DropdownItem Component
 * 
 * Purpose: Renders individual dropdown option with custom styling
 * Used in: DropdownList for each selectable option
 * Why: Provides consistent option rendering with custom formatter support
 */

'use client';

import React from 'react';
import { DropdownItemProps } from '../../types/dropdown';

export function DropdownItem({ 
  option, 
  isSelected, 
  isHighlighted, 
  onClick, 
  formatter,
  className = '' 
}: DropdownItemProps) {
  const handleClick = () => {
    if (!option.disabled) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const baseClasses = `
    shrink-0 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors duration-150
    ${option.disabled ? 'cursor-not-allowed opacity-50' : ''}
    ${isHighlighted ? 'bg-tertiary/60 text-foreground' : 'hover:bg-muted'}
    ${isSelected ? 'bg-tertiary/60 font-medium text-foreground' : 'text-foreground'}
  `;

  const content = formatter ? formatter(option) : option.label;

  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={option.disabled ? -1 : 0}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
    >
      {content}
    </div>
  );
}
