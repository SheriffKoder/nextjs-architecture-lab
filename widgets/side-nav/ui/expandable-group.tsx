/**
 * Expandable Group Component
 * 
 * Purpose: Handles expandable navigation groups with sub-items
 * Used in: Side navigation for items with expandable=true
 * Why: Follows SRP - single responsibility for expandable navigation groups
 * 
 * Implementation Steps:
 * 1. Manage open/closed state for the group
 * 2. Handle hover state for collapsed sidebar
 * 3. Render parent button with chevron icon
 * 4. Render children as NavLink components
 * 5. Support both expanded and collapsed sidebar states
 */

'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import NavLink from './nav-link'
import NavTooltip from './nav-tooltip'
import LogoIconPair from './logo-icon-pair'
import { NavItemConfig } from '../model/types'
import { independentButtonConfig } from '../config/config'
import { cn } from '@/shared/lib/utils'

interface ExpandableGroupProps {
  item: NavItemConfig
  isActive: boolean
  isCollapsed: boolean
  style?: 'dark' | 'light'
  pathname: string
  /** Incremented from parent to open all groups; 0 means no command yet */
  expandAllSignal: number
  /** Incremented from parent to close all groups; 0 means no command yet */
  collapseAllSignal: number
}

export default function ExpandableGroup({
  item,
  isActive,
  isCollapsed,
  style = 'light',
  pathname,
  expandAllSignal,
  collapseAllSignal
}: ExpandableGroupProps) {
  // Helper function to get the last part of a URL path
  const getLastPathSegment = (path: string): string => {
    const segments = path.split('/').filter(Boolean)
    return segments[segments.length - 1] || ''
  }

  // Check if parent or any child is active based on last path segment
  const pathnameLastSegment = getLastPathSegment(pathname)
  const itemLastSegment = getLastPathSegment(item.href)
  const isParentActive = pathnameLastSegment === itemLastSegment && pathnameLastSegment !== ''
  const isAnyChildActive = item.children?.some(child => {
    const childLastSegment = getLastPathSegment(child.href)
    return pathnameLastSegment === childLastSegment && pathnameLastSegment !== ''
  }) || false
  const isGroupActive = isParentActive || isAnyChildActive

  // one-way sync: when the route matches the group (isGroupActive), set isOpen to true; never set it false from pathname so manual opens persist when navigating away
  // Open on load if this group matches the route or defaultOpen; user toggles persist when leaving the route
  const [isOpen, setIsOpen] = useState(() => {
    if (!item.children) return !!item.defaultOpen
    const seg = getLastPathSegment(pathname)
    const parentSeg = getLastPathSegment(item.href)
    const parentMatch = seg === parentSeg && seg !== ''
    const childMatch = item.children.some((child) => {
      const childSeg = getLastPathSegment(child.href)
      return seg === childSeg && seg !== ''
    })
    return parentMatch || childMatch || !!item.defaultOpen
  })
  const [isHovered, setIsHovered] = useState(false)

  // When navigating into this group's routes, open if it was closed; do not auto-close when leaving (preserves manual state)
  useEffect(() => {
    if (isGroupActive) {
      setIsOpen(true)
    }
  }, [isGroupActive])

  useEffect(() => {
    if (expandAllSignal === 0) return
    setIsOpen(true)
  }, [expandAllSignal])

  useEffect(() => {
    if (collapseAllSignal === 0) return
    setIsOpen(false)
  }, [collapseAllSignal])

  // Toggle open state
  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  // Handle hover for collapsed sidebar
  const handleMouseEnter = () => {
    if (isCollapsed) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setIsHovered(false)
    }
  }

  const Icon = item.icon

  /** Closed: muted text + chevron; open: tertiary for label, icon, and chevron */
  const triggerTone = isOpen ? 'text-foreground/70' : 'text-foreground/70'

  return (
    <div
      className="relative overflow-visible"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        tabIndex={0}
        onClick={toggleOpen}
        className={cn(
          'group relative flex w-full items-center justify-between px-4 pt-2 pb-0 text-left text-sm font-medium transition-colors',
          isCollapsed ? 'justify-center' : 'cursor-pointer',
          triggerTone
        )}
      >
        {/* Selection within group (current route matches parent or a child) */}
        {/* {isGroupActive && (
          <span
            className={cn(
              'absolute size-1.5 rounded-full bg-tertiary',
              isCollapsed ? 'right-1.5 top-1.5' : 'left-1.5 top-1/2 -translate-y-1/2'
            )}
            aria-hidden
          />
        )} */}

        <div className={cn('flex flex-1 items-center gap-3', isCollapsed && 'justify-center')}>
          {/* {Icon && <Icon className={cn('size-5 shrink-0', triggerTone)} />} */}
          {!isCollapsed && (
            <span className={cn('min-w-0 flex-1 whitespace-nowrap text-xs', triggerTone)}>
              {item.text}
            </span>
          )}
        </div>

        {!isCollapsed && (
          <ChevronDown
            className={cn('size-4 shrink-0 transition-transform', triggerTone, isOpen && 'rotate-180')}
            aria-hidden
          />
        )}
        
        {/* Tooltip - Only show when collapsed */}
        {isCollapsed && (
          <NavTooltip text={item.text} color={item.color || 'primary'} isActive={isGroupActive} />
        )}
      </button>

      {/* Expanded dropdown: stays mounted while open so state persists; hidden (not unmounted) when sidebar is collapsed */}
      {isOpen && item.children && (
        <div
          aria-hidden={isCollapsed ? true : undefined}
          className={`mt-1 ml-2 space-y-1 ${isCollapsed ? 'hidden' : ''}`}
        >
          {item.children.map((child) => {
            // Render LogoIconPair for independent links
            if (child.independent) {
              // Use per-item config if provided, otherwise use global config
              const config = child.independentConfig || independentButtonConfig
              const childLastSegment = getLastPathSegment(child.href)
              const isChildActive = pathnameLastSegment === childLastSegment && pathnameLastSegment !== ''
              
              return (
                <LogoIconPair
                  key={child.href}
                  icon1={config.icon1}
                  icon2={config.icon2}
                  backgroundColor={config.container.backgroundColor}
                  borderColor={config.container.borderColor}
                  borderRadius={config.container.borderRadius}
                  padding={config.container.padding}
                  gap={config.container.gap}
                  href={child.href}
                  isActive={isChildActive}
                  style={style}
                  isCollapsed={false}
                  styling={config.styling}
                  subtext={config.subtext}
                />
              )
            }
            
            // Render NavLink for regular links
            const childLastSegment = getLastPathSegment(child.href)
            const isChildActive = pathnameLastSegment === childLastSegment && pathnameLastSegment !== ''
            
            return (
            <NavLink
              key={child.href}
              href={child.href}
              text={child.text}
                subtext={child.subtext}
              icon={child.icon}
              imageUrl={child.imageUrl}
              isActive={isChildActive}
              color={child.color || 'secondary'}
              size={child.size || 'sm'}
              isCollapsed={false}
              style={style}
            />
            )
          })}
        </div>
      )}

      {/* Collapsed Hover Menu */}
      {item.children && (
        <div className={`space-y-1 overflow-visible transition-all duration-300 ease-in-out ${
          isCollapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 w-0'
        }`}>
          {item.children?.map((child) => {
            // Render LogoIconPair for independent links
            if (child.independent) {
              // Use per-item config if provided, otherwise use global config
              const config = child.independentConfig || independentButtonConfig
              const childLastSegment = getLastPathSegment(child.href)
              const isChildActive = pathnameLastSegment === childLastSegment && pathnameLastSegment !== ''
              
              return (
                <LogoIconPair
                  key={child.href}
                  icon1={config.icon1}
                  icon2={config.icon2}
                  backgroundColor={config.container.backgroundColor}
                  borderColor={config.container.borderColor}
                  borderRadius={config.container.borderRadius}
                  padding={config.container.padding}
                  gap={config.container.gap}
                  href={child.href}
                  isActive={isChildActive}
                  style={style}
                  isCollapsed={true}
                  styling={config.styling}
                  subtext={config.subtext}
                />
              )
            }
            
            // Render NavLink for regular links
            const childLastSegment = getLastPathSegment(child.href)
            const isChildActive = pathnameLastSegment === childLastSegment && pathnameLastSegment !== ''
            
            return (
            <NavLink
              key={child.href}
              href={child.href}
              text={child.text}
                subtext={child.subtext}
              icon={child.icon}
              imageUrl={child.imageUrl}
              isActive={isChildActive}
              color={child.color || 'primary'}
              size={child.size || 'sm'}
              isCollapsed={true}
              style={style}
            />
            )
          })}
        </div>
      )}
    </div>
  )
}

