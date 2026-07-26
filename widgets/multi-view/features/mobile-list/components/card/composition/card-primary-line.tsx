/**
 * Primary (header) line — bold, joined field values.
 */

'use client'

import { SearchHighlightedText } from '../../../lib/search'
import { cn } from '@/shared/lib/utils'

export interface CardPrimaryLineProps {
  text: string
  searchTerm?: string
  className?: string
}

export function CardPrimaryLine({
  text,
  searchTerm,
  className,
}: CardPrimaryLineProps) {
  if (!text) return null

  return (
    <p
      className={cn(
        'truncate text-[13px] font-semibold leading-snug text-foreground',
        className
      )}
    >
      <SearchHighlightedText text={text} searchTerm={searchTerm} />
    </p>
  )
}
