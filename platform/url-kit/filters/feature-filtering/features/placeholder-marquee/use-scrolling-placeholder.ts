'use client'

import { useLayoutEffect, useState, useSyncExternalStore } from 'react'

type UseScrollingPlaceholderArgs = {
  text: string
  containerRef: React.RefObject<HTMLElement | null>
  measureRef: React.RefObject<HTMLElement | null>
  enabled: boolean
  hasValue: boolean
  isFocused: boolean
}

type UseScrollingPlaceholderResult = {
  /** Show the faux placeholder overlay (empty + unfocused + feature enabled). */
  shouldShow: boolean
  /** Overflow distance in px; animation runs only when > 0. */
  overflowPx: number
  prefersReducedMotion: boolean
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getReducedMotionServerSnapshot() {
  return false
}

/**
 * Measures placeholder overflow and gates marquee visibility.
 * Uses ResizeObserver only while the overlay is visible.
 */
export function useScrollingPlaceholder({
  text,
  containerRef,
  measureRef,
  enabled,
  hasValue,
  isFocused,
}: UseScrollingPlaceholderArgs): UseScrollingPlaceholderResult {
  const [overflowPx, setOverflowPx] = useState(0)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )

  const shouldShow = enabled && !hasValue && !isFocused && text.length > 0

  useLayoutEffect(() => {
    if (!shouldShow) {
      setOverflowPx(0)
      return
    }

    const measure = () => {
      const container = containerRef.current
      const textEl = measureRef.current
      if (!container || !textEl) return

      const nextOverflow = Math.max(0, textEl.scrollWidth - container.clientWidth)
      setOverflowPx(nextOverflow)
    }

    measure()

    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(measure)
    observer.observe(container)

    return () => observer.disconnect()
  }, [shouldShow, text, containerRef, measureRef])

  return {
    shouldShow,
    overflowPx,
    prefersReducedMotion,
  }
}
