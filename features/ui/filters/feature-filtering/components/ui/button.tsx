/**
 * Button UI Component
 * 
 * Purpose: Reusable button component following shadcn/vercel style for filter components
 * Used in: All filter components that need interactive buttons
 * Why: Provides consistent button styling and behavior across filter components
 * 
 * Function Index:
 * - Button: Main button component with variants and sizes
 *   Example input: <Button variant="outline" size="sm">Filter</Button>
 *   Example output: Styled button element with proper classes
 * 
 * Steps:
 * 1. Define button variants using class-variance-authority
 * 2. Create forwardRef component for proper ref handling
 * 3. Apply variant and size classes using cn utility
 * 4. Support asChild prop for composition patterns
 */

'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Define button variants using class-variance-authority
// WHY: Allows type-safe variant props and consistent styling
// HOW: Uses cva to create variant system with different styles and sizes
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Button component with variants and sizes
 * WHY: Provides consistent button styling across filter components
 * HOW: Uses forwardRef for ref forwarding and Slot for composition
 * @param {ButtonProps} props - Button props including variant, size, and asChild
 * @returns {React.ReactElement} Styled button element
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Use Slot if asChild is true to allow composition with other components
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
