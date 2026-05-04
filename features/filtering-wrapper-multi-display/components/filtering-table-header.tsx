/**
 * VirtualizedTableHeader Component
 * 
 * Purpose: Renders table header with sorting and filtering capabilities
 * Used in: VirtualizedTable component
 * Why: Provides interactive header with sort buttons and filter dropdowns for each column
 * 
 * Steps:
 * 1. Import required types and components
 * 2. Define component props interface
 * 3. Render sort buttons with stacked chevrons
 * 4. Render filter dropdowns for each column
 * 5. Handle sort and filter interactions
 */

import React, { useState, useEffect } from "react";
// Import types from new types folder structure
import { TableColumn, FilterUniqueValuesMap } from "../types";
import { FilterValue } from "../types/filter-types";
import VirtualizedTableFilter from "./TableFilters/TableFilterDropdownOrchestrator";
// Import Lucide icons for better maintainability
import { ArrowUp, ArrowDown, MoveUp, MoveDown } from "lucide-react";
// Import width calculation utility
import { calculateColumnWidth } from "../features/virtualized-table/utils/column-width-calculator";
// Import sticky column utilities
import { getStickyStyle } from "../features/virtualized-table/utils/sticky-column-utils";
// Import accordion utilities
import { 
  isFirstColumnInGroup, 
  isLastColumnInGroup
} from "../utils/accordion-utils";
// Import accordion toggle button component
import { AccordionToggleButton } from "../features/virtualized-table/components/accordion-toggle-button";
// Import accordion line component
import { AccordionLine } from "../features/virtualized-table/components/accordion-line";
// Import helper to convert filterUniqueValues to dropdownItemsFromParent
import { getDropdownSourceForColumn } from "../components/PillFilter/utils/column-filter-helpers";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the VirtualizedTableHeader component
 * Provides all necessary data and handlers for header functionality
 */
interface VirtualizedTableHeaderProps<T = any> {
  // Column definitions for table structure
  columns: TableColumn<T>[];
  // Current sort configuration (column key and direction)
  sortConfig: { key: string; direction: "ascending" | "descending" | "none" };
  // Handler for sort column changes
  handleSort: (key: string) => void;
  // Currently active filters for each column
  activeFilters: Record<string, FilterValue>;
  // Handler for filter value changes
  handleFilterChange: (columnKey: string, values: FilterValue) => void;
  // Original data array for filter options
  data: T[];
  // Currently filtered data for filter calculations
  filteredData: T[];
  // Function to get filtered data excluding a specific column
  getFilteredDataExcludingColumn: (excludeColumnKey: string) => T[];
  // Pre-calculated item counts for filter options (optional)
  availableItemCounts?: Record<string, Map<string, number>>;
  // Whether to auto-apply filter changes (hides apply button)
  autoApplyDropdown?: boolean;
  // Whether to show count badges in filter dropdown
  showBadgesDropdown?: boolean;
  // Whether range filters should be open by default
  rangeOpen?: boolean;
  // Whether to use useFilterIcon instead of default filter icon
  useFilterIcon?: boolean;
  // Whether to show the filter title
  showFilterTitle?: boolean;
  // Columns to hide visually but keep functional
  hiddenColumns?: string[];
  // Optional accordion configuration for column grouping
  accordionConfig?: {
    groups: Array<{
      id: string;
      name: string;
      color: string;
      textColor: string;
    }>;
    allowMultipleOpen?: boolean;
    defaultOpenGroup?: string;
  };
  // Handler for group toggle
  handleGroupToggle?: (groupId: string) => void;
  // Currently open groups (for accordion state)
  openGroups?: Set<string>;
  // Whether to show sort buttons
  showSortButton?: boolean;
  // Whether to use equal widths for all columns
  useEqualWidths?: boolean;
  // Whether to show the filter row
  isFilterRow?: boolean;
  // Whether to show the filter row
  isHeadLevel?: boolean;
  // Whether to show the sub headings view
  isSubHeadingsView?: boolean;
  // Whether header should be transparent until scrolled
  transparentHeader?: boolean;
  // Unique value facets from main fetch (same as pill filters). Columns with uniqueValues use this.
  filterUniqueValues?: FilterUniqueValuesMap;
  // Callback when filter apply is clicked (same as pill filters). Used for API param mapping + refetch.
  onFilterApply?: (key: string, items: string[], type: string, columnConfig?: { filterApiParams?: { text?: string; number?: { from: string; to: string }; date?: { start: string; end: string }; isArray?: boolean; valueField?: 'id' | 'item' } }) => void;
}

