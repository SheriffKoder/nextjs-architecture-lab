/**
 * Anchors a fixed panel to a trigger and clamps it to the viewport.
 * Used by filter-toolbar date-control and feature-filtering DropdownFilter.
 */

'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'

const GAP_PX = 4
const VIEWPORT_PAD = 8

export type PanelPosition = {
  top: number
  left: number
}

export type PanelAlign = 'start' | 'end'

export interface UseAnchoredPanelPositionOptions {
  isOpen: boolean
  /**
   * Horizontal alignment to the trigger.
   * - `end` (default): panel right edge aligns to trigger right (toolbar icons)
   * - `start`: panel left edge aligns to trigger left (table header filters)
   */
  align?: PanelAlign
  /** Re-run layout when this changes (e.g. calendar mode / filter content). */
  repositionKey?: string | number | boolean | null
  onClose?: () => void
}

export interface UseAnchoredPanelPositionReturn {
  triggerRef: RefObject<HTMLElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  position: PanelPosition
  hasPositioned: boolean
}

export function useAnchoredPanelPosition({
  isOpen,
  align = 'end',
  repositionKey,
  onClose,
}: UseAnchoredPanelPositionOptions): UseAnchoredPanelPositionReturn {
  const [position, setPosition] = useState<PanelPosition>({ top: 0, left: 0 })
  const [hasPositioned, setHasPositioned] = useState(false)
  const triggerRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel) return

    const triggerRect = trigger.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    const panelWidth = panelRect.width || 300
    const panelHeight = panelRect.height || 320

    let left =
      align === 'start'
        ? triggerRect.left
        : triggerRect.right - panelWidth

    const maxLeft = window.innerWidth - panelWidth - VIEWPORT_PAD
    left = Math.min(
      Math.max(left, VIEWPORT_PAD),
      Math.max(VIEWPORT_PAD, maxLeft),
    )

    let top = triggerRect.bottom + GAP_PX
    if (top + panelHeight > window.innerHeight - VIEWPORT_PAD) {
      const above = triggerRect.top - panelHeight - GAP_PX
      top =
        above >= VIEWPORT_PAD
          ? above
          : Math.max(
              VIEWPORT_PAD,
              window.innerHeight - panelHeight - VIEWPORT_PAD,
            )
    }

    setPosition({ top, left })
    setHasPositioned(true)
  }, [align])

  useEffect(() => {
    if (!isOpen) setHasPositioned(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !onClose) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  useLayoutEffect(() => {
    if (!isOpen) return
    updatePosition()

    const panel = panelRef.current
    const ro =
      panel && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updatePosition())
        : null
    if (panel && ro) ro.observe(panel)

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, repositionKey, updatePosition])

  return {
    triggerRef,
    panelRef,
    position,
    hasPositioned,
  }
}
