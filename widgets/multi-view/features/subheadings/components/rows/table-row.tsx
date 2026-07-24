/**
 * VirtualizedTableRow Component
 * 
 * Purpose: Renders individual table rows with proper formatting and click handling
 * Used in: VirtualizedTable component rowRenderer
 * Why: Separates row rendering logic for better maintainability and reusability
 * 
 * Steps:
 * 1. Import required types and utilities
 * 2. Define component props interface
 * 3. Render row with proper styling and click handling
 * 4. Format cell values using utility functions
 */

import React, { useState, useEffect } from "react";
// Import types from types folder structure
import { TableColumn } from "../../types/table-column";
// Import cell formatting utility
import { formatCellValue } from "../../utils/format-cell-value";
import { ActionButton } from "./rows-action-buttons";
import { actionConfigs } from "../../../../constants/actions";
// Import width calculation utility
import { calculateColumnWidth } from "../../utils/column-width-calculator";
// Import sticky column utilities
import { getStickyStyle } from "../../utils/sticky-column-utils";
// Import group styling utilities
import { getGroupStyling } from "../../../../utils/accordion-utils";
// Import editable cell component
import { EditableCell } from "./editable-cell";
// Import Plus icon for expand icon
import { Minus, Plus } from "lucide-react";
// Import row expansion components
import { ExpandedRowContent } from "../row-expand";

////////////////////////////////////
// Search Highlighting Component
////////////////////////////////////

/**
 * SearchHighlightedText Component
 * 
 * Purpose: Highlights search terms in text with case-insensitive matching
 * Used in: VirtualizedTableRow to highlight search matches
 * Why: Provides visual feedback for search results with proper case handling
 */
interface SearchHighlightedTextProps {
  text: any; // Accept any type but will only highlight strings
  searchTerm: string;
  highlightStyle?: string;
}

/**
 * Helper function to recursively highlight text within a React element
 * Preserves the original element structure while highlighting matching text
 * Searches the underlying data (not the React element structure) and highlights matching text
 */
function highlightTextInElement(element: any, searchTerm: string, escapedSearchTerm: string, highlightStyle: string): any {
  if (typeof element === 'string') {
    // Highlight text in string
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = element.split(regex);
    return (
      <span>
        {parts.map((part, index) => {
          if (part.toLowerCase() === searchTerm.toLowerCase()) {
            return (
              <span key={index} className={highlightStyle}>
                {part}
              </span>
            );
          }
          return <span key={index} className="text-inherit">{part}</span>;
        })}
      </span>
    );
  }
  
  if (React.isValidElement(element)) {
    // Clone element and recursively highlight children
    const props = element.props as { children?: any; [key: string]: any };
    const children = props.children;
    let highlightedChildren = children;
    
    if (typeof children === 'string') {
      highlightedChildren = highlightTextInElement(children, searchTerm, escapedSearchTerm, highlightStyle);
    } else if (Array.isArray(children)) {
      highlightedChildren = children.map((child: any) => 
        highlightTextInElement(child, searchTerm, escapedSearchTerm, highlightStyle)
      );
    } else if (children) {
      highlightedChildren = highlightTextInElement(children, searchTerm, escapedSearchTerm, highlightStyle);
    }
    
    return React.cloneElement(element, props, highlightedChildren);
  }
  
  return element;
}

