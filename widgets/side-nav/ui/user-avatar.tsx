/**
 * User Avatar Component (Local)
 * 
 * Purpose: Display a single user avatar with fallback to initials
 * Used in: Sidebar user area component
 * Why: Self-contained component, no external dependencies
 */

import { useState } from 'react'
import { User as UserIcon } from 'lucide-react'

interface UserAvatarProps {
  avatar?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  border?: boolean
}

export default function UserAvatar({ 
  avatar, 
  name = 'User',
  size = 'md',
  className = '',
  border = false
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)

  // Size configurations
  const sizeClasses = {
    sm: {
      avatar: 'w-6 h-6',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      avatar: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      avatar: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-base'
    },
    xl: {
      avatar: 'w-14 h-14',
      icon: 'w-7 h-7',
      text: 'text-lg'
    }
  }

  const config = sizeClasses[size]
  const shouldShowImage = avatar && !imageError
  const shouldShowFallback = !avatar || imageError

  return (
    <div className={`${config.avatar} rounded-full overflow-hidden bg-gray-300 flex items-center justify-center ${border ? 'border-2 border-white' : ''} ${className}`}>
      {/* {shouldShowImage && (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => {
            setImageError(true)
          }}
        />
      )} */}
      
      {/* Fallback to initials or icon */}
      {/* {shouldShowFallback && ( */}
        <div className={`${config.text} text-gray-600 font-semibold leading-none`}>
          {name ? name.charAt(0).toUpperCase() : <UserIcon className={config.icon} />}
        </div>
      {/* )} */}
    </div>
  )
}

