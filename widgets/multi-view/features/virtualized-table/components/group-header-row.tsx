/**
 * Group Header Row Component
 * 
 * Purpose: Renders group headers as table rows with the same cell structure as data rows
 * Used in: VirtualizedTableComponent for grouped table view
 * Why: Group headers must appear within the table structure, not as separate headers
 */

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableColumn } from '../types/table-column';
import { calculateColumnWidth } from '../utils/column-width-calculator';
import { getStickyStyle } from '../utils/sticky-column-utils';

/**
 * Props for GroupHeaderRow component
 */
export interface GroupHeaderRowProps<T = any> {
  groupKey: string;
  groupValue: any;
  isExpanded: boolean;
  onToggle: () => void;
  level: number; // 0 for level 1, 1 for level 2, etc.
  itemCount: number;
  fieldName?: string; // Field name to display in badge (e.g., "Category")
  columns: TableColumn<T>[];
  style?: React.CSSProperties; // Only height and width, not full react-window style
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
 * Group Header Row Component
 * Renders as a table row with the same cell structure as VirtualizedTableRow
 * First cell contains: chevron + badge + title + count
 * All other cells are empty/blank
 * 
 * @param props - Component props
 * @returns Group header row element
 */
export function GroupHeaderRow<T = any>({
  groupKey,
  groupValue,
  isExpanded,
  onToggle,
  level,
  itemCount,
  fieldName,
  columns,
  style,
}: GroupHeaderRowProps<T>) {
  // Calculate indentation based on level (30px per level for virtualized-table)
  const indent = level * 30;

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

  // Get visible columns (non-hidden)
  const visibleColumns = columns.filter(col => !col.isHidden);

  // Calculate total minimum width needed for all columns
  const calculateTotalMinWidth = () => {
    let totalMinWidth = 0;
    columns.forEach((column, index) => {
      if (column.isHidden) return;
      const minWidth = column.minWidth || calculateColumnWidth(column, index, visibleColumns);
      const numericValue = parseInt(minWidth);
      if (!isNaN(numericValue)) {
        totalMinWidth += numericValue;
      }
    });
    return totalMinWidth > 0 ? `${totalMinWidth}px` : '100%';
  };

  const totalMinWidth = calculateTotalMinWidth();

  return (
    <div
      style={{
        minWidth: '100%',
        width: '100%',
      }}
      className="flex flex-col"
    >
      <div
        style={{
          height: style?.height || 40,
          minHeight: style?.height || 40,
          minWidth: totalMinWidth,
        }}
        className="flex items-stretch group border-b border-tertiary/10 cursor-pointer hover:bg-tertiary/10"
        onClick={onToggle}
      >
        {/* Map through each column to render cells */}
        {columns.map((column, colIndex) => {
          // Skip rendering if column is hidden
          if (column.isHidden) {
            return null;
          }

          // Check if this is the first visible column
          const visibleIndex = visibleColumns.findIndex(col => col.key === column.key);
          const isFirstVisibleColumn = visibleIndex === 0;

          const columnWidth = calculateColumnWidth(column, visibleIndex >= 0 ? visibleIndex : colIndex, visibleColumns);
          const columnMinWidth = column.minWidth || columnWidth;
          const isLastVisibleColumn = visibleIndex === visibleColumns.length - 1;

          // First cell contains group header content
          if (isFirstVisibleColumn) {
            return (
              <div
                key={colIndex}
                className={`px-4 pl-2 py-2 flex items-center ${column.sticky ? 'relative' : ''}`}
                style={{ 
                  width: columnWidth,
                  minWidth: columnMinWidth,
                  flexShrink: 0,
                  paddingLeft: `${parseInt(columnMinWidth) ? parseInt(columnMinWidth) * 0.1 + indent : indent + 8}px`,
                  ...getStickyStyle(column, visibleIndex >= 0 ? visibleIndex : colIndex, visibleColumns, ''),
                  zIndex: column.sticky ? 5 - (column.stickyPosition || 0) : 0,
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
                {badgeLabel && (
                  <Badge variant="outline" className="text-xs ml-2">
                    {badgeLabel}
                  </Badge>
                )}
                <span className="text-sm font-semibold text-foreground text-ellipsis overflow-hidden whitespace-nowrap">
                  {displayValue}
                </span>
                {itemCount > 0 && (
                  <span className="text-sm opacity-60 ml-2">
                    ({itemCount})
                  </span>
                )}
              </div>
            );
          }

          // All other cells are empty/blank
          return (
            <div
              key={colIndex}
              className={`px-4 pl-2 py-2 flex items-center ${column.sticky ? 'relative' : ''}`}
              style={{ 
                width: columnWidth,
                minWidth: columnMinWidth,
                flexShrink: 0,
                ...getStickyStyle(column, visibleIndex >= 0 ? visibleIndex : colIndex, visibleColumns, ''),
                zIndex: column.sticky ? 5 - (column.stickyPosition || 0) : 0,
              }}
            >
              {/* Empty cell */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
