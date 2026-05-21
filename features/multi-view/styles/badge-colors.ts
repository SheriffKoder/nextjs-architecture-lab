/**
 * Badge Color Utilities
 * 
 * Purpose: Centralized badge color styles for consistent UI across all tables
 * Used in: Table configs (trailers, jobs, invoices, user-management)
 * Why: Single source of truth for badge colors, easy to update globally
 * 
 * Usage:
 * ```typescript
 * import { getBadgeColor, badgeBaseClasses } from '@/lib/utils/badge-colors';
 * 
 * const statusColors: Record<Status, string> = {
 *   [Status.ACTIVE]: getBadgeColor('success'),
 *   [Status.INACTIVE]: getBadgeColor('neutral'),
 * };
 * 
 * className={`${badgeBaseClasses} ${statusColors[status]}`}
 * ```
 */

/**
 * Semantic badge color styles
 * Maps semantic meanings to Tailwind CSS classes
 */
export const badgeColors = {
  // Success states (green)
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  successLight: 'bg-green-500/10 text-green-600 dark:text-green-400',
  
  // Info states (blue)
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  infoLight: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  
  // Warning states (yellow)
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  warningLight: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  
  // Error/Danger states (red)
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  errorLight: 'bg-destructive/10 text-destructive',
  
  // Neutral states (gray)
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  neutralLight: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  
  // Special states (purple)
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  purpleLight: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
} as const;

/**
 * Get badge color class by semantic key
 * 
 * @param key - Semantic color key (success, info, warning, error, neutral, purple)
 * @param variant - 'default' or 'light' variant
 * @returns Tailwind CSS classes for badge styling
 * 
 * @example
 * getBadgeColor('success') // Returns success badge classes
 * getBadgeColor('error', 'light') // Returns errorLight badge classes
 */
export function getBadgeColor(
  key: keyof typeof badgeColors,
  variant: 'default' | 'light' = 'default'
): string {
  // Handle light variant
  if (variant === 'light') {
    const lightKey = `${key}Light` as keyof typeof badgeColors;
    if (lightKey in badgeColors) {
      return badgeColors[lightKey];
    }
  }
  
  // Return default variant or fallback to neutral
  return badgeColors[key] || badgeColors.neutral;
}

/**
 * Badge base classes (shared across all badges)
 * These classes are applied to all badges for consistent styling
 */
export const badgeBaseClasses = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium';

/**
 * Get complete badge className
 * 
 * @param colorKey - Semantic color key
 * @param variant - 'default' or 'light' variant
 * @returns Complete className string for badge
 * 
 * @example
 * getBadgeClassName('success') // Returns full badge className with success colors
 */
export function getBadgeClassName(
  colorKey: keyof typeof badgeColors,
  variant: 'default' | 'light' = 'default'
): string {
  return `${badgeBaseClasses} ${getBadgeColor(colorKey, variant)}`;
}
