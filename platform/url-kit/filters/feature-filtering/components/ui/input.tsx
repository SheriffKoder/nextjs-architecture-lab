/**
 * Input UI Component
 * 
 * Purpose: Reusable input component following shadcn/vercel style for filter components
 * Used in: NumberRangeFilter for number inputs
 * Why: Provides consistent input styling and behavior across filter components
 * 
 * Function Index:
 * - Input: Main input component with proper styling
 *   Example input: <Input type="number" placeholder="Min" />
 *   Example output: Styled input element with proper classes
 * 
 * Steps:
 * 1. Create forwardRef component for proper ref handling
 * 2. Apply shadcn/vercel input styling classes
 * 3. Support all standard input props and types
 */

'use client'

import * as React from "react"

import { cn } from "@/shared/lib/utils"

/**
 * Input component with consistent styling
 * WHY: Provides consistent input styling for filter components
 * HOW: Uses forwardRef for ref forwarding and applies shadcn classes
 * @param {React.ComponentProps<"input">} props - Standard input props
 * @returns {React.ReactElement} Styled input element
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
