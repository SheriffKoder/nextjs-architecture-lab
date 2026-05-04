/**
 * Check if a condition is complete
 * WHY: Validate that condition has all required fields before applying
 * HOW: Checks field, operator, and value (if needed)
 */

import type { FilterCondition } from '../types/filter'

/**
 * Check if a condition is complete and ready to apply
 * WHY: Only sync complete conditions to URL
 * HOW: Validates field, operator, and value (for operators that need values)
 * @param {FilterCondition} condition - Condition to validate
 * @returns {boolean} True if condition is complete, false otherwise
 */
export function isConditionComplete(condition: FilterCondition): boolean {
  // Must have field and operator
  if (!condition.field || !condition.operator) {
    return false
  }

  // Empty operators don't need values
  if (condition.operator === 'is_empty' || condition.operator === 'is_not_empty') {
    return true
  }

  // Date fields need dateType if not exact_date
  if (condition.dateType) {
    // For days_ago/days_from_now, need numeric value
    if (condition.dateType === 'days_ago' || condition.dateType === 'days_from_now') {
      return typeof condition.value === 'number' && condition.value !== undefined
    }
    // For exact_date, need date string
    if (condition.dateType === 'exact_date') {
      return typeof condition.value === 'string' && condition.value !== ''
    }
    // Other date types don't need value (today, yesterday, etc.)
    return true
  }

  // For non-date fields, check if value exists and is not empty
  if (condition.value === undefined || condition.value === null) {
    return false
  }

  // For strings, check if not empty
  if (typeof condition.value === 'string') {
    return condition.value.trim() !== ''
  }

  // For numbers, check if not NaN
  if (typeof condition.value === 'number') {
    return !isNaN(condition.value)
  }

  // Other types are considered valid if they exist
  return true
}
