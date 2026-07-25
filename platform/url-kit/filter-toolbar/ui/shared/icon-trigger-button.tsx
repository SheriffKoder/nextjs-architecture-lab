/**
 * Square icon trigger with solid surface behind the icon.
 * Always exposes native `title` for hover tooltips; syncs from `aria-label` when omitted.
 */

'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import {
  FILTER_TOOLBAR_ICON_TRIGGER_CLASS,
  FILTER_TOOLBAR_ICON_TRIGGER_SURFACE_CLASS,
} from '../../config/chrome'

export interface IconTriggerButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** When true, tint icon/text tertiary (active state). */
  active?: boolean
  /**
   * Accessible name. Also used as `title` when `title` is omitted.
   * Prefer setting both `aria-label` and `title` explicitly at call sites.
   */
  'aria-label': string
}

export const IconTriggerButton = forwardRef<
  HTMLButtonElement,
  IconTriggerButtonProps
>(function IconTriggerButton(
  {
    children,
    className,
    active = false,
    type = 'button',
    title,
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  const resolvedTitle = title ?? ariaLabel

  return (
    <button
      ref={ref}
      type={type}
      title={resolvedTitle}
      aria-label={ariaLabel}
      className={cn(
        FILTER_TOOLBAR_ICON_TRIGGER_CLASS,
        active && 'text-tertiary',
        className
      )}
      {...props}
    >
      <span
        className={FILTER_TOOLBAR_ICON_TRIGGER_SURFACE_CLASS}
        aria-hidden
      />
      <span className="relative z-10 inline-flex items-center justify-center">
        {children}
      </span>
    </button>
  )
})
