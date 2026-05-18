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

import React from 'react'
import { cn } from '@/lib/utils'
import {
  accordionColorClassesToBorderClasses,
  accordionColorClassesToTextClasses,
} from '../../../utils/accordion-utils'
import { MinusIcon, PlusIcon } from 'lucide-react'

interface AccordionToggleButtonProps {
  isGroupOpen: boolean
  isFirstColumn: boolean
  isLastColumn: boolean
  onToggle: () => void
  groupName?: string
  groupColor?: string
  groupTextColor?: string
  groupBorderColor?: string
  groupLabelColor?: string
  className?: string
}

export function AccordionToggleButton({
  isGroupOpen,
  isFirstColumn,
  isLastColumn,
  onToggle,
  groupName,
  groupColor = 'bg-tertiary',
  groupTextColor = 'text-white',
  groupBorderColor,
  groupLabelColor,
  className = '',
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

  const isClosedExpand = shouldShowExpandButton
  const borderClasses =
    groupBorderColor ?? accordionColorClassesToBorderClasses(groupColor)
  const nameTextClasses =
    groupLabelColor ?? accordionColorClassesToTextClasses(groupColor)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle()
  }

  if (isClosedExpand) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'absolute -top-6 right-1/2 flex translate-x-[50%] cursor-pointer items-center gap-1.5',
          'border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
          className,
        )}
        aria-label={`Expand ${groupName ?? 'group'}`}
        title="Click to expand group"
      >
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border text-xs font-medium',
            groupColor,
            groupTextColor,
            borderClasses,
          )}
        >
          <PlusIcon className="w-3 h-3 stroke-2" />
        </span>
        {groupName ? (
          <span
            className={cn(
              'whitespace-nowrap text-xs font-medium',
              nameTextClasses,
            )}
          >
            {groupName}
          </span>
        ) : null}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'absolute -top-6 right-1/2 flex h-5 w-5 translate-x-[50%] items-center justify-center',
        'rounded-[6px] border text-xs font-medium transition-colors duration-200',
        'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        groupColor,
        groupTextColor,
        borderClasses,
        className,
      )}
      aria-label="Collapse group"
      title="Click to collapse group"
    >
      <span className="my-auto flex h-full w-full items-center justify-center">
        <MinusIcon className="w-3 h-3 stroke-2" />
      </span>
    </button>
  )
}

export default React.memo(AccordionToggleButton)