function SearchHighlightedText({ text, searchTerm, highlightStyle = "bg-yellow-200 font-medium px-0 rounded text-inherit" }: SearchHighlightedTextProps) {
  if (typeof searchTerm !== 'string' || !searchTerm.trim()) {
    return <span className="text-inherit">{text}</span>;
  }

  try {
    // Escape special regex characters
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // If text is a React element, highlight within it while preserving structure
    if (React.isValidElement(text)) {
      return highlightTextInElement(text, searchTerm, escapedSearchTerm, highlightStyle);
    }
    
    // If text is a string, highlight directly
    if (typeof text === 'string' && text.trim()) {
      const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
      const parts = text.split(regex);

      return (
        <span>
          {parts.map((part, index) => {
            if (part.toLowerCase() === searchTerm.toLowerCase()) {
              return (
                <span key={index} className={highlightStyle}>
                  {part}
                </span>
              );
            }
            return <span key={index} className="text-inherit">{part}</span>;
          })}
        </span>
      );
    }
    
    return <span className="text-inherit">{text}</span>;
  } catch (error) {
    // Fallback to plain text if regex fails
    console.warn('Search highlighting failed:', error);
    return <span className="text-inherit">{text}</span>;
  }
}

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the VirtualizedTableRow component
 * Provides all necessary data for rendering a single table row
 */
interface VirtualizedTableRowProps<T = any> {
  // Data item to display in this row
  item: T;
  // Column definitions for table structure
  columns: TableColumn<T>[];
  // Optional row click handler
  onRowClick?: (row: T) => void;
  onRowPointerEnter?: (row: T) => void;
  // Optional action click handler
  onActionClick?: (action: string, row: T) => void;
  // Action configurations for the row
  actionClickConfigs?: any[];
  // Mode for displaying action buttons: 'inline' or 'dropdown'
  actionMode?: 'inline' | 'dropdown';
  // CSS styles for virtualization (from react-window)
  style: React.CSSProperties;
  // Whether this is the last row (for border styling)
  isLastRow?: boolean;
  // Global search text
  globalSearchText?: string;
  // Whether to truncate text in cells (for fixed height mode)
  truncateText?: boolean;
  // Whether this row is selected (for highlighting)
  isSelected?: boolean;
  // Array of column keys that should be editable
  editableColumns?: string[];
  // Handler for when editable cell values change
  onCellValueChange?: (rowIndex: number, columnKey: string, newValue: any) => void;
  // Row index for cell value change handler
  rowIndex?: number;
  // Optional function to apply conditional row styling based on row data
  rowStyler?: (rowData: T) => string;
  rowHighlighting?: (rowData: T) => React.ReactNode;
  // Optional group styler configuration for highlighting groups based on data
  groupStylerConfig?: { [groupId: string]: (rowData: T, isFirstColumn: boolean, isLastColumn: boolean) => string };
  // CSS class name for search highlight styling
  searchHighlightStyle?: string;
  // Row expansion props
  rowExpansionEnabled?: boolean;
  isRowExpanded?: boolean;
  onToggleRow?: () => void;
  expandedChildren?: any[];
  isLoadingChildren?: boolean;
  renderExpandedContent?: (item: T, children: any[]) => React.ReactElement | null;
  expandedContentHeight?: number;
  // Base calculated row height (without expansion)
  calculatedRowHeight?: number;
  // Column actions configuration - maps column keys to action handler functions
  columnActions?: Record<string, (item: T, value: any) => void | Promise<void>>;
}

////////////////////////////////////
// Component Implementation: Row rendering with cell formatting
////////////////////////////////////

/**
 * Individual table row component with cell formatting and click handling
 * Renders a single row with all its cells properly formatted
 * 
 * @template T - The type of data items in the table
 * @param {VirtualizedTableRowProps<T>} props - Component props
 * @returns {JSX.Element} Complete table row with formatted cells
 * 
 * @example
 * ```tsx
 * <VirtualizedTableRow
 *   item={dataItem}
 *   columns={tableColumns}
 *   onRowClick={handleRowClick}
 *   style={virtualizationStyle}
 * />
 * ```
 */
