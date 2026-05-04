/**
 * Group Header Component
 * 
 * Purpose: Renders collapsible group header row with chevron and group key
 * Used in: VirtualizedTableContainer for grouped table view
 * Why: Provides reusable group header with consistent styling and behavior
 */

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Props for GroupHeader component
 */
export interface GroupHeaderProps<T = any> {
  groupKey: string;
  groupValue: any;
  isExpanded: boolean;
  onToggle: () => void;
  level: number; // 0 for level 1, 1 for level 2, etc.
  itemCount: number;
  style?: React.CSSProperties; // For virtualization
  fieldName?: string; // Field name to display in badge (e.g., "Category")
  // Optional: Custom renderer for group header content
  renderGroupHeader?: (props: GroupHeaderProps<T>) => React.ReactNode;
}

/**
 * Format group value for display (handles arrays, objects, and primitives)
 * Used to create readable group header text
 */
function formatGroupValueForDisplay(value: any): string {
  if (value == null) return 'Unknown';
  
  // Handle arrays (e.g., assignedUsers array)
  if (Array.isArray(value)) {
    if (value.length === 0) return 'No Members';
    
    // For arrays of objects (like users), extract names
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const names = value
        .map((item: any) => item?.name || item?.email || item?.username || 'Unknown')
        .filter((name: string) => name !== 'Unknown');
      
      if (names.length === 0) return 'No Members';
      if (names.length === 1) return names[0];
      if (names.length <= 3) return names.join(', ');
      return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
    }
    
    // For arrays of primitives, join them
    return value.map((item: any) => String(item)).join(', ');
  }
  
  // Handle objects
  if (typeof value === 'object') {
    if (value.name) return String(value.name);
    if (value.email) return String(value.email);
    if (value.id) return String(value.id);
    return 'Unknown';
  }
  
  // Handle primitives
  return String(value);
}


/**
 * Group Header Component
 * Renders collapsible group header with chevron and group key
 * 
 * @param props - Component props
 * @returns Group header row element
 */
export function GroupHeader<T = any>({
  groupKey,
  groupValue,
  isExpanded,
  onToggle,
  level,
  itemCount,
  style,
  fieldName,
  renderGroupHeader,
}: GroupHeaderProps<T>) {
  // Calculate indentation based on level
  const indent = level * 20;

  // Extract the value from groupKey (remove prefix like "Category: " if present)
  // If groupKey contains ": ", use the part after it, otherwise format groupValue
  let displayValue: string;
  if (groupKey.includes(': ')) {
    displayValue = groupKey.split(': ').slice(1).join(': ');
  } else if (groupValue != null) {
    // Use the formatting function to handle arrays, objects, and primitives
    displayValue = formatGroupValueForDisplay(groupValue);
  } else {
    displayValue = groupKey;
  }

  // Format field name for badge (capitalize first letter)
  const badgeLabel = fieldName 
    ? fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()
    : null;

  // Custom renderer if provided
  if (renderGroupHeader) {
    return (
      <div
        style={{ ...style, paddingLeft: `${indent}px` }}
        className="flex flex-row items-center gap-2 px-4 py-2 cursor-pointer hover:bg-tertiary/10"
        onClick={onToggle}
      >
        {renderGroupHeader({ groupKey, groupValue, isExpanded, onToggle, level, itemCount, style, fieldName, renderGroupHeader })}
      </div>
    );
  }

  // Default renderer: Chevron + Badge + Value + Count
  return (
    <div
      style={{ ...style, paddingLeft: `${indent}px` }}
      className="flex flex-row items-center gap-2 px-4 py-2 cursor-pointer hover:bg-tertiary/10 hover:text-tertiary "
      onClick={onToggle}
    >
      {isExpanded ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
      {badgeLabel && (
        <Badge variant="outline" className="text-xs">
          {badgeLabel}
        </Badge>
      )}
      <span className="text-lg font-semibold">
        {displayValue}
      </span>
      {itemCount > 0 && (
        <span className="text-sm opacity-60">
          ({itemCount})
        </span>
      )}
    </div>
  );
}
