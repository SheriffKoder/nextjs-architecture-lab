/**
 * Badge UI Component
 * 
 * Purpose: Reusable badge component following shadcn/vercel style for filter components
 * Used in: Filter chips, selected filter indicators
 * Why: Provides consistent badge styling for displaying filter states
 * 
 * Function Index:
 * - Badge: Main badge component with variants
 *   Example input: <Badge variant="secondary">Active</Badge>
 *   Example output: Styled badge element with proper classes
 * 
 * Steps:
 * 1. Define badge variants using class-variance-authority
 * 2. Create component with variant support
 * 3. Apply shadcn/vercel badge styling classes
 */

'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

// Define badge variants using class-variance-authority
// WHY: Allows type-safe variant props and consistent styling
// HOW: Uses cva to create variant system with different badge styles
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component with variants
 * WHY: Provides consistent badge styling for filter indicators
 * HOW: Uses variant system to apply different badge styles
 * @param {BadgeProps} props - Badge props including variant
 * @returns {React.ReactElement} Styled badge element
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
