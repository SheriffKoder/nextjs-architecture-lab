'use client'

import type { ComponentPropsWithoutRef } from 'react'

const toolbarBtnClass =
  'rounded-md bg-foreground/5 p-2 text-foreground transition-colors duration-200 hover:bg-foreground/5 disabled:opacity-50 dark:bg-transparent dark:text-tertiary dark:hover:bg-tertiary/10'

type CarDrawerToolbarButtonProps = ComponentPropsWithoutRef<'button'>

/** Matches icon toolbar buttons in client drawer forms. */
export function CarDrawerToolbarButton({
  className,
  type = 'button',
  ...rest
}: CarDrawerToolbarButtonProps) {
  return (
    <button
      type={type}
      className={className ? `${toolbarBtnClass} ${className}` : toolbarBtnClass}
      {...rest}
    />
  )
}
