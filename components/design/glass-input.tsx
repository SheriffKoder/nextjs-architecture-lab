/**
 * Glass Input Component
 * 
 * Purpose: Glassmorphic input field with icon support and password show/hide
 * Used in: Login forms, sign-up forms, and other input fields
 * Why: Provides consistent glassmorphic styling with flexible icon positioning
 * 
 * Function Index:
 * - GlassInput: Main component that renders input with optional icons and password toggle
 * 
 * Steps:
 * 1. Accept icon props (left/right icon, icon position)
 * 2. Handle password type with show/hide toggle
 * 3. Use Eye/EyeOff icons automatically for password fields
 * 4. Render icons in appropriate positions
 * 5. Handle controlled value and onChange
 * 6. For `type="number"`, block wheel events so scrolling the page does not increment/decrement the value
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { LucideIcon, Eye, EyeOff } from 'lucide-react'

interface GlassInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  required: boolean
  label: string
  type: string
  theme: string
  size?: 'sm' | 'md'
  labelPosition?: 'top' | 'left'
  /** Optional icon to display on the left side */
  leftIcon?: LucideIcon
  /** Optional icon to display on the right side */
  rightIcon?: LucideIcon
  /** Icon position (left or right) - only used if leftIcon or rightIcon not specified */
  iconPosition?: 'left' | 'right'
  /** Icon component (used with iconPosition) */
  icon?: LucideIcon
  /** Optional style to add to the input container */
  style?: React.CSSProperties
  /** Whether the input is disabled */
  disabled?: boolean
  /** Optional className to add to the input container */
  className?: string
}

const GlassInput = ({
  value, 
  onChange, 
  placeholder, 
  required, 
  label, 
  type, 
  theme, 
  size = 'md', 
  labelPosition = 'top',
  leftIcon,
  rightIcon,
  iconPosition = 'left',
  icon,
  style,
  disabled = false,
  className
}: GlassInputProps) => {
  ///////////////////////
  // Password show/hide state
  // Why: Allow users to toggle password visibility
  // How: State to track whether password is visible, toggles between 'password' and 'text' type
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordType = type === 'password'
  const inputRef = useRef<HTMLInputElement>(null)

  ///////////////////////
  // Number inputs: prevent mouse wheel from changing the value while scrolling the panel
  // Why: Browsers treat wheel on focused `<input type="number">` as step up/down, which is rarely intended
  // How: Non-passive `wheel` listener so `preventDefault` is honored (React’s `onWheel` is often passive)
  ///////////////////////
  useEffect(() => {
    if (type !== 'number') return
    const el = inputRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [type])

  ///////////////////////
  // Determine input type
  // Why: For password fields, toggle between 'password' and 'text' based on showPassword state
  // How: If password type and showPassword is true, use 'text', otherwise use original type
  const inputType = isPasswordType && showPassword ? 'text' : type

  ///////////////////////
  // Determine which icons to show
  // Why: Support left/right icons, and auto-show Eye/EyeOff for password fields
  // How: Priority: leftIcon/rightIcon props > icon with iconPosition > password Eye icons
  const LeftIcon = leftIcon || (icon && iconPosition === 'left' ? icon : null)
  const RightIcon = rightIcon || 
    (icon && iconPosition === 'right' ? icon : null) ||
    (isPasswordType ? (showPassword ? EyeOff : Eye) : null)

  ///////////////////////
  // Toggle password visibility
  // Why: Allow users to see/hide password text
  // How: Toggles showPassword state when Eye/EyeOff icon is clicked
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={`flex gap-2 ${className} ${labelPosition === 'top' ? 'flex-col mb-2 items-start' : 'flex-row justify-center items-center'}`} 
    style={style}>
      <label className={`block
        ${size === 'sm' && 'text-sm'}
        ${size === 'md' && 'text-base'}
        ${theme === 'light' ? 'text-black/70' : 'text-foreground/90 font-normal'}`}>
          {label}
      </label>
      
      {/* Input container with icons */}
      <div className="relative w-full">
        {/* Left Icon */}
        {LeftIcon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/70 transition-colors`}>
            <LeftIcon className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </div>
        )}

        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={onChange}
          className={`w-full 
          ${size === 'sm' && 'px-3 py-2 text-sm rounded-sm'}
          ${size === 'md' && 'px-3 py-2 text-sm rounded-sm'}
          ${LeftIcon ? (size === 'sm' ? 'pl-9' : 'pl-10') : ''}
          ${RightIcon ? (size === 'sm' ? 'pr-9' : 'pr-10') : ''}
          ${theme === 'light' && 'bg-foreground/10 border border-foreground/10 text-foreground placeholder-foreground/30'}
          ${theme === 'dark' && 'bg-[rgba(255,255,255,0.25)] md:bg-[rgba(26,26,26,0.02)] dark:md:bg-background/10  dark:bg-background/50 border border-foreground/10 text-foreground placeholder-foreground/30'}

          focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary/50 
          transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
        />

        {/* Right Icon */}
        {RightIcon && (
          <button
            type="button"
            onClick={isPasswordType ? togglePasswordVisibility : undefined}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              'text-foreground/50 hover:text-foreground/70 transition-colors'
            } ${isPasswordType ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
          >
            <RightIcon className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </button>
        )}
      </div>
    </div>
  )
}

export default GlassInput
