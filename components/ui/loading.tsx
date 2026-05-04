/**
 * Loading Component
 * 
 * Purpose: Provides a reusable loading indicator with customizable message and size
 * Used in: Suspense boundaries, async data loading states
 * Why: Offers consistent loading UX across the application
 */

import React from 'react'

interface LoadingProps {
  /** Optional message to display below the spinner */
  message?: string
  /** Size of the spinner - 'sm', 'md', or 'lg' */
  size?: 'sm' | 'md' | 'lg'
  /** Optional className for the container */
  className?: string
  /** Whether to show the message text */
  showMessage?: boolean
}

const sizeClasses = {
  sm: {
    spinner: 'h-4 w-4 border-2',
    message: 'text-xs'
  },
  md: {
    spinner: 'h-8 w-8 border-2',
    message: 'text-sm'
  },
  lg: {
    spinner: 'h-12 w-12 border-4',
    message: 'text-base'
  }
}

export function Loading({ 
  message = 'Loading...',
  size = 'md',
  className = 'flex items-center justify-center p-8',
  showMessage = true
}: LoadingProps) {
  const config = sizeClasses[size]

  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center gap-4 h-screen w-full min-h-[50vh] min-w-[200px]">
        {/* Animated spinner */}
        <div 
          className={`${config.spinner} animate-spin rounded-full border-t-transparent border-primary`}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        
        {/* Loading message */}
        {showMessage && message && (
          <p className={`${config.message} text-foreground/60`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default Loading
