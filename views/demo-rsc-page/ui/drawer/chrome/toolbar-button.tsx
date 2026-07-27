/**
 * @file views/demo-rsc-page/ui/drawer/chrome/toolbar-button.tsx
 * Icon toolbar button used by sticky drawer headers.
 */

'use client'

import type { ComponentPropsWithoutRef } from 'react'

const toolbarBtnClass =
  'rounded-md bg-foreground/5 p-2 text-foreground transition-colors duration-200 hover:bg-foreground/5 disabled:opacity-50 dark:bg-transparent dark:text-tertiary dark:hover:bg-tertiary/10'

type RscCarDrawerToolbarButtonProps = ComponentPropsWithoutRef<'button'>

/** Matches icon toolbar buttons in create / edit drawer chrome. */
export function RscCarDrawerToolbarButton({
  className,
  type = 'button',
  ...rest
}: RscCarDrawerToolbarButtonProps) {
  return (
    <button
      type={type}
      className={className ? `${toolbarBtnClass} ${className}` : toolbarBtnClass}
      {...rest}
    />
  )
}
