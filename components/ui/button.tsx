/**
 * Button — shared interactive control styles for the app shell.
 *
 * ## When to use which variant
 *
 * | Variant      | Role | Use for |
 * |--------------|------|---------|
 * | **action**   | Primary page action | Add / create / open drawer CTAs (e.g. Add Car). One labeled action per header region. |
 * | **control**  | Data chrome utility | Filter, calendar, group, view icons; pagination prev/next; compact dropdown triggers. “Adjust how I see data.” |
 * | **selection**| Toggle among options | Status chips, view pills, page-size presets, active page number. Pass `selected`. |
 * | **outline**  | Generic bordered | Forms, dialogs, legacy — prefer **action** / **control** in toolbars. |
 * | **ghost**    | Chrome only | Header menu / hamburger when no border is desired. |
 * | **default**  | Brand fill | Submit, primary form actions inside modals. |
 *
 * ## Sizes (with chrome variants)
 *
 * | Size       | Use for |
 * |------------|---------|
 * | **icon-sm**| `h-8 w-8` toolbar icons + mobile icon-only actions |
 * | **compact**| `h-8` icon + short label (status dropdown trigger) |
 * | **sm**     | Compact labeled **selection** chips |
 * | **default**| Labeled **action** CTAs (e.g. Add Car on desktop) |
 * | **icon**   | `h-9 w-9` default shadcn icon button |
 *
 * ## Props
 *
 * - `active` — **control** only: URL/filter state applied (tertiary tint).
 * - `selected` — **selection** only: current option in a set.
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-foreground/5 hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        /** Page-level CTA — solid outline surface (Add Car, etc.) */
        action:
          'border border-input bg-background text-foreground hover:bg-foreground/5',
        /** Toolbar / pagination utility — same surface as action; tertiary when active */
        control:
          'border border-input bg-background text-foreground hover:text-tertiary focus-visible:ring-0',
        /** Toggle chip / pill — unselected base; pair with `selected` */
        selection:
          'border border-input bg-transparent text-foreground/70 hover:bg-foreground/5 hover:text-foreground',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8 shrink-0 [&_svg]:size-4',
        compact: 'h-8 shrink-0 gap-1.5 px-2.5 text-xs [&_svg]:size-3.5',
      },
      active: {
        true: '',
        false: '',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'control',
        active: true,
        className: 'text-tertiary',
      },
      {
        variant: 'selection',
        selected: true,
        className:
          'border-tertiary/40 bg-tertiary/15 text-tertiary hover:bg-tertiary/20 hover:text-tertiary',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      active: false,
      selected: false,
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** **control** — filter/group/calendar has applied URL state */
  active?: boolean
  /** **selection** — this option is the current choice */
  selected?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      active = false,
      selected = false,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, active, selected }),
          className,
        )}
        ref={ref}
        data-active={active ? '' : undefined}
        data-selected={selected ? '' : undefined}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
