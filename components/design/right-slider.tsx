'use client'
import React, { useLayoutEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useResizableWidth } from '@/hooks/useResizableWidth'

interface HeaderIconConfig {
  icon: React.ComponentType<{ size?: number; className?: string }>
  className?: string
  size?: number
}

interface HeaderAction {
  icon: React.ComponentType<{ size?: number; className?: string }>
  onClick: () => void
  className?: string
  size?: number
  ariaLabel?: string
  title?: string
}

interface RightSliderProps {
  isOpen: boolean
  onClose: () => void
  header?: string | React.ReactNode
  subHeader?: string | React.ReactNode
  headerIcon?: HeaderIconConfig
  headerActions?: HeaderAction[]
  children?: React.ReactNode
  className?: string
  headerClassName?: string
  width?: string
  zIndex?: number
  closeOnOverlayClick?: boolean
  expandToFullScreen?: boolean
}

/**
 * Right Slider Panel Component
 * 
 * Purpose: A controlled panel component that slides in from the right
 * Used in: Pages requiring a side panel for additional content
 * Why: Provides consistent panel UI with header and close button
 * 
 * Features:
 * - Controlled open/close state from parent
 * - Header with close button built-in
 * - Overlay backdrop
 * - Smooth slide-in animation from right
 */
const RightSlider: React.FC<RightSliderProps> = ({ 
  isOpen,
  onClose,
  header,
  subHeader,
  headerIcon,
  headerActions,
  children,
  className = '',
  headerClassName = '',
  width: widthProp = 'w-screen lg:w-[400px]',
  zIndex = 90,
  closeOnOverlayClick = false,
  expandToFullScreen = false
}) => {
  const { width, isResizing, panelRef, handleMouseDown } = useResizableWidth({
    defaultWidth: '30vw',
    minWidth: 400,
    maxWidth: undefined, // Will be calculated as 90vw in the hook
  })

  /** Resizable pixel width only applies at md+; below md the panel is full viewport (w-screen). */
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

  ///////////////////////
  // Handle overlay click to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 h-full backdrop-blur-[2px] transition-opacity duration-300 z-40"
          style={{ zIndex: zIndex - 1, width: closeOnOverlayClick ? '100vw' : 'auto' }}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Right Slider Panel */}
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
        {/* Resize handle: desktop only (hook width is disabled below md → full-width panel) */}
        {!expandToFullScreen && isMdUp && (
          <div
            onMouseDown={handleMouseDown}
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-20"
            style={{
              cursor: isResizing ? 'col-resize' : 'col-resize',
            }}
          />
        )}
        {/* Header with Close Button - Fixed at top */}
        {header && (
          <div className={`pr-10 sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0 bg-primary ${headerClassName}`}>
            
            <div className='absolute inset-0 bg-background/70 backdrop-blur-sm z-[0]'></div>
            <div className="flex-1 z-[2] flex items-center gap-2">
              
              <div className="flex-1">
                {typeof header === 'string' ? (
                  <h2 className="text-sm text-foreground flex items-center gap-2">
                    
                    {headerIcon && (
                      <div className="flex-shrink-0">
                        <headerIcon.icon 
                          size={headerIcon.size || 18} 
                          className={headerIcon.className || 'text-foreground'} 
                        />
                      </div>
                    )}

                    {header}
                    </h2>
                ) : (
                  header
                )}
                {subHeader && (
                  typeof subHeader === 'string' ? (
                    <p className="text-lg font-semibold text-foreground">{subHeader}</p>
                  ) : (
                    subHeader
                  )
                )}
              </div>
            </div>
            
            {/* Header Actions */}
            {headerActions && headerActions.length > 0 && (
              <div className="z-[1] flex items-center gap-2 mr-2">
                {headerActions.map((action, index) => {
                  const ActionIcon = action.icon
                  return (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`text-foreground dark:text-tertiary bg-foreground/5 dark:bg-transparent hover:bg-foreground/5 dark:hover:bg-tertiary/10 transition-colors duration-200 p-2 rounded-md ${action.className || ''}`}
                      aria-label={action.ariaLabel || 'Action'}
                      title={action.title || 'Action'}
                    >
                      <ActionIcon size={action.size || 18} />
                    </button>
                  )
                })}
              </div>
            )}
            
            <button
              onClick={onClose}
              className="z-[3] absolute top-1 right-1 ml-4 text-muted-foreground hover:text-foreground transition-colors duration-200 p-2 rounded-md hover:bg-muted/50"
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 backdrop-blur-sm bg-background/90 dark:bg-background/90">
          {children}
        </div>
      </div>
    </>
  )
}

export default RightSlider
