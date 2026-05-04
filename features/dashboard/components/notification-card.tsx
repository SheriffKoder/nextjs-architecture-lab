/**
 * Notification Card Component
 * 
 * Purpose: Displays a risk notification with icon, title, subtitle, and chevron
 * Used in: NotificationItemsContainer
 * Why: Provides consistent display for risk notifications
 */

import React from 'react'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import LoadingValue from '@/components/loading-value'

export type RiskLevel = 'high' | 'medium' | 'low'

export interface NotificationCardConfig {
  title: string
  subtitle: string
  risk?: RiskLevel
}

interface NotificationCardProps {
  config: NotificationCardConfig
  onClick: () => void
}

export default function NotificationCard({ config, onClick }: NotificationCardProps) {
  const { title, subtitle, risk } = config
  const isLoading = !risk

  // Get icon and color based on risk level
  const getRiskIcon = () => {
    if (isLoading) {
      return <LoadingValue className="w-5 h-5 md:w-6 md:h-6" />
    }
    switch (risk) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
      case 'medium':
        return <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
      case 'low':
        return <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
      default:
        return <Info className="w-5 h-5 md:w-6 md:h-6 text-foreground/60" />
    }
  }

  return (
    <div
      onClick={isLoading ? undefined : onClick}
      className={`flex items-center gap-3 md:gap-4 px-1 py-2 md:p-2 
      border 
      bg-tertiary/10 border-[rgba(0,0,0,0.03)]
    dark:bg-tertiary/10 dark:border-[rgba(255,255,255,0.05)]
      rounded-lg ${isLoading ? '' : 'cursor-pointer hover:bg-muted/50 transition-colors'}`}
    >
      {/* Risk Icon */}
      <div className="flex-shrink-0 ml-1">
        {getRiskIcon()}
      </div>

      {/* Title and Subtitle */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {isLoading ? (
          <>
            <LoadingValue className="w-24 md:w-32 h-4 md:h-5 mb-1" />
            <LoadingValue className="w-32 md:w-40 h-3 md:h-4" />
          </>
        ) : (
          <>
            <h3 className="text-xs md:text-sm font-semibold text-foreground truncate">
              {title}
            </h3>
            <p className="text-[10px] md:text-xs text-foreground/70 truncate">
              {subtitle}
            </p>
          </>
        )}
      </div>

      {/* Chevron Icon */}
      <div className="flex-shrink-0">
        {isLoading ? (
          <LoadingValue className="w-4 h-4 md:w-5 md:h-5" />
        ) : (
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-foreground/60" />
        )}
      </div>
    </div>
  )
}
