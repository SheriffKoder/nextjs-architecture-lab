/**
 * Square toolbar icon trigger — thin wrapper over `Button` variant **control**.
 */

'use client'

import { forwardRef, type Ref } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'

export interface IconTriggerButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  /** When true, tint icon/text tertiary (active URL state). */
  active?: boolean
  /**
   * Accessible name. Also used as `title` when `title` is omitted.
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
  ref,
) {
  const resolvedTitle = title ?? ariaLabel

  return (
    <Button
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      variant="control"
      size="icon-sm"
      active={active}
      title={resolvedTitle}
      aria-label={ariaLabel}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
})
