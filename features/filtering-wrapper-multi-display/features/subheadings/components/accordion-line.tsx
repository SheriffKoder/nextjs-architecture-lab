/**
 * Accordion Line Component
 * 
 * Purpose: Renders visual lines for expanded accordion groups
 * Used in: VirtualizedTableHeader for group visual indicators
 * Why: Provides clear visual feedback showing which columns belong to the same group
 * 
 * Features:
 * - Horizontal line connecting group columns
 * - Vertical line on first column for connection point
 * - Responsive to column positions within groups
 * - Only shows when group is expanded
 * 
 * Steps:
 * 1. Define component props interface
 * 2. Render horizontal line with different widths based on column position
 * 3. Add vertical line on first column
 * 4. Handle proper positioning and styling
 */

import React from 'react';

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the AccordionLine component
 * Provides all necessary data for rendering the group lines
 */
interface AccordionLineProps {
  // Whether this is the first column of the group
  isFirstColumn: boolean;
  // Whether this is the last column of the group
  isLastColumn: boolean;
  // Optional additional CSS classes
  className?: string;
}

////////////////////////////////////
// Component Implementation: Line rendering with proper positioning
////////////////////////////////////

/**
 * Accordion line component for visual group connection
 * Renders horizontal and vertical lines for expanded groups
 * 
 * @param {AccordionLineProps} props - Component props
 * @returns {JSX.Element} Group line elements
 * 
 * @example
 * ```tsx
 * <AccordionLine
 *   isFirstColumn={true}
 *   isLastColumn={false}
 * />
 * ```
 */
export function AccordionLine({
  isFirstColumn,
  isLastColumn,
  className = ''
}: AccordionLineProps) {
  ////////////////////////////////////
  // Line Positioning: Determine line styles based on column position
  ////////////////////////////////////
  
  /**
   * Get horizontal line classes based on column position
   * First column: 50% from center to right
   * Last column: 50% from left to center  
   * Middle columns: full width
   */
  const getHorizontalLineClasses = () => {
    if (isFirstColumn) {
      return 'left-1/2 w-1/2'; // First column: 50% from center to right
    } else if (isLastColumn) {
      return 'left-0 w-1/2'; // Last column: 50% from left to center
    } else {
      return 'left-0 w-full'; // Middle columns: full width
    }
  };

  ////////////////////////////////////
  // Main Render: Horizontal and vertical lines
  ////////////////////////////////////
  
  return (
    <>
      {/* Horizontal line */}
      <div 
        className={`absolute -top-3.5 h-[1px] border-t border-gray-300 z-[-1] ${getHorizontalLineClasses()} ${className}`}
      />
      
      {/* Vertical line on first column */}
      {isFirstColumn && (
        <div className={`absolute left-1/2 -top-3.5 w-[1px] h-2 border-l border-gray-300 z-[-1] ${className}`}/>
      )}
    </>
  );
}

// Export component with React.memo for performance optimization
export default React.memo(AccordionLine);
