'use client'

import React, { useLayoutEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useResizableWidth } from '@/hooks/useResizableWidth'

export interface RightDrawerProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  className?: string
  zIndex?: number
  closeOnOverlayClick?: boolean
  expandToFullScreen?: boolean
  /** When true, shows a floating close control on the panel (no title header). */
  showPanelClose?: boolean
}

/**
 * Right Drawer — shell only (no built-in title/header row)
 *
 * Purpose: Slide-over panel from the right; content (e.g. `CarSliderForm`) owns its own header/actions
 * Used in: Demo client car drawer and other flows that need a lean shell
 * Why: Separates chrome (overlay, width, close) from feature headers
 */
const RightDrawer: React.FC<RightDrawerProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  zIndex = 90,
  closeOnOverlayClick = false,
  expandToFullScreen = false,
  showPanelClose = true,
}) => {
  const { width, isResizing, panelRef, handleMouseDown } = useResizableWidth({
    defaultWidth: '30vw',
    minWidth: 400,
    maxWidth: undefined,
  })

  const [isMdUp, setIsMdUp] = useState(false)
  useLayoutEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const sync = () => setIsMdUp(mql.matches)
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [])

  const panelWidthStyle: React.CSSProperties =
    expandToFullScreen
      ? { width: typeof window !== 'undefined' ? window.innerWidth : '100vw' }
      : isMdUp
        ? { width: `${width}px` }
        : { width: '100vw', maxWidth: '100dvw' }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed top-0 left-0 h-full backdrop-blur-[2px] transition-opacity duration-300 z-40"
          style={{ zIndex: zIndex - 1, width: closeOnOverlayClick ? '100vw' : 'auto' }}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <div
        ref={panelRef}
        className={`fixed top-1/2 -translate-y-1/2 right-0 h-full border-l border-border transform transition-all duration-500 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isResizing ? 'transition-none' : ''} ${className}`}
        style={{
          zIndex,
          ...panelWidthStyle,
          boxShadow: '0 0 20px 0 hsl(var(--foreground) / 0.01)',
        }}
      >
        {!expandToFullScreen && isMdUp && (
          <div
            onMouseDown={handleMouseDown}
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-20"
            style={{ cursor: 'col-resize' }}
          />
        )}

        {showPanelClose && isOpen ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 z-30 rounded-md p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        ) : null}

        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background/90 backdrop-blur-sm dark:bg-background/90">
          {children}
        </div>
      </div>
    </>
  )
}

export default RightDrawer
