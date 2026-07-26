/**
 * Logo Icon Pair Component
 * 
 * Purpose: Displays a pair of icon images with configurable styling
 * Used in: Development pages, logo displays
 * Why: Reusable component for displaying icon pairs with consistent styling
 * 
 * Function Index:
 * - LogoIconPair: Main component that renders two icon images side by side
 * 
 * Steps:
 * 1. Accept configuration for both icons (image URL, color, size)
 * 2. Accept container styling (background, border, border radius)
 * 3. Render container with configurable styling
 * 4. Render each icon using MaskImage component with hex color
 * 5. Apply individual border radius to each icon container
 */

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import MaskImage from '@/shared/ui/mask-image'
import { useSidebar } from '../providers/sidebar-context'
import { LucideIcon } from 'lucide-react'

interface IconConfig {
  /** Image URL for the icon */
  imageUrl?: string
  /** Image URL for dark mode (used when theme is dark) */
  imageUrlDark?: string
  /** Hex color for the icon (e.g., '#3B82F6') */
  color?: string
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Border radius class (e.g., 'rounded-md', 'rounded-xl') - default: 'rounded-xl' */
  borderRadius?: string
  /** Text to display instead of icon (alternative to imageUrl) */
  text?: string
  /** Text color class when using text instead of icon */
  textColor?: string
  /** Lucide icon component (alternative to imageUrl) */
  lucideIcon?: LucideIcon
  /** Size for Lucide icon in pixels (default: 20) */
  lucideIconSize?: number
  /** Color class for Lucide icon */
  lucideIconColor?: string
}

interface LogoIconPairProps {
  /** Configuration for the first icon */
  icon1: IconConfig
  /** Configuration for the second icon */
  icon2?: IconConfig
  /** Configuration for the right icon (displayed on the right side) */
  iconRight?: IconConfig
  /** Container background color class */
  backgroundColor?: string
  /** Container border color class */
  borderColor?: string
  /** Container border radius class (e.g., 'rounded-xl') - default: 'rounded-xl' */
  borderRadius?: string
  /** Container padding class */
  padding?: string
  /** Container gap between icons */
  gap?: string
  /** Optional href to make component clickable */
  href?: string
  /** Active state for styling */
  isActive?: boolean
  /** Style theme (dark/light) */
  style?: 'dark' | 'light'
  /** Collapsed state */
  isCollapsed?: boolean
  /** Styling configuration for active/inactive states */
  styling?: {
    active: {
      dark: string
      light: string
    }
    inactive: {
      dark: string
      light: string
    }
  }
  /** Optional subtext to display below the second icon */
  subtext?: string
}

