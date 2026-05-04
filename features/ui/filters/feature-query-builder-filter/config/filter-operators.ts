/**
 * Filter Operators Configuration
 * 
 * Purpose: Define available operators for each field type
 * Used in: Operator selector component
 * Why: Centralized configuration for operators by field type
 */

import type { TextOperator, DateOperator, NumberOperator } from '../types/operator'

export const filterOperators = {
  text: [
    "contains",
    "does_not_contain",
    "is",
    "is_not",
    "is_empty",
    "is_not_empty"
  ] as TextOperator[],

  date: [
    "is",
    "before",
    "after",
    "on_or_before",
    "on_or_after",
    "is_not",
    "is_empty",
    "is_not_empty"
  ] as DateOperator[],

  number: [
    "eq",
    "neq",
    "gt",
    "lt",
    "gte",
    "lte",
    "is_empty",
    "is_not_empty"
  ] as NumberOperator[]
}
