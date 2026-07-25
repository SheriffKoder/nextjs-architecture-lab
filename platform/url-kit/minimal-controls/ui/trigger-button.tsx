/**
 * Native trigger button with a solid absolute fill behind the label/icon.
 */

'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import {
  MINIMAL_CONTROLS_TRIGGER_CLASS,
  MINIMAL_CONTROLS_TRIGGER_SURFACE_CLASS,
} from '../config/defaults'

export interface MinimalControlsTriggerButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function MinimalControlsTriggerButton({
  children,
  className,
  type = 'button',
  ...props
}: MinimalControlsTriggerButtonProps) {
  return (
    <button
      type={type}
      className={cn(MINIMAL_CONTROLS_TRIGGER_CLASS, className)}
      {...props}
    >
      <span className={MINIMAL_CONTROLS_TRIGGER_SURFACE_CLASS} aria-hidden />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </button>
  )
}
