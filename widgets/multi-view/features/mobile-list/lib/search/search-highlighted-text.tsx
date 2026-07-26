/**
 * Case-insensitive search term highlight for card text lines.
 */

'use client'

import * as React from 'react'

const DEFAULT_HIGHLIGHT =
  'bg-yellow-200 font-medium px-0 rounded text-inherit dark:bg-yellow-500/40'

export interface SearchHighlightedTextProps {
  text: string
  searchTerm?: string
  highlightStyle?: string
  className?: string
}

export function SearchHighlightedText({
  text,
  searchTerm,
  highlightStyle = DEFAULT_HIGHLIGHT,
  className,
}: SearchHighlightedTextProps) {
  if (!searchTerm?.trim() || typeof text !== 'string') {
    return <span className={className}>{text}</span>
  }

  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={index} className={highlightStyle}>
            {part}
          </span>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </span>
  )
}
