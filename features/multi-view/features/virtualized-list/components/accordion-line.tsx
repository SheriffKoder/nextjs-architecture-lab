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

import React from 'react'
import { cn } from '@/lib/utils'

interface AccordionLineProps {
  isFirstColumn: boolean
  isLastColumn: boolean
  /** From `accordionConfig.groups[].borderColor` (e.g. `border-emerald-800`) */
  groupBorderColor?: string
  className?: string
}

export function AccordionLine({
  isFirstColumn,
  isLastColumn,
  groupBorderColor = 'border-tertiary',
  className = '',
}: AccordionLineProps) {
  const getHorizontalLineClasses = () => {
    if (isFirstColumn) {
      return 'left-1/2 w-1/2'
    }
    if (isLastColumn) {
      return 'left-0 w-1/2'
    }
    return 'left-0 w-full'
  }

  return (
    <>
      <div
        className={cn(
          'absolute -top-3.5 z-[-1] h-px border-t',
          groupBorderColor,
          getHorizontalLineClasses(),
          className,
        )}
      />
      {isFirstColumn && (
        <div
          className={cn(
            'absolute left-1/2 -top-3.5 z-[-1] h-2 w-px border-l',
            groupBorderColor,
            className,
          )}
        />
      )}
    </>
  )
}

export default React.memo(AccordionLine)
