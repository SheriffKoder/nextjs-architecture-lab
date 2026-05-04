/**
 * FilterBoxButton Component
 * 
 * Purpose: Displays a configurable range filter button with consistent styling
 * Used in: RowFilters component beside the date range selector
 * Why: Provides visual consistency and prepares for future range filter functionality
 * 
 * Features:
 * - Consistent button styling with the date selector
 * - Configurable icon, text, and colors
 * - Rotating chevron indicator for expandable state
 * - Placeholder for future range filter implementation
 * - Visual indicator for range filtering capability
 */

import React, { useState } from "react";
import { BarChart3, ChevronDown } from "lucide-react";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the FilterBoxButton component
 */
interface FilterBoxButtonProps {
  // Text to display on the button
  buttonText?: string;
  // Whether the button is currently active/selected
  isActive?: boolean;
  // Optional click handler for future functionality
  onClick?: () => void;
  // Custom width for the button
  width?: string;
  // Custom icon component (defaults to BarChart3)
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  // Custom icon size
  iconSize?: number;
  // Custom icon color class
  iconColor?: string;
  // Whether the button is currently chevronDown
  chevronDown?: boolean;
  // Whether the button is currently open
  isOpen?: boolean;
}

////////////////////////////////////
// Component Implementation: Range filter button
////////////////////////////////////

/**
 * Range filter button component with consistent styling
 * Currently displays as a placeholder for future range filter functionality
 * 
 * @param {FilterBoxButtonProps} props - Component props
 * @returns {JSX.Element} Range filter button
 * 
 * @example
 * ```tsx
 * <FilterBoxButton
 *   buttonText="Amount Range"
 *   isActive={false}
 *   width="200px"
 *   icon={DollarSign}
 *   iconSize={18}
 *   iconColor="text-green-600"
 * />
 * ```
 */
export function FilterBoxButton({
  buttonText = "Range Filter",
  isActive = false,
  isOpen = false,
  onClick,
  width = "200px",
  icon: IconComponent = BarChart3,
  iconSize = 16,
  iconColor,
  chevronDown = true
}: FilterBoxButtonProps) {
  ////////////////////////////////////
  // State Management: Internal expanded state
  ////////////////////////////////////
  
  // Local state for tracking expanded/collapsed state
  const [isExpanded, setIsExpanded] = useState<boolean>(chevronDown || false);
  
  ////////////////////////////////////
  // Event Handlers: Internal click handling
  ////////////////////////////////////
  
  /**
   * Handle button click with internal state management
   * Toggles expanded state and calls external onClick if provided
   */
  const handleClick = () => {
    setIsExpanded(!isExpanded);
    
    // Call external onClick handler if provided
    if (onClick) {
      onClick();
    }
  };
  ////////////////////////////////////
  // Main Render: Range filter button
  ////////////////////////////////////
  
  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg transition-colors duration-200
        
        ${
        isActive
          ? 'bg-tertiary text-background hover:bg-tertiary/90 border-tertiary'
          : 'bg-tertiary/10 text-foreground hover:bg-tertiary/80 border-tertiary/40 dark:border-tertiary/20 hover:border-tertiary/50'
        }
      ${isOpen ? 'border-tertiary' : ''}
      w-full lg:w-[200px]
      `}
      // style={width ? { width } : undefined}
    >
      <div className="flex items-center gap-2">
        <IconComponent 
          size={iconSize} 
          className={isActive ? 'text-background' : (iconColor || 'text-foreground/80')} 
        />
        <span className={`text-sm font-medium ${isActive ? 'text-background' : 'text-foreground/80'}`}>
          {buttonText}
        </span>
      </div>
      <ChevronDown 
        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''} ${
          isActive ? 'text-background' : 'text-foreground/80'
        }`} 
      />
    </button>
  );
}

// Export component with React.memo for performance optimization
export default React.memo(FilterBoxButton); 