/**
 * DropdownList Component
 * 
 * Purpose: Renders scrollable list of dropdown options
 * Used in: DropdownContainer for option selection
 * Why: Provides keyboard navigation and custom option rendering
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DropdownListProps } from '../../types/dropdown';
import { DropdownItem } from './dropdown-item';

export function DropdownList({ 
  options, 
  value, 
  onSelect, 
  formatter,
  excludeCurrentSelection = false,
  className = '' 
}: DropdownListProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Reorder options to show selected option at the top
  const reorderedOptions = (() => {
    if (excludeCurrentSelection) {
      // If excluding current selection, just filter it out
      return options.filter(option => option.value !== value);
    }
    
    // Find the selected option
    const selectedOption = options.find(option => option.value === value);
    const otherOptions = options.filter(option => option.value !== value);
    
    // Return selected option first, then others
    return selectedOption ? [selectedOption, ...otherOptions] : options;
  })();

  useEffect(() => {
    setHighlightedIndex(0);
  }, [reorderedOptions]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < reorderedOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : reorderedOptions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (reorderedOptions[highlightedIndex] && !reorderedOptions[highlightedIndex].disabled) {
          onSelect(reorderedOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        // Let parent handle escape
        break;
    }
  };

  const handleSelect = (option: typeof reorderedOptions[0]) => {
    if (!option.disabled) {
      onSelect(option);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  if (reorderedOptions.length === 0) {
    return (
      <div className="px-2 py-3 text-sm italic text-muted-foreground">
        No options available
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className={`flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-0.5 py-0.5 ${className}`}
      onKeyDown={handleKeyDown}
      role="listbox"
      tabIndex={0}
    >
      {reorderedOptions.map((option, index) => (
        <DropdownItem
          key={option.value}
          option={option}
          isSelected={option.value === value}
          isHighlighted={index === highlightedIndex}
          onClick={() => handleSelect(option)}
          formatter={formatter}
        />
      ))}
    </div>
  );
}
