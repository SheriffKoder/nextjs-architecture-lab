/**
 * Dropdown Types
 * 
 * Purpose: TypeScript interfaces for dropdown functionality
 * Used in: EditableCell dropdown mode and dropdown components
 * Why: Provides type safety and clear structure for dropdown options
 */

import React from 'react';

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DropdownState {
  isOpen: boolean;
  selectedIndex: number;
  searchQuery: string;
  filteredOptions: DropdownOption[];
  highlightedIndex: number;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: any;
  onValueChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  formatter?: (option: DropdownOption) => React.ReactElement;
  excludeCurrentSelection?: boolean;
}

export interface DropdownContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  triggerElement?: HTMLElement | null;
}

export interface DropdownListProps {
  options: DropdownOption[];
  value: any;
  onSelect: (option: DropdownOption) => void;
  formatter?: (option: DropdownOption) => React.ReactElement;
  excludeCurrentSelection?: boolean;
  className?: string;
}

export interface DropdownItemProps {
  option: DropdownOption;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  formatter?: (option: DropdownOption) => React.ReactElement;
  className?: string;
}
