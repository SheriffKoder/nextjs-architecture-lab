/**
 * @file widgets/side-nav/ui/nav-link.tsx
 * Renders one side-nav link row and orchestrates collapsed hover tooltip,
 * active styling, icon/image rendering, and mobile drawer close-on-navigate.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import MaskImage from '@/shared/ui/mask-image'
import NavTooltip from './nav-tooltip'
import { sidebarColorConfig } from '../config/config'
import { useSidebar } from '../providers/sidebar-context'

/**
 * Props for {@link NavLink}.
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
  /** Parent group name for collapsed tooltip context. */
  tooltipGroupLabel?: string
}

/**
 * Render a single side-nav link with collapsed/expanded behaviors.
 *
 * @param props - Link rendering and interaction options.
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
  style = 'light',
  tooltipGroupLabel,
}: NavLinkProps) {
  //////////////////////////////////
  // Anchor + hover state (collapsed tooltip)
  //////////////////////////////////
  const linkRef = React.useRef<HTMLAnchorElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  //////////////////////////////////
  // Tone mapping from centralized sidebar color config
  //////////////////////////////////
  const colorConfig = sidebarColorConfig[color]
  const currentColor = {
    active: colorConfig.active[style],
    inactive: colorConfig.inactive[style],
    indicator: colorConfig.indicator
  }

  //////////////////////////////////
  // Spacing + icon size scales
  //////////////////////////////////
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-4 py-2'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  }

  //////////////////////////////////
  // Image sizing fallback map for image-backed links
  //////////////////////////////////
  const imageSizeMapping = {
    sm: { width: 16, height: 16 },
    md: { width: 20, height: 20 }
  }

  const imageSize = imageSizeMapping[size]

  //////////////////////////////////
  // Icon tone resolver (active/inactive x theme)
  //////////////////////////////////
  const getIconStyle = (): string => {
    if (isActive) {
      return colorConfig.icon.active
    } else {
      return colorConfig.icon.inactive[style]
    }
  }

  //////////////////////////////////
  // Mobile drawer close on navigate
  //////////////////////////////////
  const { closeSidebar } = useSidebar()

  const handleLinkClick = () => {
    closeSidebar()
  }

  return (
    <Link
      ref={linkRef}
      href={href}
      onClick={handleLinkClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        <NavTooltip
          text={text}
          groupLabel={tooltipGroupLabel}
          color={color}
          isActive={isActive}
          show={isHovered}
          anchorRef={linkRef}
        />
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