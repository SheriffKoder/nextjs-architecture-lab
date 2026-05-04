/**
 * Health Card Component
 * 
 * Purpose: Displays a health metric with title and value
 * Used in: ScoreCardsContainer
 * Why: Provides consistent display for health metrics
 */

import React from 'react'
import LoadingValue from '@/components/loading-value'

export interface HealthCardConfig {
  title: string
  value: number | null
  prefix?: string | null
  subtitle?: string | null
}

interface HealthCardProps {
  config: HealthCardConfig
}

export default function HealthCard({ config }: HealthCardProps) {
  const { title, value, prefix, subtitle } = config

  // Format number with prefix if provided
  const formatValue = (val: number): string => {
    const formatted = val.toLocaleString()
    return prefix ? `${prefix}${formatted}` : formatted
  }

  return (
    <div className="flex flex-col items-start justify-start p-2 border h-full w-full
    bg-tertiary/10 border-[rgba(0,0,0,0.03)] rounded-lg
    dark:bg-tertiary/10 dark:border-[rgba(255,255,255,0.05)]
    ">
      {/* Title */}
      <h3 className="text-[10px] md:text-xs text-foreground/60 dark:text-foreground/70 tracking-wider font-medium dark:font-light uppercase">
        {title}
      </h3>
      
      {/* Subtitle */}
      <p className="hidden md:block text-[9px] md:text-[10px] text-tertiary mb-2 md:mb-3 min-h-[2.5rem] leading-tight">
        {subtitle || '\u00A0'}
      </p>
      
      {/* Value or Loading Placeholder */}
      <div className="w-full mt-auto">
        {value !== null ? (
          <div className="text-[10px] md:text-base lg:text-lg xl:text-xl font-semibold text-foreground">
            {formatValue(value)}
          </div>
        ) : (
          <LoadingValue className="w-16 md:w-24 lg:w-32 h-6 md:h-8 lg:h-10" />
        )}
      </div>
    </div>
  )
}
