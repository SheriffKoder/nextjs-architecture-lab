/**
 * RowActionsDropdownPortal
 *
 * Purpose: Renders row action overflow menus in `document.body` so they escape overflow/stacking
 * Used in: `rows-action-buttons.tsx` (virtualized-table, list, subheadings) when `mode="dropdown"`
 * Why: Table rows often clip descendants; fixed + portal keeps the menu and caret aligned to the trigger
 */

'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type RowActionsDropdownPortalProps = {
  open: boolean
  triggerRef: React.RefObject<HTMLButtonElement | null>
  onOpenChange: (open: boolean) => void
  /** Classes for the inner panel (background, border, padding, layout). */
  panelClassName: string
  children: React.ReactNode
}

export function RowActionsDropdownPortal({
  open,
  triggerRef,
  onOpenChange,
  panelClassName,
  children,
}: RowActionsDropdownPortalProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, right: 0 })

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setCoords({ top: r.bottom + 6, right: window.innerWidth - r.right - 5 })
  }, [triggerRef])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const ro = new ResizeObserver(() => updatePosition())
    const t = triggerRef.current
    if (t) ro.observe(t)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition, triggerRef])

  useEffect(() => {
    if (!open) return
    const onDocMouseDown = (e: MouseEvent) => {
      const node = e.target as Node
      if (triggerRef.current?.contains(node)) return
      if (menuRef.current?.contains(node)) return
      onOpenChange(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open, onOpenChange, triggerRef])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={menuRef}
      className="pointer-events-auto fixed z-[19] min-w-[170px]"
      style={{ top: coords.top, right: coords.right }}
    >
      <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
        {/* Upward caret at panel top-right, pointing at the ⋯ trigger */}
        <div
          className="pointer-events-none absolute -top-[6px] z-[20] right-3 size-3 rotate-45 border-l border-t border-border bg-background"
          aria-hidden
        />
        <div className={panelClassName}>{children}</div>
      </div>
    </div>,
    document.body
  )
}
