/**
 * @file widgets/score-cards/score-card.tsx
 * Dumb score metric card: title, description, and a value (number or string).
 */

import React from 'react'
import LoadingValue from '@/shared/ui/loading-skeletons/loading-value/loading-value'

/**
 * Props for {@link ScoreCard}.
 */
export interface ScoreCardProps {
  /** Card heading. */
  title: string
  /** Short supporting copy under the title. */
  description: string
  /**
   * Display value. Numbers are formatted with thousand separators;
   * strings render as-is. `null` / `undefined` shows a loading placeholder.
   */
  value: number | string | null | undefined
  /** Optional stable key when rendered in a list. */
  id?: string
  className?: string
}

/**
 * Formats a score value for display.
 *
 * @param value - Number (localized) or string (passthrough)
 */
function formatValue(value: number | string): string {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value)
  }
  return value
}

/**
 * Renders a single metric card with title, description, and value.
 *
 * @param props - see {@link ScoreCardProps}
 */
export default function ScoreCard({
  title,
  description,
  value,
  className = '',
}: ScoreCardProps) {
  const hasValue = value !== null && value !== undefined

  return (
    <div
      className={`rounded-lg border border-tertiary/10 dark:border-foreground/10 bg-tertiary/10 backdrop-blur-sm p-4 flex items-start gap-2 flex-col lg:flex-row ${className}`}
    >
      <div className="flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex-shrink-0 my-auto">
        {hasValue ? (
          <div className="text-base lg:text-lg xl:text-xl font-semibold text-foreground">
            {formatValue(value)}
          </div>
        ) : (
          <LoadingValue className="w-16 md:w-24 h-8" />
        )}
      </div>
    </div>
  )
}
