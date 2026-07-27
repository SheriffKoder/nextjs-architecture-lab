'use client'

import { useRef } from 'react'
import { cn } from '@/shared/lib/utils'
import { useScrollingPlaceholder } from './use-scrolling-placeholder'
import type { ResolvedPlaceholderMarqueeConfig } from './types'
import './placeholder-marquee.css'

export type ScrollingPlaceholderOverlayProps = {
  text: string
  marquee: ResolvedPlaceholderMarqueeConfig
  hasValue: boolean
  isFocused: boolean
  /** Matches input left padding (e.g. pl-9 → left-9). */
  insetClassName?: string
  /** Typography classes shared with the input placeholder. */
  textClassName?: string
}

/**
 * Faux placeholder layered over an empty search input.
 * Animates horizontally only when text overflows the visible area.
 */
export function ScrollingPlaceholderOverlay({
  text,
  marquee,
  hasValue,
  isFocused,
  insetClassName = 'left-9 right-3',
  textClassName,
}: ScrollingPlaceholderOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)

  const { shouldShow, overflowPx, prefersReducedMotion } = useScrollingPlaceholder({
    text,
    containerRef,
    measureRef,
    enabled: marquee.enabled,
    hasValue,
    isFocused,
  })

  if (!shouldShow) return null

  const shouldAnimate = overflowPx > 0 && !prefersReducedMotion

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-1/2 -translate-y-1/2 overflow-hidden',
        insetClassName
      )}
    >
      <span
        ref={measureRef}
        className={cn('invisible absolute whitespace-nowrap', textClassName)}
      >
        {text}
      </span>

      <span
        className={cn(
          'block whitespace-nowrap',
          textClassName,
          shouldAnimate && 'search-placeholder-marquee-animate'
        )}
        style={
          {
            '--marquee-distance': `${overflowPx}px`,
            '--marquee-duration': `${marquee.cycleMs}ms`,
            '--marquee-reset-opacity': '0.55',
          } as React.CSSProperties
        }
      >
        {text}
      </span>
    </div>
  )
}