export default function LogoIconPair({
  icon1,
  icon2,
  iconRight,
  backgroundColor = '',
  borderColor = 'border',
  borderRadius = 'rounded-xl',
  padding = 'p-2',
  gap = 'gap-2',
  href,
  isActive = false,
  style = 'light',
  isCollapsed = false,
  styling,
  subtext
}: LogoIconPairProps) {
  ///////////////////////
  // Theme detection for dark mode image
  // Why: Support different images for light and dark themes
  // How: Uses next-themes to detect current theme
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get the appropriate image URL based on theme
  const getIcon1ImageUrl = (): string | undefined => {
    if (!mounted) {
      // Return light mode image during SSR to avoid hydration mismatch
      return icon1.imageUrl
    }
    // Use dark mode image if theme is dark and imageUrlDark is provided
    if (theme === 'dark' && icon1.imageUrlDark) {
      return icon1.imageUrlDark
    }
    return icon1.imageUrl
  }

  const icon1ImageUrl = getIcon1ImageUrl()

  // Close mobile drawer on navigate (desktop rail ignores drawer state)
  const { closeSidebar } = useSidebar()

  const handleLinkClick = () => {
    if (href) {
      closeSidebar()
    }
  }

  ///////////////////////
  // Get border radius class for icons
  // Why: Allow individual border radius configuration for each icon
  // How: Uses provided borderRadius or defaults to 'rounded-xl'
  const getIconBorderRadius = (iconBorderRadius?: string): string => {
    return iconBorderRadius || 'rounded-xl'
  }

  ///////////////////////
  // Get active/hover state classes
  // Why: Provide visual feedback for active and hover states
  // How: Uses styling config from props or falls back to default values
  const getStateClasses = (): string => {
    if (!styling) {
      // Fallback to default styling if not provided
      if (isActive) {
        return style === 'dark' 
          ? 'bg-primary/20 border-primary/30' 
          : 'bg-primary/10 border-primary/30'
      }
      return style === 'dark'
        ? 'hover:bg-primary/10 border-transparent hover:border-primary/20'
        : 'hover:bg-gray-100 border-transparent hover:border-gray-300'
    }
    
    // Use styling config from props
    if (isActive) {
      return styling.active[style]
    }
    return styling.inactive[style]
  }

  ///////////////////////
  // Helper function to render an icon (supports image, Lucide icon, or text)
  // Why: Centralize icon rendering logic for reuse
  const renderIcon = (icon: IconConfig, isIcon1: boolean = false) => {
    // Render Lucide icon if provided
    if (icon.lucideIcon) {
      const IconComponent = icon.lucideIcon
      const size = icon.lucideIconSize || 20
      const colorClass = icon.lucideIconColor || 'text-foreground'
      return (
        <IconComponent 
          size={size} 
          className={colorClass}
        />
      )
    }
    
    // Render image if imageUrl is provided
    if (icon.imageUrl && icon.width && icon.height) {
      const imageUrl = isIcon1 ? getIcon1ImageUrl() : icon.imageUrl
      if (imageUrl) {
        return (
          <div 
            className={`${getIconBorderRadius(icon.borderRadius)} overflow-hidden ${
              isIcon1 && icon.imageUrlDark ? 'dark:invert' : 'dark:invert'
            }`}
            style={{ width: `${icon.width}px`, height: `${icon.height}px` }}
          >
            <MaskImage
              width={icon.width}
              height={icon.height}
              image={imageUrl}
              bgColor={icon.color || '#000000'}
              maskSize="90%"
              className="w-full h-full"
            />
          </div>
        )
      }
    }
    
    // Render text if provided
    if (icon.text) {
      return (
        <span 
          className={`text-sm font-medium whitespace-nowrap ${icon.textColor || 'text-foreground'}`}
        >
          {icon.text}
        </span>
      )
    }
    
    return null
  }

  ///////////////////////
  // Container content - icons
  // Why: Reusable content for both link and non-link versions
  const iconContent = (
    <>
      {isCollapsed ? (
        // Collapsed: Show only first icon centered
        renderIcon(icon1, true)
      ) : (
        // Expanded: Show both icons with optional subtext below icon2, and iconRight on the right
        <>
          <div className="flex items-center gap-2 flex-1">
            {renderIcon(icon1, true)}
            <div className={`flex flex-col ${icon2?.text ? 'justify-center' : 'items-start'}`}>
              {icon2 && renderIcon(icon2)}
              {/* Subtext below icon2 */}
              {subtext && (
                <span className={`text-xs ml-1 ${
                  style === 'dark' 
                    ? 'text-white/50' 
                    : 'text-foreground/50 font-normal dark:font-light'
                }
                `}
                style={{ color: !icon2 ? icon1.color : '' }}>
                  {subtext}
                </span>
              )}
            </div>
          </div>
          {/* Render iconRight on the right side */}
          {iconRight && (
            <div className="flex items-center">
              {renderIcon(iconRight)}
            </div>
          )}
        </>
      )}
    </>
  )

  const containerClasses = `
    ${padding} 
    flex flex-row items-center ${iconRight ? 'justify-between' : 'justify-start'}
    ${gap} 
    w-full
    ${borderColor} 
    ${borderRadius}
    ${backgroundColor}
    ${href ? `transition-all duration-200 cursor-pointer border ${getStateClasses()} ${isCollapsed ? 'justify-center' : ''}` : ''}
  `

  // If href is provided, wrap in Link component
  if (href) {
    return (
      <Link href={href} onClick={handleLinkClick} className={containerClasses}>
        {iconContent}
      </Link>
    )
  }

  // Otherwise, render as regular div
  return (
    <div className={containerClasses}>
      {iconContent}
    </div>
  )
}
