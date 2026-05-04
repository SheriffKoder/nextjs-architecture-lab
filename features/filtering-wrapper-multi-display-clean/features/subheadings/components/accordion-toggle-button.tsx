/**
 * Accordion Toggle Button Component
 * 
 * Purpose: Provides expand/collapse buttons for accordion groups in virtualized table
 * Used in: VirtualizedTableHeader for group toggle functionality
 * Why: Separates accordion button logic from header component for better maintainability
 * 
 * Features:
 * - Expand button (+) for closed groups on first column
 * - Collapse button (-) for open groups on last column
 * - Visual feedback with hover states
 * - Accessible button design
 * 
 * Steps:
 * 1. Define component props interface
 * 2. Render appropriate button based on group state and column position
 * 3. Handle click events to toggle group state
 * 4. Apply proper styling and accessibility attributes
 */

import React from 'react';

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the AccordionToggleButton component
 * Provides all necessary data for rendering and handling accordion toggle buttons
 */
interface AccordionToggleButtonProps {
  // Whether the group is currently open
  isGroupOpen: boolean;
  // Whether this is the first column of the group (for expand button)
  isFirstColumn: boolean;
  // Whether this is the last column of the group (for collapse button)
  isLastColumn: boolean;
  // Handler for group toggle events
  onToggle: () => void;
  // Optional additional CSS classes
  className?: string;
}

////////////////////////////////////
// Component Implementation: Button rendering with proper styling
////////////////////////////////////

/**
 * Accordion toggle button component with expand/collapse functionality
 * Renders either a + (expand) or - (collapse) button based on group state and column position
 * 
 * @param {AccordionToggleButtonProps} props - Component props
 * @returns {JSX.Element | null} Toggle button or null if not applicable
 * 
 * @example
 * ```tsx
 * <AccordionToggleButton
 *   isGroupOpen={false}
 *   isFirstColumn={true}
 *   isLastColumn={false}
 *   onToggle={handleGroupToggle}
 * />
 * ```
 */
export function AccordionToggleButton({
  isGroupOpen,
  isFirstColumn,
  isLastColumn,
  onToggle,
  className = ''
}: AccordionToggleButtonProps) {
  ////////////////////////////////////
  // Button Visibility Logic: Determine when to show which button
  ////////////////////////////////////
  
  /**
   * Determine if the expand button should be shown
   * Show + button on first column when group is closed
   */
  const shouldShowExpandButton = !isGroupOpen && isFirstColumn;
  
  /**
   * Determine if the collapse button should be shown
   * Show - button on last column when group is open
   */
  const shouldShowCollapseButton = isGroupOpen && isLastColumn;
  
  // Don't render anything if neither button should be shown
  if (!shouldShowExpandButton && !shouldShowCollapseButton) {
    return null;
  }

  ////////////////////////////////////
  // Button Configuration: Set up button properties based on type
  ////////////////////////////////////
  
  /**
   * Get button configuration based on whether it's expand or collapse
   * Returns appropriate icon, styling, and accessibility attributes
   */
  const getButtonConfig = () => {
    if (shouldShowExpandButton) {
      return {
        icon: '+',
        ariaLabel: 'Expand group',
        title: 'Click to expand group',
        buttonClasses: 'cursor-pointer bg-gray-600/80 text-white hover:bg-gray-700'
      };
    } else {
      return {
        icon: '-',
        ariaLabel: 'Collapse group',
        title: 'Click to collapse group',
        buttonClasses: 'cursor-pointer bg-white text-black border border-gray-300 hover:bg-gray-50'
      };
    }
  };

  const buttonConfig = getButtonConfig();

  ////////////////////////////////////
  // Main Render: Button with proper styling and accessibility
  ////////////////////////////////////
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`
        absolute -top-6 right-1/2 translate-x-[50%] w-5 h-5 flex items-center justify-center
        text-xs font-medium rounded-[6px] transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        ${buttonConfig.buttonClasses}
        ${className}
      `}
      aria-label={buttonConfig.ariaLabel}
      title={buttonConfig.title}
      type="button"
    >
      <span className="my-auto h-full w-full flex items-center justify-center pb-[2px] pl-[1px]">{buttonConfig.icon}</span>
    </button>
  );
}

// Export component with React.memo for performance optimization
export default React.memo(AccordionToggleButton);
