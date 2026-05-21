'use client'

import React, { useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useResizableWidth } from '@/hooks'

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

/** SSR snapshot: assume mobile until client subscribes (avoids hydration mismatch). */
function subscribeMdUp(onStoreChange: () => void) {
  const mql = window.matchMedia('(min-width: 768px)')
  mql.addEventListener('change', onStoreChange)
  return () => mql.removeEventListener('change', onStoreChange)
}

function getMdUpSnapshot() {
  return window.matchMedia('(min-width: 768px)').matches
}

function getMdUpServerSnapshot() {
  return false
}

/**
 * Right Drawer — shell only (no built-in title/header row)
 *
 * Purpose: Slide-over panel from the right; content owns header/actions
 * Used in: Car drawer manager, drawer-2 `DrawerWrapper`
 * Why: Enter/exit via Framer Motion; CSS transitions narrowed so width does not animate (no 100vw → px flash)
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

  const isMdUp = useSyncExternalStore(subscribeMdUp, getMdUpSnapshot, getMdUpServerSnapshot)

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

  const slideEase: [number, number, number, number] = [0.32, 0.72, 0, 1]
  const slideDuration = 0.34
  const panelTransition = isResizing
    ? { duration: 0 }
    : { duration: slideDuration, ease: slideEase }

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          key="right-drawer-overlay"
          className="fixed left-0 top-0 z-40 h-full backdrop-blur-[2px]"
          style={{ zIndex: zIndex - 1, width: closeOnOverlayClick ? '100vw' : 'auto' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      ) : null}
      {isOpen ? (
        <motion.div
          key="right-drawer-panel"
          ref={panelRef}
          className={`fixed bottom-0 right-0 top-0 flex flex-col border-l border-border ${className}`.trim()}
          style={{
            zIndex,
            ...panelWidthStyle,
            boxShadow: '0 0 20px 0 hsl(var(--foreground) / 0.01)',
          }}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ x: panelTransition }}
        >
          {!expandToFullScreen && isMdUp ? (
            <div
              onMouseDown={handleMouseDown}
              className="absolute bottom-0 left-0 top-0 z-20 w-1 cursor-col-resize transition-colors duration-150 hover:bg-primary/50"
              style={{ cursor: 'col-resize' }}
            />
          ) : null}

          {showPanelClose && isOpen ? (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-2 top-2 z-30 rounded-md p-2 text-muted-foreground transition-colors duration-150 hover:bg-muted/50 hover:text-foreground"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          ) : null}

          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background/90 backdrop-blur-sm dark:bg-background/90">
            {children}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default RightDrawer
