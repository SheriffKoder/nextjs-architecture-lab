import React from 'react'
import NotificationCard, { NotificationCardConfig } from './notification-card'

interface NotificationItemsContainerProps {
  config: NotificationCardConfig[]
  onCardClick: (config: NotificationCardConfig) => void
  isLoading?: boolean
}

const NotificationItemsContainer = ({ config, onCardClick, isLoading = false }: NotificationItemsContainerProps) => {
  // Show message if not loading and no notifications
  if (!isLoading && config.length === 0) {
    return (
      <div className='flex items-center justify-center h-full w-full px-2 pb-12 border rounded-lg border-border/50'>
        <p className="text-sm text-foreground/60 dark:text-foreground/50 text-center">
          No risk notifications
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-2 w-full px-2 pb-12'>
      {config.map((cardConfig, index) => (
        <NotificationCard
          key={index}
          config={cardConfig}
          onClick={() => onCardClick(cardConfig)}
        />
      ))}
    </div>
  )
}

export default NotificationItemsContainer
