/**
 * FilterBoxButton Component
 * 
 * Purpose: Text-based filter button with icon, text, and chevron indicator
 * Used in: DropdownFilter when useFilterIcon is false
 * Why: Provides text-based filter button option matching old component exactly
 * 
 * Features:
 * - Icon + text + chevron layout
 * - Active/inactive states
 * - Open/closed states with chevron rotation
 * - Customizable icon, text, and width
 */

'use client'

import * as React from "react"
import { useState } from "react"
import { BarChart3, ChevronDown } from "lucide-react"

//////////////////////////////////
// Type Definitions
//////////////////////////////////

/**
 * Props for the FilterBoxButton component
 */
interface FilterBoxButtonProps {
  /**
   * Text to display on the button
   * WHY: Customizable button text
   * HOW: Displayed next to icon
   */
  buttonText?: string
  
  /**
   * Whether the button is currently active/selected
   * WHY: Visual feedback for active filter state
   * HOW: Changes background color to tertiary
   */
  isActive?: boolean
  
  /**
   * Whether the button is currently open
   * WHY: Visual feedback for open state
   * HOW: Adds border-tertiary class
   */
  isOpen?: boolean
  
  /**
   * Click handler
   * WHY: Handle button clicks
   * HOW: Called when button is clicked
   */
  onClick?: () => void
  
  /**
   * Custom width for the button
   * WHY: Allow customization of button width
   * HOW: Applied via className
   */
  width?: string
  
  /**
   * Custom icon component (defaults to BarChart3)
   * WHY: Allow customization of button icon
   * HOW: Rendered before text
   */
  icon?: React.ComponentType<{ size?: number; className?: string }> | null
  
  /**
   * Custom icon size
   * WHY: Control icon size
   * HOW: Passed to icon component
   */
  iconSize?: number
  
  /**
   * Custom icon color class
   * WHY: Control icon color
   * HOW: Applied to icon className
   */
  iconColor?: string
  
  /**
   * Whether chevron should be down (default) or up
   * WHY: Control chevron initial state
   * HOW: Used for initial expanded state
   */
  chevronDown?: boolean
}

//////////////////////////////////
// Component Implementation
//////////////////////////////////

/**
 * FilterBoxButton component - text-based filter button
 * WHY: Provides text-based filter button option matching old component exactly
 * HOW: Renders button with icon, text, and chevron with exact styling
 * @param {FilterBoxButtonProps} props - Component props
 * @returns {React.ReactElement} Filter button
 */
export function FilterBoxButton({
  buttonText = "Range Filter",
  isActive = false,
  isOpen = false,
  onClick,
  width = "200px",
  icon: IconComponent,
  iconSize = 16,
  iconColor,
  chevronDown = true
}: FilterBoxButtonProps) {
  // Local state for tracking expanded/collapsed state
  const [isExpanded, setIsExpanded] = useState<boolean>(chevronDown || false)
  
  /**
   * Handle button click with internal state management
   * WHY: Toggle expanded state and call external onClick
   * HOW: Updates local state and calls prop handler
   */
  const handleClick = () => {
    setIsExpanded(!isExpanded)
    
    // Call external onClick handler if provided
    if (onClick) {
      onClick()
    }
  }
  
  return (
    <button
      onClick={handleClick}
      className={`w-[200px] cursor-pointer flex items-center justify-between px-3 py-[10px] text-xs border rounded-lg transition-colors duration-200 group ${
        isActive
          ? 'bg-tertiary text-background hover:bg-tertiary/90 border-tertiary'
          : 'bg-tertiary/10 text-foreground hover:bg-tertiary/80 border-tertiary/40 dark:border-tertiary/20 hover:border-tertiary/50'
      } ${isOpen ? 'border-tertiary' : ''} w-full lg:w-[200px]`}
    >
      <div className="flex items-center gap-2">
        {IconComponent && (
          <IconComponent 
            size={iconSize} 
            className={`transition-colors duration-200 ${isActive ? 'text-background' : (iconColor || 'text-foreground/80 group-hover:text-background')}`} 
          />
        )}
        <span className={`text-xs font-medium transition-colors duration-200 ${isActive ? 'text-background' : 'text-foreground/80 group-hover:text-background'}`}>
          {buttonText}
        </span>
      </div>
      <ChevronDown 
        className={`w-4 h-4 transition-all duration-200 ${isExpanded ? 'rotate-180' : ''} ${
          isActive ? 'text-background' : 'text-foreground/80 group-hover:text-background'
        }`} 
      />
    </button>
  )
}
