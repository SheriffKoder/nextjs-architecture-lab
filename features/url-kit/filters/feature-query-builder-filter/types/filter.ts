/**
 * Filter AST Types
 * 
 * Purpose: TypeScript types for the filter AST structure
 * Used in: All filter components, hooks, and utilities
 * Why: Provides type safety for filter tree structure
 */

export type Logic = "and" | "or"

export type FilterNode = FilterGroup | FilterCondition

export interface FilterGroup {
  type: "group"
  id: string  // Unique identifier for node manipulation
  logic: Logic
  children: FilterNode[]
}

export interface FilterCondition {
  type: "condition"
  id: string  // Unique identifier for node manipulation
  field: string
  operator: string
  value?: unknown
  dateType?: string  // For date fields: "today", "exact_date", "days_ago", etc.
}
