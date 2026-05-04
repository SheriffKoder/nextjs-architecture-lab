/**
 * Glass Login Form Component
 * 
 * Purpose: Login form using GlassInput and PrimaryButton components
 * Used in: Login pages and authentication flows
 * Why: Provides consistent glassmorphic design with proper form validation
 * 
 * Function Index:
 * - GlassLoginForm: Main component that renders login form with email, password, and submit button
 * 
 * Steps:
 * 1. Create form with email and password fields
 * 2. Add Mail icon to email field
 * 3. Password field auto-shows Eye/EyeOff icons
 * 4. Login button disabled until both fields are filled
 * 5. Add "Forgot your password?" link with underline
 * 6. Layout in flex-col
 */

'use client'

import React, { useState } from 'react'
import { Mail } from 'lucide-react'
import GlassInput from '../../../components/design/glass-input'
import PrimaryButton from '../../../components/design/primary-button'
import Link from 'next/link'

interface GlassLoginFormProps {
  /** Theme for the form ('light' or 'dark') */
  theme?: 'light' | 'dark'
  /** Size of inputs ('sm' or 'md') */
  size?: 'sm' | 'md'
  /** Label position ('top' or 'left') */
  labelPosition?: 'top' | 'left'
  /** Callback when form is submitted */
  onSubmit?: (email: string, password: string) => void
  /** URL for forgot password link */
  forgotPasswordUrl?: string
  /** Loading state for submit button */
  isLoading?: boolean
  /** Error message to display */
  error?: string | null
  /** Custom className for the form container */
  className?: string
}

const GlassLoginForm = ({
  theme = 'dark',
  size = 'md',
  labelPosition = 'top',
  onSubmit,
  forgotPasswordUrl = '/auth/forgot-password',
  isLoading = false,
  error = null,
  className = ''
}: GlassLoginFormProps) => {
  ///////////////////////
  // Form state
  // Why: Track email and password values for controlled inputs
  // How: useState hooks to manage form field values
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  ///////////////////////
  // Form validation
  // Why: Disable login button until both fields are filled
  // How: Check if both email and password have values
  const isFormValid = email.trim() !== '' && password.trim() !== ''

  ///////////////////////
  // Handle form submission
  // Why: Process login when form is submitted
  // How: Prevent default form submission, call onSubmit callback if provided
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid && onSubmit) {
      onSubmit(email, password)
    }
  }

  ///////////////////////
  // Handle email change
  // Why: Update email state when user types
  // How: Extract value from event and update state
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  ///////////////////////
  // Handle password change
  // Why: Update password state when user types
  // How: Extract value from event and update state
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 w-full ${className}`}>
      {/* Email Field */}
      <GlassInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        required
        value={email}
        onChange={handleEmailChange}
        theme={theme}
        size={size}
        labelPosition={labelPosition}
        rightIcon={Mail}
      />

      {/* Password Field */}
      <GlassInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        required
        value={password}
        onChange={handlePasswordChange}
        theme={theme}
        size={size}
        labelPosition={labelPosition}
      />

      {/* Login Button */}
      <PrimaryButton
        type="submit"
        disabled={!isFormValid || isLoading}
        isLoading={isLoading}
        loadingText="Logging in..."
        buttonClassName="bg-tertiary text-white"
        size={size === 'sm' ? 'sm' : 'default'}
      >
        Login
      </PrimaryButton>

      {/* Error Message */}
      {error && (
        <div className={`text-sm text-center mt-2 ${
          theme === 'light' 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-red-400 dark:text-red-500'
        }`}>
          {error}
        </div>
      )}

      {/* Forgot Password Link */}
      {/* <div className="flex justify-center">
        <Link
          href={forgotPasswordUrl}
          className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} cursor-pointer underline underline-offset-2 ${
            theme === 'light' ? 'text-black/70 hover:text-black' : 'text-foreground/70 hover:text-foreground'
          } transition-colors`}
        >
          Forgot your password?
        </Link>
      </div> */}
    </form>
  )
}

export default GlassLoginForm
