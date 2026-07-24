/**
 * @file shared/ui/loading-skeletons/loading-value/loading-value.tsx
 * Shimmer rectangle used as a loading placeholder across skeletons and widgets.
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
