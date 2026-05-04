/**
 * Loading Spinner Component
 * 
 * Purpose: Provides a reusable loading indicator with customizable message
 * Used in: app/virtualized-table/page.tsx
 * Why: Offers consistent loading UX across the application with configurable styling
 * 
 * Steps:
 * 1. Accept optional message and className props for customization
 * 2. Render animated spinner with loading text
 * 3. Apply default styling with option to override
 */

import React from "react";

////////////////////////////////////
// Type Definitions: Component props interface
////////////////////////////////////

/**
 * Props interface for LoadingSpinner component
 * Allows customization of message and styling
 */
interface LoadingSpinnerProps {
  // Custom message to display below the spinner (defaults to "Loading data...")
  message?: string;
  // CSS classes to apply to the container (defaults to "p-8 text-center")
  className?: string;
}

////////////////////////////////////
// Component Implementation: Reusable loading indicator
////////////////////////////////////

/**
 * Reusable loading spinner component with customizable message and styling
 * Provides consistent loading experience across the application
 * 
 * @param {LoadingSpinnerProps} props - Component configuration options
 * @param {string} [props.message="Loading data..."] - Text to display below spinner
 * @param {string} [props.className="p-8 text-center"] - CSS classes for container
 * 
 * @returns {JSX.Element} Loading spinner with animated indicator and message
 * 
 * @example
 * ```tsx
 * // Basic usage with default styling
 * <LoadingSpinner />
 * 
 * // Custom message and styling
 * <LoadingSpinner 
 *   message="Fetching projects..." 
 *   className="p-4 text-center bg-gray-50" 
 * />
 * ```
 */
export function LoadingSpinner({ 
  // Use default message if none provided
  message = "Loading data...", 
  // Use default styling if no custom classes provided
  className = "p-8 text-center" 
}: LoadingSpinnerProps) {
  return (
    // Container with customizable styling
    <div className={className}>
      {/* Flex container for centered layout with vertical spacing */}
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Animated spinner using CSS animations and border styling */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        {/* Loading message with consistent text styling */}
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
} 