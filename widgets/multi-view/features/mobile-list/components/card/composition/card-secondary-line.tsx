/**
 * Secondary (meta) line — muted, joined field values.
 */

'use client'

import { SearchHighlightedText } from '../../../lib/search'
import { cn } from '@/shared/lib/utils'

export interface CardSecondaryLineProps {
  text: string
  searchTerm?: string
  className?: string
}

export function CardSecondaryLine({
  text,
  searchTerm,
  className,
}: CardSecondaryLineProps) {
  if (!text) return null

  return (
    <p
      className={cn(
        'truncate text-[11px] leading-snug text-muted-foreground',
        className
      )}
    >
      <SearchHighlightedText text={text} searchTerm={searchTerm} />
    </p>
  )
}
