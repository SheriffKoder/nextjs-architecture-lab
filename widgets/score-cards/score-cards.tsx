/**
 * @file widgets/score-cards/score-cards.tsx
 * Grid wrapper that renders a list of dumb {@link ScoreCard} metrics.
 */

import React from 'react'
import ScoreCard, { type ScoreCardProps } from './score-card'

/**
 * One score card item — same shape as {@link ScoreCardProps}.
 */
export type ScoreCardItem = ScoreCardProps

/**
 * Props for {@link ScoreCards}.
 */
export interface ScoreCardsProps {
  /** Cards to render in the grid. */
  items: ScoreCardItem[]
  className?: string
}

/**
 * Renders a responsive grid of score metric cards.
 *
 * @param props - see {@link ScoreCardsProps}
 */
export default function ScoreCards({ items, className = '' }: ScoreCardsProps) {
  return (
    <div className={`grid grid-cols-3 gap-4 w-full ${className}`}>
      {items.map((item, index) => (
        <ScoreCard
          key={item.id ?? `${item.title}-${index}`}
          title={item.title}
          description={item.description}
          value={item.value}
        />
      ))}
    </div>
  )
}