////////////////////////////////////
// Component Implementation: Header rendering and interactions
////////////////////////////////////

/**
 * Table header component with sorting and filtering capabilities
 * Renders column headers with interactive sort buttons and filter dropdowns
 * 
 * @template T - The type of data items in the table
 * @param {VirtualizedTableHeaderProps<T>} props - Component props
 * @returns {JSX.Element} Complete table header with sort and filter controls
 * 
 * @example
 * ```tsx
 * <VirtualizedTableHeader
 *   columns={tableColumns}
 *   sortConfig={{ key: "name", direction: "ascending" }}
 *   handleSort={handleSort}
 *   activeFilters={filters}
 *   handleFilterChange={handleFilterChange}
 *   data={originalData}
 *   filteredData={filteredData}
 *   getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
 * />
 * ```
 */
function VirtualizedTableHeader<T>({
  columns,
  sortConfig,
  handleSort,
  activeFilters,
  handleFilterChange,
  data,
  filteredData,
  getFilteredDataExcludingColumn,
  availableItemCounts,
  autoApplyDropdown,
  showBadgesDropdown,
  rangeOpen,
  useFilterIcon,
  showFilterTitle = true,
  hiddenColumns = [],
  accordionConfig,
  handleGroupToggle,
  openGroups,
  showSortButton = true,
  useEqualWidths = false,
  isFilterRow = false,
  isHeadLevel = false,
  isSubHeadingsView = false,
  transparentHeader = false,
  filterUniqueValues,
  onFilterApply,
}: VirtualizedTableHeaderProps<T>) {
  ////////////////////////////////////
  // Width Calculation: Handle mixed fixed and percentage widths
  ////////////////////////////////////
  
  // Get visible columns (non-hidden) for width calculations
  const visibleColumns = columns.filter(col => !hiddenColumns.includes(col.key) && !col.isHidden);
  
  /**
   * Calculate column width considering fixed widths and remaining space distribution
   * Uses only visible columns for calculations to exclude hidden columns
   * 
   * @param column - The column to calculate width for
   * @param columnIndex - Index of the column in the columns array
   * @returns CSS width value
   */
  const getColumnWidth = (column: TableColumn<T>, columnIndex: number) => {
    // If useEqualWidths is true, don't set explicit width - let flexbox handle it
    if (useEqualWidths) {
      return undefined; // Let flexbox distribute evenly
    }
    // Use headerWidth if provided, otherwise fall back to standard calculation
    if (column.headerWidth) {
      return column.headerWidth;
    }
    // Find the index of this column in the visible columns array
    const visibleIndex = visibleColumns.findIndex(col => col.key === column.key);
    // Otherwise use the standard calculation with visible columns only
    return calculateColumnWidth(column, visibleIndex >= 0 ? visibleIndex : columnIndex, visibleColumns);
  };
  
  /**
   * Get minimum width for a column
   * Uses column.minWidth if provided, otherwise falls back to calculated width
   * 
   * @param column - The column to get minimum width for
   * @param columnIndex - Index of the column in the columns array
   * @returns CSS minWidth value or undefined
   */
  const getColumnMinWidth = (column: TableColumn<T>, columnIndex: number) => {
    if (useEqualWidths) {
      return undefined; // Let flexbox handle it
    }
    // Use headerMinWidth if provided, otherwise fall back to minWidth
    if (column.headerMinWidth) {
      return column.headerMinWidth;
    }
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
   * 
   * @param column - The column to get sticky styling for
   * @param columnIndex - Index of the column in the columns array
   * @returns CSS styles for sticky positioning (empty on smaller screens)
   */
  const getColumnStickyStyle = (column: TableColumn<T>, columnIndex: number): React.CSSProperties => {
    // Don't apply sticky styles in button mode (useFilterIcon is false)
    if (useFilterIcon === false) {
      return {};
    }
    
    // Don't apply sticky styles on smaller screens
    if (!isMdViewport) {
      return {};
    }
    
    // Find the index of this column in the visible columns array for sticky positioning
    const visibleIndex = visibleColumns.findIndex(col => col.key === column.key);
    return getStickyStyle(column, visibleIndex >= 0 ? visibleIndex : columnIndex, visibleColumns, ''); // Match the header cell background color
  };


  ////////////////////////////////////
  // Scroll Detection: Track scroll state for background styling
  ////////////////////////////////////
  
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // Only enable scroll detection if transparentHeader is true
    if (!transparentHeader) {
      return; // Early exit if feature is disabled
    }
    
    const findScrollContainer = (): HTMLElement | null => {
      if (!headerRef.current) return null;
      
      let element: HTMLElement | null = headerRef.current.parentElement;
      
      while (element) {
        const style = window.getComputedStyle(element);
        const hasOverflow = style.overflow === 'auto' || style.overflow === 'scroll' || 
                           style.overflowY === 'auto' || style.overflowY === 'scroll';
        
        if (hasOverflow && element.scrollHeight > element.clientHeight) {
          return element;
        }
        element = element.parentElement;
      }
      
      return null;
    };
    
    const handleScroll = () => {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        const hasScrolled = scrollContainer.scrollTop > 0;
        setIsScrolled(hasScrolled);
      }
    };
    
    // Try to find scroll container with multiple attempts
    const setupScrollListener = () => {
      const scrollContainer = findScrollContainer();
      
      if (scrollContainer) {
        scrollContainerRef.current = scrollContainer;
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (setupScrollListener()) {
      return () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.removeEventListener('scroll', handleScroll);
          scrollContainerRef.current = null;
        }
      };
    }
    
    // If not found, try with delays using requestAnimationFrame for better timing
    let rafId: number;
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 10;
    
    const trySetup = () => {
      attempts++;
      if (setupScrollListener() || attempts >= maxAttempts) {
        if (timeoutId) clearTimeout(timeoutId);
        return;
      }
      
      // Try again on next frame
      rafId = requestAnimationFrame(() => {
        timeoutId = setTimeout(trySetup, 50);
      });
    };
    
    // Start trying after a short delay
    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(trySetup);
    }, 100);
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
        scrollContainerRef.current = null;
      }
    };
  }, [transparentHeader]);


  ////////////////////////////////////
  // Sort Button Renderer: Interactive sort controls
  ////////////////////////////////////
  
  /**
   * Render sort button with stacked chevrons for visual clarity
   * Shows both up and down chevrons, highlighting the active direction
   * 
   * @param {TableColumn<T>} column - Column definition for sort button
   * @returns {JSX.Element | null} Sort button or null if column is not sortable
   */
  const renderSortButton = (column: TableColumn<T>) => {
    // Return null if column is not sortable
    if (!column.sortable) return null;
    
    // Determine current sort state for this column
    const isActive = sortConfig.key === column.key;
    const isAscending = isActive && sortConfig.direction === "ascending";
    const isDescending = isActive && sortConfig.direction === "descending";
    
    return (
      <button
        className="ml-1 -mt-0.5 p-1 rounded transition-colors hover:bg-foreground/10"
        onClick={() => handleSort(column.key)}
        aria-label={`Sort by ${column.name}`}
      >
        {/* Move icons: up and down in a row */}
        <div className="flex flex-row items-center gap-0">
          {/* Up arrow */}
          <MoveUp 
                size={12} 
            strokeWidth={2.5}
            className={`transition-colors -mr-0.25 ${
                isAscending ? "text-primary" : "text-tertiary"
              }`}
            />
          {/* Down arrow */}
          <MoveDown 
              size={12} 
            strokeWidth={2.5}
            className={`transition-colors -ml-1 ${
                isDescending ? "text-primary" : "text-tertiary"
              }`}
            />
        </div>
      </button>
    );
  };

  ////////////////////////////////////
  // Main Render: Complete header structure with columns and controls
  ////////////////////////////////////
  
  // Calculate total minimum width needed for all columns
  // This ensures the header takes full width even when columns have fixed widths
  // Excludes hidden columns from width calculation
  const calculateTotalMinWidth = () => {
    let totalMinWidth = 0;
    columns.forEach((column, index) => {
      // Skip hidden columns in width calculation (check both isHidden prop and hiddenColumns array)
      if (column.isHidden || hiddenColumns.includes(column.key)) {
        return;
      }
      const minWidth = getColumnMinWidth(column, index);
      // Extract numeric value from minWidth (e.g., "250px" -> 250)
      if (minWidth) {
        const numericValue = parseInt(minWidth);
        if (!isNaN(numericValue)) {
          totalMinWidth += numericValue;
        }
      }
    });
    return totalMinWidth > 0 ? `${totalMinWidth}px` : '100%';
  };

  const totalMinWidth = calculateTotalMinWidth();
  
  return (
    <div 
    ref={headerRef}
      className={`rounded flex ${showFilterTitle ? "" : "z-20 gap-2"} relative
      ${isFilterRow ? "flex-col lg:flex-row" : ""}`}
      style={{
        minWidth: totalMinWidth,
        width: '100%',
      }}
    >

            {/* Add a white background to the header cell to prevent the sticky header from showing through */}
            {accordionConfig && (
              <div className="absolute left-0 -top-[30px] w-[100%] h-[40px] bg-foreground/5 z-[-1]"/>
            )}

      {/* Map through each column to render header cells */}
      {columns.map((column, index) => {
        // Skip rendering if column is hidden or marked as hidden
        if (hiddenColumns.includes(column.key) || column.isHidden) {
          return null;
        }

        // Check if this column belongs to a group (only if not in button mode)
        const isGroupedColumn = useFilterIcon !== false && accordionConfig && column.groupId;
        
        // Get group styling if this column belongs to a group
        const groupConfig = isGroupedColumn 
          ? accordionConfig.groups.find(g => g.id === column.groupId)
          : null;
        
        // Check if group is closed (only first column visible)
        const isGroupClosed = isGroupedColumn && groupConfig;
        
        // Apply group colors if this column belongs to a group
        const isLastColumn = index === columns.length - 1;
        const groupStyling = groupConfig 
          ? `${groupConfig.color} ${groupConfig.textColor} ${isLastColumn ? 'rounded-tr-lg' : ''}`
          : '';

        ////////////////////////////////////
        // Accordion Toggle Button Logic: Determine button visibility and position
        ////////////////////////////////////
        
        // Determine if this is the first column in the group (for expand button)
        const isFirstInGroup = isGroupedColumn ? isFirstColumnInGroup(column, columns) : false;
        
        // Determine if this is the last column in the group (for collapse button)
        const isLastInGroup = isGroupedColumn ? isLastColumnInGroup(column, columns) : false;
        
        // Check if the group is currently open
        const isGroupOpen = isGroupedColumn && column.groupId && openGroups?.has(column.groupId);
        
        // Create toggle handler for this specific group
        const handleColumnGroupToggle = () => {
          if (isGroupedColumn && handleGroupToggle && column.groupId) {
            handleGroupToggle(column.groupId);
          }
        };

        
        return (
          <div
            key={column.key}
            className={`relative flex items-center ${showFilterTitle ? "border-r inset-l py-2 px-4 border-b border-t border-border/50" : ""} ${
              transparentHeader 
                ? (isScrolled ? 'bg-[#f1f1f1] dark:bg-[#131313]' : 'bg-transparent')
                : 'bg-[#f1f1f1] dark:bg-[#131313]'
            } ${
              isGroupedColumn ? 'cursor-pointer hover:opacity-80' : ''
            } ${groupStyling} ${useEqualWidths ? 'flex-1 min-w-0' : ''}
            ${index === columns.length - 1 ? 'border-r rounded-tr' : ''}
            ${!column.sticky ? '' : ''}
            ${index === 0 ? 'border-l rounded-tl' : ''}
            `}
            style={{ 
              ...(getColumnWidth(column, index) ? { 
                width: getColumnWidth(column, index),
                minWidth: getColumnMinWidth(column, index),
                flexShrink: 0
              } : {}),
              ...getColumnStickyStyle(column, index),
              ...(isFilterRow ? { border: 'none' } : {}), // we o not want borders over the filter cells, there is a button component that handles the borders
            }}
            data-accordion-first={isGroupedColumn && isFirstInGroup ? 'true' : undefined}
            data-group-id={isGroupedColumn ? (column.groupId || undefined) : undefined}
            onClick={isGroupedColumn ? handleColumnGroupToggle : undefined}
          >
          {/* Column header content with name and controls */}
          <div className={`flex items-center ${useEqualWidths ? 'w-full min-w-0' : ''}`}>
            {/* Column name display */}
            {showFilterTitle ? (
              <span className="tableTitleClass">{column.name}</span>
            ) : null}
            

            
            {/* Controls container: filters and sort buttons */}
            <div className={`flex items-center ${showFilterTitle ? "ml-2" : ""} ${useEqualWidths ? 'w-full min-w-0' : ''}
            ${isSubHeadingsView && !isHeadLevel ? 'hidden' : ''}
            `}>

              {/* Render filter dropdown if column is filterable */}
              {column.filterable !== false && (() => {
                // Convert filterUniqueValues to dropdownItemsFromParent if column has uniqueValues config
                const { dropdownItemsFromParent, getDropdownItems: columnGetDropdownItems } = getDropdownSourceForColumn<T>(
                  column,
                  filterUniqueValues
                );
                
                // Build columnConfig from column's filterApiParams
                const columnConfig = column.filterApiParams ? { filterApiParams: column.filterApiParams } : undefined;
                
                return (
                  <VirtualizedTableFilter
                    columnKey={column.key}
                    columnName={column.name}
                    data={data}
                    filteredData={filteredData}
                    activeFilters={Array.isArray(activeFilters[column.key]) ? activeFilters[column.key] as string[] : []}
                    onFilterChange={(key, values) => handleFilterChange(key, values)}
                    isNumberField={column.isNumberField}
                    isDateField={column.isDateField}
                    isTimeField={column.isTimeField}
                    decimalPlaces={column.decimalPlaces}
                    formatDisplayValue={column.formatter}
                    isLastColumn={index === columns.length - 1}
                    allActiveFilterColumns={activeFilters as Record<string, string[]>}
                    getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
                    availableItemCounts={availableItemCounts ? availableItemCounts[column.key] : undefined}
                    autoApplyDropdown={autoApplyDropdown}
                    showBadgesDropdown={showBadgesDropdown}
                    rangeOpen={rangeOpen}
                    useFilterIcon={useFilterIcon}
                    useFilterIconText={column.name}
                    useFilterIconWidth={useEqualWidths ? undefined : column.width}
                    filterIcon={column.filterIcon}
                    dropdownItemsFromParent={dropdownItemsFromParent}
                    getDropdownItems={columnGetDropdownItems}
                    onFilterApply={onFilterApply}
                    columnConfig={columnConfig}
                    isSearchFilter={column.isSearchFilter}
                  />
                );
              })()}

              {showSortButton ? renderSortButton(column) : null}

            </div>
          </div>


          {/* Accordion Toggle Button: Show expand/collapse buttons for grouped columns */}
          {(!useFilterIcon || isGroupedColumn) && (
            <AccordionToggleButton
              isGroupOpen={!!isGroupOpen}
              isFirstColumn={isFirstInGroup}
              isLastColumn={isLastInGroup}
              onToggle={handleColumnGroupToggle}
            />
          )}

          {/* Group expanded indicator */}
          {useFilterIcon || (isGroupedColumn && isGroupOpen) && (
            <AccordionLine
              isFirstColumn={isFirstInGroup}
              isLastColumn={isLastInGroup}
            />
          )}

          {/* Hide the line and button on sticky scroll */}
          {/* {useFilterIcon === false || column.sticky && (
            <div className="absolute left-0 -top-8 w-[101%] h-[30px] bg-white"/>
          )} */}


        </div>
        );
      })}
    </div>
  );
}

// Export component with React.memo for performance optimization
// Use a typed wrapper to preserve generic type information
const MemoizedVirtualizedTableHeader = React.memo(VirtualizedTableHeader) as typeof VirtualizedTableHeader;
export default MemoizedVirtualizedTableHeader; 