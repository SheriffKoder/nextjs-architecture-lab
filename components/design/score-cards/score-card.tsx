/**
 * Score Card Component
 * 
 * Purpose: Individual score card displaying title, description, and value
 * Used in: ScoreCards wrapper component
 * Why: Reusable card component for displaying score metrics
 * 
 * Function Index:
 * - ScoreCard: Individual card component with title, description, and value
 */

import React from 'react'
import { ScoreData } from '../../../features/portfolio-project-board/types'
import LoadingValue from '../../loading-value'

interface ScoreCardProps {
  data: ScoreData
}

export default function ScoreCard({ data }: ScoreCardProps) {
  const { title, description, value, prefix } = data

  // Format number with commas for thousands and millions
  const formatValue = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return ''
    
    // Check if it's a number
    if (typeof val === 'number') {
      // Use Intl.NumberFormat for proper formatting with commas
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }).format(val)
    }
    
    // If it's already a string, return as is
    return String(val)
  }

  return (
    <div className="rounded-lg border border-tertiary/10 dark:border-foreground/10 bg-tertiary/10 backdrop-blur-sm p-4 flex items-start gap-2 flex-col lg:flex-row">

      {/* Title and Description - Right Side */}
      <div className="flex flex-col gap-1 flex-1">
        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        
        {/* Description */}
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>


      {/* Value or Loading Placeholder - Left Side */}
      <div className="flex-shrink-0 my-auto">
        {value !== null && value !== undefined ? (
          <div className="text-base lg:text-lg xl:text-xl font-semibold text-foreground">
            {prefix && <span>{prefix}</span>}
            {formatValue(value)}
          </div>
        ) : (
          <LoadingValue className="w-16 md:w-24 h-8" />
        )}
      </div>

    </div>
  )
}
