/**
 * Nested Value Utility
 * 
 * Function flow:
 * This utility provides a helper function to extract nested values from objects
 * using dot notation paths. It's used by grouping and counting utilities to
 * access nested properties in dropdown item values.
 * 
 * Function index:
 * - getNestedValue : Extracts nested values from objects using dot notation paths (e.g., "user.email")
 */

/**
 * Utility function to get nested value from object
 * Supports property paths like "user.email" or "user.profile.name"
 * 
 * @param obj - The object to get the value from
 * @param path - The property path (supports dot notation)
 * @returns The value at the path, or undefined if not found
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, p) => o?.[p], obj)
}

