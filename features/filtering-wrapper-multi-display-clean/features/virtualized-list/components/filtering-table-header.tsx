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
import { TableColumn, type AccordionConfig } from "../../../types";
// Import Lucide icons for better maintainability
import { ArrowUp, ArrowDown, MoveUp, MoveDown } from "lucide-react";
// Import width calculation utility
import { calculateColumnWidth } from "../utils/column-width-calculator";
// Import sticky column utilities
import { getStickyStyle } from "../utils/sticky-column-utils";
// Import accordion utilities
import { 
  isFirstColumnInGroup, 
  isLastColumnInGroup
} from "../../../utils/accordion-utils";
// Import accordion toggle button component
import { AccordionToggleButton } from "./accordion-toggle-button";
// Import accordion line component
import { AccordionLine } from "./accordion-line";
// Import DropdownFilter for header filters
import { DropdownFilter } from "@/features/ui/filters/feature-filtering/components/dropdown-filter";
import type { FilterConfig } from "@/features/ui/filters/feature-filtering/components/filter-types";
import type { HeaderFilterConfig } from "../../../types";
import { SortButton } from "@/features/ui/filters/feature-sorting/components/sort-button";
import type { SortConfig } from "@/features/ui/filters/feature-sorting/types";

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
  // Sort configuration for sort buttons
  sortConfig?: SortConfig[];
  // Whether to use useFilterIcon instead of default filter icon
  useFilterIcon?: boolean;
  // Whether to show the filter title
  showFilterTitle?: boolean;
  // Columns to hide visually but keep functional
  hiddenColumns?: string[];
  accordionConfig?: AccordionConfig;
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
  // Filter props for header filters
  filters?: FilterConfig[];
  // Header filter configuration
  headerFilterConfig?: HeaderFilterConfig;
  // Whether to hide filter buttons (useful for grouped table headers)
  hideFilters?: boolean;
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
  filters,
  headerFilterConfig,
  hideFilters = false,
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
  // Filter Renderer: Column filter dropdowns
  ////////////////////////////////////
  
  /**
   * Get filters for a specific column
   * Maps column key to filter key and filters by enabledFilterKeys if specified
   * 
   * @param {TableColumn<T>} column - Column definition
   * @returns {FilterConfig[]} Array of filters to display for this column
   */
  const getColumnFilters = (column: TableColumn<T>): FilterConfig[] => {
    if (!filters || !headerFilterConfig) return []
    
    // Get filter key for this column (use mapping or default to column.key)
    const filterKey = headerFilterConfig.columnToFilterMap?.[column.key] || column.key
    
    // Find matching filters
    let matchingFilters = filters.filter(f => f.key === filterKey)
    
    // If enabledFilterKeys is defined, act as a whitelist - only show filters for columns that have entries
    if (headerFilterConfig.enabledFilterKeys !== undefined) {
      // If this column has no entry in enabledFilterKeys, don't show any filters
      if (!headerFilterConfig.enabledFilterKeys[column.key]) {
        return []
      }
      // If this column has an entry, filter to only the enabled keys
      const enabledKeys = headerFilterConfig.enabledFilterKeys[column.key]
      matchingFilters = matchingFilters.filter(f => enabledKeys.includes(f.key))
    }
    
    return matchingFilters
  }
  
  /**
   * Render filter dropdown for a column
   * 
   * @param {TableColumn<T>} column - Column definition
   * @returns {JSX.Element | null} Filter dropdown or null if no filters
   */
  const renderColumnFilter = (column: TableColumn<T>) => {
    if (!filters || !headerFilterConfig || hideFilters) return null
    
    const columnFilters = getColumnFilters(column)
    if (columnFilters.length === 0) return null
    
    // Render all matching filters for this column
    return (
      <>
        {columnFilters.map((filter) => (
          <DropdownFilter
            key={filter.key}
            filter={filter as FilterConfig}
            autoApply={headerFilterConfig.autoApply ?? false}
            showBadges={headerFilterConfig.showBadges ?? true}
            useFilterIcon={true}
            defaultRangeExpanded={headerFilterConfig.defaultRangeExpanded ?? false}
            showInitialCount={headerFilterConfig.showInitialCount ?? false}
          />
        ))}
      </>
    )
  }

  ////////////////////////////////////
  // Sort Button Renderer: Interactive sort controls
  ////////////////////////////////////
  
  /**
   * Render sort button using SortButton component
   * Sort keys and labels come from sortConfig only (e.g. table-config.sortConfig).
   *
   * @param {TableColumn<T>} column - Column definition for sort button
   * @returns {JSX.Element | null} Sort button or null if sortConfig omits this column
   */
  const renderSortButton = (column: TableColumn<T>) => {
    if (!sortConfig || sortConfig.length === 0) return null

    const sortConfigItem = sortConfig.find((s) => s.key === column.key)
    if (!sortConfigItem) return null

    return (
      <SortButton
        key={column.key}
        sortKey={column.key}
        label={sortConfigItem.label || column.name}
      />
    )
  }

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
              <div className="absolute left-0 -top-[30px] w-[100%] h-[40px] bg-foreground/0 z-[-1]"/>
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
        
        const isLastColumn = index === columns.length - 1;
        const groupCellRounding = groupConfig && isLastColumn ? 'rounded-tr-lg' : '';
        const headerTintClass = groupConfig?.color ?? '';
        const toggleButtonColor =
          groupConfig?.buttonColor ?? groupConfig?.color ?? 'bg-tertiary';

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
            className={`relative flex items-center ${showFilterTitle ? "border-r inset-l py-2 border-b border-t border-transparent" : ""} ${
              transparentHeader || isFilterRow 
                ? (isScrolled ? 'bg-[#f1f1f1] dark:bg-[#131313]' : 'bg-transparent')
                : 'bg-[#f1f1f1] dark:bg-[#131313]'
            } ${
              isGroupedColumn ? 'cursor-pointer group' : ''
            } ${groupCellRounding} ${useEqualWidths ? 'flex-1 min-w-0' : ''}
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
          {isGroupedColumn && headerTintClass ? (
            <div
              className={`pointer-events-none absolute inset-0 z-0 group-hover:opacity-80 transition-opacity duration-200 ${headerTintClass}`}
              aria-hidden
            />
          ) : null}
          {/* Column header content with name and controls */}
          <div className={`relative z-10 flex items-center ${useEqualWidths ? 'w-full min-w-0' : ''}`}>
            {/* Column name display */}
            {showFilterTitle ? (
              <span className="px-2 text-xs font-normal text-foreground/70">{column.name}</span>
            ) : null}
            

            
            {/* Controls container: filters and sort buttons */}
            <div className={`flex items-center ${showFilterTitle ? "ml-2" : ""} ${useEqualWidths ? 'w-full min-w-0' : ''}
            ${isSubHeadingsView && !isHeadLevel ? 'hidden' : ''}
            `}>

              {/* Render filters first, then sort button */}
              {renderColumnFilter(column)}
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
              groupName={groupConfig?.name}
              groupColor={toggleButtonColor}
              groupTextColor={groupConfig?.textColor}
              groupBorderColor={groupConfig?.borderColor}
              groupLabelColor={groupConfig?.labelColor}
            />
          )}

          {/* Group expanded indicator */}
          {useFilterIcon || (isGroupedColumn && isGroupOpen) && (
            <AccordionLine
              isFirstColumn={isFirstInGroup}
              isLastColumn={isLastInGroup}
              groupBorderColor={groupConfig?.borderColor}
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