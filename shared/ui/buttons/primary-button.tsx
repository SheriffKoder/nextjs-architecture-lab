/**
 * Primary Button Component
 * 
 * Purpose: Reusable button with opacity handling and background blocking
 * Used in: Forms and actions throughout the application
 * Why: Provides consistent button styling with proper opacity behavior
 * 
 * Implementation Steps:
 * 1. Create button with primary/secondary color support
 * 2. Add white background element to block content
 * 3. Handle disabled state with opacity
 * 4. Support loading state and icons
 * 5. Add size variants for different use cases
 */

'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

/**
 * Primary button props interface
 * @interface PrimaryButtonProps
 */
interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  isLoading?: boolean
  loadingText?: string
  className?: string
  /** Button className with bg-* and text-* color classes */
  buttonClassName?: string
  size?: 'default' | 'sm'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  title?: string
}

/**
 * Primary button component
 * @param {PrimaryButtonProps} props - Component props
 * @returns {JSX.Element} Primary button
 */
export default function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  isLoading = false,
  loadingText = 'Loading...',
  className = '',
  buttonClassName = '',
  size = 'default',
  icon: Icon,
  iconPosition = 'right',
  title = ''
}: PrimaryButtonProps) {
  ///////////////////////
  // Determine if button should be disabled
  const isDisabled = disabled || isLoading

  ///////////////////////
  // Handle button click
  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick()
    }
  }

  ///////////////////////
  // Size configuration
  const sizeConfig = {
    default: {
      padding: 'py-2.5 px-4',
      iconSize: 'w-4 h-4 sm:w-5 sm:h-5',
      textSize: 'text-sm'
    },
    sm: {
      padding: 'py-2 px-3',
      iconSize: 'w-3 h-3 sm:w-4 sm:h-4',
      textSize: 'text-xs'
    }
  }

  const currentSize = sizeConfig[size]

  return (
    <div className={`relative ${className}`}>
      {/* White background element to block content behind */}
      <div 
        className="absolute inset-0 rounded-lg"
        style={{ backgroundColor: 'var(--color-background)' }}
      />
      
      {/* Button with color and opacity */}
      <button 
        type={type}
        onClick={handleClick}
        disabled={isDisabled}
        className={`relative w-full ${currentSize.padding} rounded-md cursor-pointer font-medium transition-opacity duration-200 flex items-center ${
          Icon ? 'justify-between' : 'justify-center'
        } ${
          isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'opacity-100 hover:opacity-90'
        } ${buttonClassName}`}
        title={title}
      >
        {isLoading ? (
          loadingText
        ) : (
          <>
            {/* Content with icon positioning */}
            <div className="flex items-center gap-2">
              {Icon && iconPosition === 'left' && <Icon className={currentSize.iconSize} />}
              <span className={currentSize.textSize}>{children}</span>
            </div>
            {Icon && iconPosition === 'right' && <Icon className={`${currentSize.iconSize} ml-2`} />}
          </>
        )}
      </button>
    </div>
  )
} 