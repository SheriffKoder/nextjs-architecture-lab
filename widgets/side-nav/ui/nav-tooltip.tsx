/**
 * Navigation Tooltip Component
 * 
 * Purpose: Reusable tooltip for navigation items when sidebar is collapsed
 * Used in: NavLink and ExpandableGroup components
 * Why: Follows DRY principle - single component for tooltip functionality
 * 
 * Implementation Steps:
 * 1. Accept text, color, and active state as props
 * 2. Format text (capitalize words, replace hyphens)
 * 3. Apply appropriate colors based on active state
 * 4. Position tooltip with arrow pointing to sidebar
 */

'use client'

import React from 'react'

interface NavTooltipProps {
  text: string
  color?: 'primary' | 'secondary'
  isActive: boolean
}

export default function NavTooltip({ text, color = 'primary', isActive }: NavTooltipProps) {
  // Tooltip color classes based on color prop and active state
  // Secondary color (#4BADB4) is a teal/cyan color, using teal-500 as close match
  const tooltipColors = {
    primary: {
      bg: 'bg-primary',
      text: 'text-white',
      arrow: 'border-r-primary'
    },
    secondary: {
      bg: 'bg-tertiary',
      text: 'text-background dark:text-background/70',
      arrow: 'border-r-tertiary'
    }
  }
  
  // Use secondary background if not active, otherwise use the color prop
  const tooltipColor = isActive ? tooltipColors[color] : tooltipColors.secondary

  // Format text for tooltip (capitalize words)
  const formatTooltipText = (text: string) => {
    return text.replace(/-/g, ' ').split(' ').map((word, index, array) => (
      <span key={index}>
        {word.charAt(0).toUpperCase() + word.slice(1)}
        {index < array.length - 1 && ' '}
      </span>
    ))
  }

  return (
    <div className="absolute left-[calc(100%+15px)] ml-2 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className="relative">
        {/* Arrow pointing right (towards tooltip) */}
        <div className={`absolute right-[calc(100%-3px)] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent ${tooltipColor.arrow} border-r-[7px]`}></div>
        {/* Tooltip content */}
        <div className={`${tooltipColor.bg} ${tooltipColor.text} px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap text-xs font-medium`}>
          {formatTooltipText(text)}
        </div>
      </div>
    </div>
  )
}

