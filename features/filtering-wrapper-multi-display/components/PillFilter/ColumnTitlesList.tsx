/**
 * ColumnTitlesList Component
 * 
 * Purpose: Displays all column titles in a vertical list on the left side
 * Used in: HeaderFiltersWrapper2 for left/right split layout
 * Why: Provides a clean, organized list of all available columns for filtering
 * 
 * Features:
 * - Vertical list of all column names
 * - Hover effects for better UX
 * - Consistent spacing and alignment
 * - No conditional rendering - shows all columns
 * 
 * Steps:
 * 1. Import required dependencies and types
 * 2. Define component props interface
 * 3. Render column titles with proper styling
 * 4. Handle hover states and interactions
 */

import React from 'react';
import { TableColumn } from '../../types';

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the ColumnTitlesList component
 * Provides all necessary data for rendering column titles
 */
interface ColumnTitlesListProps {
  // Column definitions for table structure
  columns: TableColumn<any>[];
  // Columns to hide visually but keep functional
  hiddenColumns?: string[];
  // Currently active column key
  activeColumnKey?: string | null;
  // Array of selected titles in order (for styling history)
  selectedTitlesOrder?: string[];
  // Currently active filters for each column
  activeFilters?: Record<string, any>;
  // Callback when a column title is clicked
  onColumnClick?: (columnKey: string) => void;
}

////////////////////////////////////
// Component Implementation: Column titles rendering
////////////////////////////////////

/**
 * Column titles list component for left side of split layout
 * Renders all column names in a clean vertical list
 * 
 * @param {ColumnTitlesListProps} props - Component props
 * @returns {JSX.Element} Vertical list of column titles
 * 
 * @example
 * ```tsx
 * <ColumnTitlesList
 *   columns={tableColumns}
 *   hiddenColumns={['date']}
 * />
 * ```
 */
const ColumnTitlesList: React.FC<ColumnTitlesListProps> = ({
  columns,
  hiddenColumns = [],
  activeColumnKey = null,
  selectedTitlesOrder = [],
  activeFilters = {},
  onColumnClick
}) => {
  ////////////////////////////////////
  // Main Render: Column titles list
  ////////////////////////////////////
  
  return (
    <div className="w-32 lg:w-48 flex-shrink-0">
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {columns.map((column, index) => {
          // Skip hidden columns
          if (hiddenColumns.includes(column.key)) return null;
          
          const isActive = activeColumnKey === column.key;
          const hasBeenSelected = selectedTitlesOrder.includes(column.key);
          const hasActiveFilters = activeFilters[column.key] && 
            (Array.isArray(activeFilters[column.key]) ? activeFilters[column.key].length > 0 : true);
          
          // Determine styling based on state
          let buttonClasses = 'w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors';
          
          if (isActive) {
            // Currently active - primary background, primary-foreground text
            buttonClasses += ' bg-gradient-to-r from-tertiary/30 to-transparent text-tertiary';
          } else if (hasBeenSelected && hasActiveFilters) {
            // Previously selected AND has active filters - primary border and text, background color
            buttonClasses += ' bg-gradient-to-r from-tertiary/10 to-transparent text-tertiary';
          } else {
            // Never selected OR no active filters - default foreground styling
            buttonClasses += ' text-foreground hover:text-foreground hover:bg-gradient-to-r from-tertiary/10 to-transparent';
          }
          
          return (
            <div key={column.key} className="flex items-center">
              <button
                onClick={() => onColumnClick?.(column.key)}
                className={buttonClasses}
              >
                {column.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Export component with React.memo for performance optimization
export default React.memo(ColumnTitlesList);
