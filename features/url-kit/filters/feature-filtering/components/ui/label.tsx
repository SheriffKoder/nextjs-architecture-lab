/**
 * Label UI Component
 * 
 * Purpose: Reusable label component following shadcn/vercel style for filter components
 * Used in: Filter components that need form labels
 * Why: Provides consistent label styling and accessibility
 * 
 * Function Index:
 * - Label: Main label component with proper styling
 *   Example input: <Label htmlFor="input">Filter Name</Label>
 *   Example output: Styled label element with proper classes
 * 
 * Steps:
 * 1. Import Radix UI label primitive
 * 2. Create styled wrapper using forwardRef
 * 3. Apply shadcn/vercel label styling classes
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Define label variants using class-variance-authority
// WHY: Allows type-safe variant props and consistent styling
// HOW: Uses cva to create variant system
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
)

/**
 * Label component with consistent styling
 * WHY: Provides accessible labels for form inputs in filters
 * HOW: Uses Radix UI label primitive with shadcn styling
 * @param {LabelProps} props - Label props including variant
 * @returns {React.ReactElement} Styled label element
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
