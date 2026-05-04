/**
 * Avatar Component
 * 
 * Purpose: Reusable avatar component for displaying user initials or images
 * Used in: Project cards, user lists, etc.
 * Why: Provides consistent avatar styling across the application
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional image source URL
   */
  src?: string
  
  /**
   * Alt text for the image
   */
  alt?: string
  
  /**
   * Size of the avatar (default: 'default')
   */
  size?: 'sm' | 'default' | 'lg'
}

/**
 * Avatar component for displaying user avatars
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'default', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'size-6',
      default: 'size-8',
      lg: 'size-12'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          children
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Avatar fallback component for displaying initials when no image is available
 */
export const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AvatarFallback.displayName = 'AvatarFallback'
