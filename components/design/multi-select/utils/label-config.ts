/**
 * Label Styling Configuration
 * 
 * Function flow:
 * This utility provides a function to generate custom className strings for dropdown
 * item labels based on the item's label value. It applies base styles to all labels
 * and then adds specific styling based on case-insensitive label matching.
 * 
 * Function index:
 * - getLabelClassName : Returns custom className string for item labels with base styles and label-specific styling
 */

import type { DropdownItem } from './types'

/**
 * Get custom className for dropdown item labels
 * Applies base styles to all labels and adds specific styling based on label value
 * 
 * @param item - The dropdown item to get className for
 * @returns Custom className string with base and label-specific styles
 */
export function getLabelClassName(item: DropdownItem): string {
  // Apply base styles to all labels
  let className = 'rounded-full px-4 py-1'
  
  // Case-insensitive switch for label-specific styling
  switch (item.label.toLowerCase()) {
    case 'alice williams':
      className += ' bg-red-800 text-white'
      break
    case 'fiona apple':
      className += ' bg-blue-800 text-white'
      break
    case 'john doe':
      className += ' bg-green-800 text-white'
      break
    case 'jane smith':
      className += ' bg-purple-800 text-white'
      break
    case 'bob johnson':
      className += ' bg-yellow-800 text-white'
      break
    case 'charlie brown':
      className += ' bg-orange-800 text-white'
      break
    case 'diana prince':
      className += ' bg-pink-800 text-white'
      break
    case 'edward norton':
      className += ' bg-indigo-800 text-white'
      break
    default:
      // Default styling for any other labels
      break
  }
  
  return className
}

