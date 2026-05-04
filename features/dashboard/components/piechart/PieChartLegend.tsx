/**
 * Pie Chart Legend Component
 * 
 * Purpose: Displays legend labels with colored circles and text
 * Used in: PieChartContainer
 * Why: Provides consistent legend display for pie chart labels
 */

import React from 'react'

export interface PieChartLegendItem {
  label: string
  color: string
}

interface PieChartLegendProps {
  items: PieChartLegendItem[]
  className?: string
  layout?: 'grid' | 'flex-row'
}

export default function PieChartLegend({ items, className = '', layout = 'grid' }: PieChartLegendProps) {
  const containerClasses = layout === 'flex-row' 
    ? `flex flex-row flex-wrap items-center gap-2 md:gap-3 ${className}`
    : `grid grid-cols-1 sm:grid-cols-2 items-center w-full gap-2 ${className}`

  return (
    <div className={containerClasses}>
      {items.map((item, index) => (
        <div key={index} className={`flex items-center gap-2 p-0 relative overflow-hidden ${layout === 'flex-row' ? 'px-2 py-1' : 'py-1 px-2'}`}>

            <div className='absolute inset-0 opacity-10 dark:opacity-20 rounded-xl' style={{ backgroundColor: item.color }}/>
            <div className='absolute inset-0 opacity-30 dark:opacity-10 rounded-xl' style={{ border: `1px solid ${item.color}` }}/>

          {/* Colored Circle */}
          <div
            className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          {/* Label Text */}
          <span className="text-[10px] text-foreground whitespace-nowrap"
          style={{ color: item.color, fontWeight: '500' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