export function VirtualizedTableRow<T = any>({
  item,
  columns,
  onRowClick,
  onRowPointerEnter,
  onActionClick,
  actionClickConfigs,
  actionMode,
  style,
  isLastRow,
  globalSearchText,
  truncateText = false,
  isSelected = false,
  editableColumns,
  onCellValueChange,
  rowIndex,
  rowStyler,
  rowHighlighting,
  groupStylerConfig,
  searchHighlightStyle,
  rowExpansionEnabled = false,
  isRowExpanded = false,
  onToggleRow,
  expandedChildren = [],
  isLoadingChildren = false,
  renderExpandedContent,
  expandedContentHeight = 200,
  calculatedRowHeight = 40,
  columnActions
}: VirtualizedTableRowProps<T>) {
  ////////////////////////////////////
  // Width Calculation: Handle mixed fixed and percentage widths
  ////////////////////////////////////
  
  // Get visible columns (non-hidden) for width calculations
  const visibleColumns = columns.filter(col => !col.isHidden);
  
  /**
   * Calculate column width considering fixed widths and remaining space distribution
   * Uses only visible columns for calculations to exclude hidden columns
   * 
   * @param column - The column to calculate width for
   * @param columnIndex - Index of the column in the visible columns array
   * @returns CSS width value
   */
  const getColumnWidth = (column: TableColumn<T>, columnIndex: number) => {
    // Find the index of this column in the visible columns array
    const visibleIndex = visibleColumns.findIndex(col => col.key === column.key);
    return calculateColumnWidth(column, visibleIndex >= 0 ? visibleIndex : columnIndex, visibleColumns);
  };
  
  /**
   * Get minimum width for a column
   * Uses column.minWidth if provided, otherwise falls back to calculated width
   * 
   * @param column - The column to get minimum width for
   * @param columnIndex - Index of the column in the columns array
   * @returns CSS minWidth value
   */
  const getColumnMinWidth = (column: TableColumn<T>, columnIndex: number) => {
    if (column.minWidth) {
      return column.minWidth;
    }
    // Fall back to calculated width if no minWidth is specified
    return getColumnWidth(column, columnIndex);
  };

  ////////////////////////////////////
  // Viewport Size: Track viewport size for responsive sticky positioning
  ////////////////////////////////////
  
  const [isMdViewport, setIsMdViewport] = useState(false);
  
  useEffect(() => {
    const checkViewport = () => {
      setIsMdViewport(window.innerWidth >= 768);
    };
    
    // Check on mount
    checkViewport();
    
    // Check on resize
    window.addEventListener('resize', checkViewport);
    
    return () => {
      window.removeEventListener('resize', checkViewport);
    };
  }, []);

  ////////////////////////////////////
  // Sticky Column Calculation: Use shared utility functions
  ////////////////////////////////////
  
  /**
   * Get sticky styling for a column using shared utility
   * Only applies sticky positioning on md+ viewports (768px+)
   * Uses only visible columns for calculations to exclude hidden columns
   * 
   * @param column - The column to get sticky styling for
   * @param columnIndex - Index of the column in the columns array
   * @returns CSS styles for sticky positioning (empty on smaller screens)
   */
  const getColumnStickyStyle = (column: TableColumn<T>, columnIndex: number): React.CSSProperties => {
    if (!column.sticky || !isMdViewport) {
      return {}; // Return empty styles if not sticky or on smaller screens
    }
    
    // Find the index of this column in the visible columns array for sticky positioning
    const visibleIndex = visibleColumns.findIndex(col => col.key === column.key);
    return getStickyStyle(column, visibleIndex >= 0 ? visibleIndex : columnIndex, visibleColumns, '');
  };

  ////////////////////////////////////
  // Row Click Handler: Handle row click events
  ////////////////////////////////////
  
  /**
   * Handle row click event if click handler is provided
   * Passes the current item data to the click handler
   */
  const handleRowClick = () => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  const handleRowPointerEnter = () => {
    onRowPointerEnter?.(item);
  };

  ////////////////////////////////////
  // Row Styling: Apply conditional styling based on row data
  ////////////////////////////////////
  
  /**
   * Get conditional styling classes for this row
   * Uses the rowStyler function if provided, otherwise returns empty string
   */
  const getRowStyling = () => {
    return rowStyler ? rowStyler(item) : '';
  };

  const rowHighlightLayer = rowHighlighting ? rowHighlighting(item) : null;

  ////////////////////////////////////
  // Main Render: Complete row structure with cells
  ////////////////////////////////////
  
  // Get row styling classes and extract background color for sticky columns
  const rowStylingClasses = getRowStyling();

  
  // Calculate base row height (without expanded content)
  // When expanded, style.height includes expanded content, so we use calculatedRowHeight for base
  // When not expanded, style.height should equal calculatedRowHeight
  const baseRowHeight = rowExpansionEnabled && isRowExpanded
    ? calculatedRowHeight
    : (style.height as number) || calculatedRowHeight;

  // Calculate total minimum width needed for all columns
  // This ensures the row takes full width even when columns have fixed widths
  // Excludes hidden columns from width calculation
  const calculateTotalMinWidth = () => {
    let totalMinWidth = 0;
    columns.forEach((column, index) => {
      // Skip hidden columns in width calculation
      if (column.isHidden) {
        return;
      }
      const minWidth = getColumnMinWidth(column, index);
      // Extract numeric value from minWidth (e.g., "250px" -> 250)
      const numericValue = parseInt(minWidth);
      if (!isNaN(numericValue)) {
        totalMinWidth += numericValue;
      }
    });
    return totalMinWidth > 0 ? `${totalMinWidth}px` : '100%';
  };

  const totalMinWidth = calculateTotalMinWidth();

  // Use 'max-content' width when row expansion is enabled to allow row to expand to content width
  // Use '100%' for regular tables without expansion
  // max() CSS function: takes the larger value between 100% (container width) and max-content (content width)
  const rowWidth = rowExpansionEnabled ? 'auto' : '100%';

  return (
    <div
      style={{
        ...style,
        minWidth: '100%',
        width: rowWidth,
      }}
      className="flex flex-col"
    >
      {/* Main row content */}
      <div
        style={{
          height: `${baseRowHeight}px`,
          minHeight: `${baseRowHeight}px`,
          minWidth: totalMinWidth,
        }}
        className={`relative flex items-stretch group ${
          onRowClick || onRowPointerEnter ? 'cursor-pointer hover:bg-tertiary/10 hover:text-tertiary' : ''
        } ${isLastRow ? 'border-b border-tertiary/10' : 'border-b border-tertiary/10'} ${
          isSelected ? 'bg-tertiary/50' : ''
        } ${rowStylingClasses ? rowStylingClasses : 'bg-tertiary/5'}`}
        onClick={handleRowClick}
        onPointerEnter={onRowPointerEnter ? handleRowPointerEnter : undefined}
      >
        {/* Row highlight layer */}
        {rowHighlightLayer ? (
          <div
            className="pointer-events-none absolute inset-0 z-0"
            aria-hidden
          >
            {rowHighlightLayer}
          </div>
        ) : null}
        <div className="relative z-10 flex w-full min-w-full items-stretch">
          
        {/* Map through each column to render cells - Content above the background */}
        {(() => {
          // Get visible columns (non-hidden) to determine last column index
          const visibleColumns = columns.filter(col => !col.isHidden);
          return columns.map((column, colIndex) => {
            // Skip rendering if column is hidden
            if (column.isHidden) {
              return null;
            }
            
            // Check if this is the last visible column
            const visibleIndex = visibleColumns.findIndex(col => col.key === column.key);
            const isLastVisibleColumn = visibleIndex === visibleColumns.length - 1;
            
            // Extract value for current column from item
            const value = item[column.key as keyof T];
        
        // Handle action column specially
        if (column.key === "actions") {
          const columnWidth = getColumnWidth(column, colIndex);
          const columnMinWidth = getColumnMinWidth(column, colIndex);
          return (
            <div
              key={colIndex}
              className={`px-4 py-2 flex items-center justify-center ${isLastVisibleColumn ? 'border-r border-gray-200/0' : ''}`}
              style={{ 
                width: columnWidth,
                minWidth: columnMinWidth,
                flexShrink: 0,
                ...getColumnStickyStyle(column, colIndex)
              }}
            >
              {onActionClick && (
                <ActionButton 
                  actions={actionClickConfigs || actionConfigs(onActionClick, item)}
                  mode={actionMode}
                />
              )}
            </div>
          );
        }
        
        // Check if this column is editable
        const isEditable = editableColumns?.includes(column.key) || false;
        
        // Get group styling for this column
        const groupStyling = getGroupStyling(item, column, columns, groupStylerConfig);
        
        // Look up the action handler for this column
        const columnAction = columnActions?.[column.key];
        
        // Use cellRenderer if available, otherwise format cell value using utility function
        // Pass value, item, and columnAction to cellRenderer
        const displayValue = column.cellRenderer 
          ? column.cellRenderer(value, item, columnAction)
          : formatCellValue({ value, column });
        
        // Get searchable text value from underlying data (for search matching)
        // Use formatter if available, otherwise use raw value converted to string
        const searchableText = column.formatter 
          ? column.formatter(value)
          : formatCellValue({ value, column });

        // Handle editable cells
        if (isEditable) {
          const columnWidth = getColumnWidth(column, colIndex);
          const columnMinWidth = getColumnMinWidth(column, colIndex);
          // Show expand icon if column config enables it
          const showExpandIcon = column.showExpandIcon || false;
          const itemHasChildren = (item as any)?.hasChildren || false;
          // Icon is disabled (opacity reduced) when item has no children
          const iconDisabled = showExpandIcon && !itemHasChildren;
          return (
            <div
              key={colIndex}
              className={`px-4 pl-2 py-2 flex items-center ${truncateText ? 'truncate overflow-hidden' : 'break-words'} ${groupStyling} ${isLastVisibleColumn ? 'border-r border-gray-200/0' : ''}
              ${column.sticky ? 'relative' : ''}`}
              style={{ 
                width: columnWidth,
                minWidth: columnMinWidth,
                flexShrink: 0,
                ...getColumnStickyStyle(column, colIndex)
              }}
            >
              {/* Absolute background for sticky cells with rowStyler colors */}
              {column.sticky && rowStylingClasses && (
                <div 
                  className={`absolute inset-0 ${rowStylingClasses} z-0`}
                />
              )}
              {/* Content above the background */}
              <div className={`${column.sticky ? 'relative z-10' : ''} flex items-center w-full`}>
                {showExpandIcon && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      if (onToggleRow && !iconDisabled) {
                        onToggleRow();
                      }
                    }}
                    className={`p-1 mr-1 rounded transition-colors hover:bg-gray-100 ${iconDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={iconDisabled}
                    title={isRowExpanded ? "Collapse" : "Expand"}
                  >
                    {!isRowExpanded ? 
                    <Plus className={`h-4 w-4 text-gray-500 flex-shrink-0 ${iconDisabled ? 'opacity-30' : ''} transition-transform`} /> : 
                    <Minus className={`h-4 w-4 text-gray-500 flex-shrink-0 ${iconDisabled ? 'opacity-30' : ''} transition-transform`} />}
                  </button>
                )}
                <EditableCell
                  value={value}
                  onValueChange={(newValue) => onCellValueChange?.(rowIndex || 0, column.key, newValue)}
                  className="w-full"
                  type={column.isNumberField ? 'number' : 'text'}
                  isNumberField={column.isNumberField || false}
                  editableGroupedNumber={column.editableGroupedNumber}
                  cellRenderer={column.cellRenderer}
                  item={item}
                  columnAction={columnAction}
                  isDropdown={column.isDropdown || false}
                  dropdownOptions={column.dropdownOptions}
                  dropdownFormatter={column.dropdownFormatter}
                  excludeCurrentSelection={column.excludeCurrentSelection || false}
                />
              </div>
            </div>
          );
        }

        const columnWidth = getColumnWidth(column, colIndex);
        const columnMinWidth = getColumnMinWidth(column, colIndex);
        // Show expand icon if column config enables it
        const showExpandIcon = column.showExpandIcon || false;
        const itemHasChildren = (item as any)?.hasChildren || false;
        // Icon is disabled (opacity reduced) when item has no children
        const iconDisabled = showExpandIcon && !itemHasChildren;
        
        return (
          <div
            key={colIndex}
            className={`px-4 pl-2 py-2 flex items-center ${truncateText ? 'truncate overflow-hidden' : 'break-words'} 
            ${groupStyling} ${isLastVisibleColumn ? '' : ''}
            ${column.sticky ? 'dark:group-hover:bg-neutral-800 group-hover:bg-neutral-200 bg-[#F0F2F8] dark:bg-[#151519] relative' : ''}`}
            style={{ 
              width: columnWidth,
              minWidth: columnMinWidth,
              flexShrink: 0,
              ...getColumnStickyStyle(column, colIndex),
              zIndex: column.sticky && isMdViewport ? 5 - (column.stickyPosition || 0) : 0,
            }}
          >
            {/* Absolute background for sticky cells with rowStyler colors */}
            {column.sticky && rowStylingClasses && (
              <div 
                className={`absolute inset-0 ${rowStylingClasses} z-0`}
              />
            )}
            {/* Content above the background */}
            <div className="relative z-10 flex items-center w-full">
              {showExpandIcon && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    if (onToggleRow && !iconDisabled) {
                      onToggleRow();
                    }
                  }}
                  className={`p-1 mr-1 rounded transition-colors hover:bg-gray-100 ${iconDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={iconDisabled}
                  title={isRowExpanded ? "Collapse" : "Expand"}
                >
                  {!isRowExpanded ? 
                  <Plus className={`h-4 w-4 text-gray-500 flex-shrink-0 ${iconDisabled ? 'opacity-30' : ''} transition-transform`} /> : 
                  <Minus className={`h-4 w-4 text-gray-500 flex-shrink-0 ${iconDisabled ? 'opacity-30' : ''} transition-transform`} />}
                </button>
              )}
              {truncateText ? (
                <span className="truncate block w-full">
                  {globalSearchText && searchableText && typeof searchableText === 'string' && 
                   searchableText.toLowerCase().includes(globalSearchText.toLowerCase()) ? (
                    <SearchHighlightedText 
                      text={displayValue} 
                      searchTerm={globalSearchText}
                      highlightStyle={searchHighlightStyle}
                    />
                  ) : (
                    displayValue
                  )}
                </span>
              ) : (
                globalSearchText && searchableText && typeof searchableText === 'string' && 
                searchableText.toLowerCase().includes(globalSearchText.toLowerCase()) ? (
                  <SearchHighlightedText 
                    text={displayValue} 
                    searchTerm={globalSearchText}
                    highlightStyle={searchHighlightStyle}
                  />
                ) : (
                  displayValue
                )
              )}
            </div>
          </div>
        );
          });
        })()}
        </div>
      </div>
      
      {/* Expanded content below the row */}
      {rowExpansionEnabled && isRowExpanded && (
        <div style={{ minWidth: totalMinWidth }}>
          <ExpandedRowContent
            item={item}
            expandedChildren={expandedChildren}
            isLoading={isLoadingChildren}
            renderContent={renderExpandedContent}
            height={expandedContentHeight}
            onRowClick={onRowClick}
            onRowPointerEnter={onRowPointerEnter}
          />
        </div>
      )}
    </div>
  );
}

// Export component with React.memo for performance optimization
export default React.memo(VirtualizedTableRow); 