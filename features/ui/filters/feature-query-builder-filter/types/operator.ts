/**
 * Operator Types
 * 
 * Purpose: TypeScript types for filter operators
 * Used in: Operator configuration and operator selector components
 * Why: Provides type safety for operator definitions
 */

export type TextOperator = 
  | "contains"
  | "does_not_contain"
  | "is"
  | "is_not"
  | "is_empty"
  | "is_not_empty"

export type DateOperator =
  | "is"
  | "before"
  | "after"
  | "on_or_before"
  | "on_or_after"
  | "is_not"
  | "is_empty"
  | "is_not_empty"

export type NumberOperator =
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "is_empty"
  | "is_not_empty"

export type Operator = TextOperator | DateOperator | NumberOperator
