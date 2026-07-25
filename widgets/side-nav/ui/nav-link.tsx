/**
 * Navigation Link Component
 * 
 * Purpose: Reusable navigation link for sidebar
 * Used in: Sidebar header navigation
 * Why: Reduces code duplication and provides consistent styling
 * 
 * Implementation Steps:
 * 1. Create component with props for href, icon, text, and active state
 * 2. Handle active state styling with left indicator
 * 3. Support different color themes (primary/secondary)
 * 4. Apply consistent hover effects
 * 5. Support collapsed state for sidebar
 * 6. Support image URLs with MaskImage component
 */

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import MaskImage from '@/shared/ui/mask-image'
import NavTooltip from './nav-tooltip'
import { sidebarColorConfig } from '../config/config'
import { useSidebar } from '../providers/sidebar-context'

/**
 * Navigation link props interface
 * @interface NavLinkProps
 */
interface NavLinkProps {
  href: string
  icon?: LucideIcon
  imageUrl?: string
  text: string
  subtext?: string
  isActive: boolean
  color?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  isCollapsed?: boolean
  style?: 'dark' | 'light'
}

/**
 * Navigation link component
 * @param {NavLinkProps} props - Component props
 * @returns {JSX.Element} Navigation link
 */
export default function NavLink({
  href,
  icon: Icon,
  imageUrl,
  text,
  subtext,
  isActive,
  color = 'primary',
  size = 'md',
  isCollapsed = false,
  style = 'light'
}: NavLinkProps) {
  ///////////////////////
  // Get color classes from centralized config
  // Why: Single source of truth for all color styling
  // How: Uses sidebarColorConfig based on color prop and style (dark/light)
  const colorConfig = sidebarColorConfig[color]
  const currentColor = {
    active: colorConfig.active[style],
    inactive: colorConfig.inactive[style],
    indicator: colorConfig.indicator
  }

  ///////////////////////
  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-4 py-2'
  }

  ///////////////////////
  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  }

  ///////////////////////
  // Image size mapping
  const imageSizeMapping = {
    sm: { width: 16, height: 16 },
    md: { width: 20, height: 20 }
  }

  const imageSize = imageSizeMapping[size]

  ///////////////////////
  // Get icon style based on active state, color, and style
  // Why: Provide consistent icon coloring that matches text colors
  // How: Uses centralized color config for icon styles
  const getIconStyle = (): string => {
    if (isActive) {
      return colorConfig.icon.active
    } else {
      return colorConfig.icon.inactive[style]
    }
  }

  // Detect mobile and close sidebar on link click
  const { setIsSidebarOpen } = useSidebar()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLinkClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <Link
      href={href}
      onClick={handleLinkClick}
      className={`group flex items-center gap-3 text-sm font-medium transition-colors relative ${
        sizeClasses[size]
      } ${
        isActive
          ? currentColor.active
          : currentColor.inactive
      } ${isCollapsed ? 'justify-center' : ''}`}
    title={text}>
      <div className={`absolute left-0 top-0 w-[4px] h-full ${isActive ? currentColor.indicator : 'bg-transparent'}`}></div>
      
      {/* Tooltip - Only show when collapsed */}
      {isCollapsed && (
        <NavTooltip text={text} color={color} isActive={isActive} />
      )}

      {imageUrl ? (
        <MaskImage
          width={20}
          height={20}
          image={imageUrl}
          maskSize="90%"
          bgColor={isActive ? `bg-${color}` : 'bg-black'}
          className={`${isActive ? 'opacity-100' : 'opacity-50'}`}
        />
      ) : (
        Icon && <Icon className={`${iconSizeClasses[size]} ${getIconStyle()}`} />
      )}

      {!isCollapsed && (
        <div className="flex min-w-0 flex-col">
          <span className="whitespace-nowrap font-semibold">{text}</span>
          {subtext && (
            <span className={`whitespace-nowrap text-xs ${sidebarColorConfig.subtext[style]}`}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </Link>
  )
} 