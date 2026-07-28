/**
 * @file shared/ui/popup/popup.tsx
 * Generic centered popup shell: title, description, optional watermark icon, and children.
 */

'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { POPUP_Z } from './layers'

/**
 * Props for {@link Popup}.
 */
export interface PopupProps {
  /** Controls visibility. */
  open: boolean
  /** Called when the user dismisses the popup (close button or overlay). */
  onClose: () => void
  /** Primary heading. */
  title: string
  /** Optional supporting text under the title. */
  description?: React.ReactNode
  /** Main body content (lists, forms, custom blocks). */
  children?: React.ReactNode
  /** Optional decorative watermark rendered behind the content. */
  icon?: React.ReactNode
  /** Close when clicking the backdrop. Default: true. */
  closeOnOverlayClick?: boolean
  /** Extra classes for the panel. */
  className?: string
  /** Height utility classes for the panel. Default: full on mobile, fit on large screens. */
  heightClassName?: string
}

/**
 * Centered popup overlay with enter/exit animation.
 *
 * Dumb presentation shell — no domain logic. Prefer this over the legacy
 * `InstructionsModalListings` for new call sites.
 *
 * @param props - see {@link PopupProps}
 */
export default function Popup({
  open,
  onClose,
  title,
  description,
  children,
  icon,
  closeOnOverlayClick = true,
  className,
  heightClassName = 'h-screen lg:h-fit',
}: PopupProps) {
  const [animate, setAnimate] = useState(false)
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = window.setTimeout(() => setAnimate(true), 0)
      return () => window.clearTimeout(id)
    }

    setAnimate(false)
    const id = window.setTimeout(() => setMounted(false), 200)
    return () => window.clearTimeout(id)
  }, [open])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]"
      style={{ zIndex: POPUP_Z.overlay }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={cn(
          'relative my-4 mx-4 w-[calc(100%-2rem)] overflow-hidden rounded-lg border border-foreground/5 bg-background/85 shadow-lg backdrop-blur-[2px] lg:w-auto',
          'transition-all duration-300',
          animate ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          heightClassName,
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {icon != null && (
          <div
            className="pointer-events-none absolute top-[10%] right-[-25%] z-0 flex h-[80%] w-[80%] items-center justify-center opacity-10"
            aria-hidden
          >
            {icon}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 cursor-pointer rounded-full bg-white/10 p-1"
          style={{ zIndex: POPUP_Z.closeButton }}
          aria-label="Close"
        >
          <X className="h-4 w-4 text-foreground/70 dark:text-foreground/50" />
        </button>

        <div className="relative flex h-full w-full flex-col justify-center overflow-hidden px-4 pt-5 pb-5">
          <h2
            id="popup-title"
            className="mb-3 text-xl font-bold text-foreground sm:mb-0"
          >
            {title}
          </h2>

          {description != null && (
            <div className="my-6 hidden flex-row flex-wrap items-center justify-start gap-1 text-xs font-normal text-foreground/70 sm:my-2 sm:flex dark:font-light dark:text-foreground/50">
              {description}
            </div>
          )}

          {children != null && (
            <div className="space-y-4 border-t border-foreground/10 dark:border-foreground/5">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
