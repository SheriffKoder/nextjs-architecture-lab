/**
 * EditableCell Component
 * 
 * Purpose: Renders a cell that can switch between text display and input editing
 * Used in: VirtualizedTableRow for editable columns
 * Why: Provides inline editing functionality with double-click to edit
 * 
 * Features:
 * - Displays as text by default
 * - Double-click to enter edit mode
 * - ESC key to cancel editing
 * - Blur or Enter to save changes
 * - Seamless visual transition between modes
 */

'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { DropdownOption } from '../../../../types/dropdown';
import { DropdownContainer, DropdownList } from '../../../../components/dropdown';

/**
 * Format number to 2 decimal places for display
 */
const formatNumberForDisplay = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return '';
  }
  return numValue.toFixed(2);
};

/**
 * Format number for input (remove trailing zeros)
 */
const formatNumberForInput = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return '';
  }
  // Remove trailing zeros but keep at least one decimal place if it's a decimal
  return numValue.toString();
};

interface EditableCellProps<T = any> {
  value: any;
  onValueChange?: (newValue: any) => void;
  className?: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'date';
  disabled?: boolean;
  isNumberField?: boolean;
  cellRenderer?: (
    value: any,
    item?: T,
    columnAction?: (item: T, value: any) => void | Promise<void>
  ) => React.ReactElement | null;
  // Item and columnAction for cellRenderer
  item?: T;
  columnAction?: (item: T, value: any) => void | Promise<void>;
  // Dropdown props
  isDropdown?: boolean;
  dropdownOptions?: DropdownOption[];
  dropdownFormatter?: (option: DropdownOption) => React.ReactElement;
  excludeCurrentSelection?: boolean;
}

export function EditableCell<T = any>({
  value,
  onValueChange,
  className = '',
  placeholder = '',
  type = 'text',
  disabled = false,
  isNumberField = false,
  cellRenderer,
  item,
  columnAction,
  // Dropdown props
  isDropdown = false,
  dropdownOptions = [],
  dropdownFormatter,
  excludeCurrentSelection = false
}: EditableCellProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(isNumberField ? formatNumberForInput(value) : value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(isNumberField ? formatNumberForInput(value) : value);
  }, [value, isNumberField]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useLayoutEffect(() => {
    if (!isEditing || type !== "number") return;
    const el = inputRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isEditing, type]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    if (!disabled) {
      if (isDropdown && dropdownOptions.length > 0) {
        setIsDropdownOpen(true);
      } else {
        setIsEditing(true);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering on single click too
  };

  const handleDropdownSelect = (option: DropdownOption) => {
    if (onValueChange) {
      onValueChange(option.value);
    }
    setIsDropdownOpen(false);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const handleSave = () => {
    if (onValueChange && editValue !== value) {
      // Convert to number if it's a number field
      const finalValue = isNumberField ? Number(editValue) : editValue;
      onValueChange(finalValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`w-full bg-transparent border border-blue-500 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[32px] ${className}`}
        placeholder={placeholder}
      />
    );
  }

  // Use cellRenderer if available, otherwise format display value based on field type
  const cellRendererResult = cellRenderer ? cellRenderer(value, item, columnAction) : null;
  
  // Clone cellRenderer element to add pointer-events-none so clicks pass through to parent
  let displayValue: React.ReactNode;
  if (React.isValidElement(cellRendererResult)) {
    const element = cellRendererResult as React.ReactElement<any>;
    const existingClassName = (element.props?.className as string) || '';
    displayValue = React.cloneElement(element, {
      className: `${existingClassName} pointer-events-none`.trim(),
      onClick: (e: React.MouseEvent) => e.stopPropagation() // Also stop propagation on the element itself
    });
  } else {
    displayValue = cellRendererResult !== null
      ? cellRendererResult
      : (isNumberField ? formatNumberForDisplay(value) : (value || placeholder));
  }

  // Check if cellRenderer has background styling
  const hasBackgroundStyling = cellRenderer && cellRendererResult && 
    React.isValidElement(cellRendererResult) && 
    (cellRendererResult.props as any)?.className?.includes('bg-');

  return (
    <div ref={cellRef} className="relative w-full" onClick={handleClick}>
      <div
        className={`w-full cursor-pointer border-2 border-transparent hover:border-primary/50 px-1 py-0.5 text-sm rounded text-inherit min-h-[32px] flex items-center ${!hasBackgroundStyling ? 'bg-primary/10' : ''} ${className}`}
        onDoubleClick={handleDoubleClick}
        onClick={handleClick}
        title={disabled ? 'This field is not editable' : 'Double-click to edit'}
      >
        {displayValue || <span className="text-gray-400 italic">Click to edit</span>}
      </div>
      
      {isDropdown && dropdownOptions.length > 0 && (
        <DropdownContainer
          isOpen={isDropdownOpen}
          onClose={handleDropdownClose}
          triggerElement={cellRef.current}
        >
          <DropdownList
            options={dropdownOptions}
            value={value}
            onSelect={handleDropdownSelect}
            formatter={dropdownFormatter}
            excludeCurrentSelection={excludeCurrentSelection}
          />
        </DropdownContainer>
      )}
    </div>
  );
}
