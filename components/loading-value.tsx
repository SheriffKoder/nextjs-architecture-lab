/**
 * Loading Value Component
 * 
 * Purpose: Placeholder component for score card values when data is not available
 * Used in: ScoreCard component
 * Why: Provides consistent loading state UI for score values
 * 
 * Function Index:
 * - LoadingValue: Grey rectangle placeholder component
 */

import React from 'react'

interface LoadingValueProps {
  className?: string
}

export default function LoadingValue({ className = '' }: LoadingValueProps) {
  return (
    <div className={`rounded shimmer ${className}`}/>
  )
}
