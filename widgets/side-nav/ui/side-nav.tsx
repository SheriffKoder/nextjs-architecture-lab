/**
 * Sidebar Header Component
 *
 * Purpose: Configurable vertical sidebar navigation
 * Used in: Pages that need sidebar navigation
 * Why: Follows SRP - renders navigation based on config, delegates to NavLink/ExpandableGroup
 *
 * Dual nav layers:
 * - Collapsed: icon rail that fades out when opening
 * - Opened: absolute full-width link panel clipped by the shell, fades in when opening
 */

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronLeft, X } from 'lucide-react'
import NavLink from './nav-link'
import ExpandableGroup from './expandable-group'
import SidebarUserArea from './sidebar-user-area'
import SidebarLogo from './sidebar-logo'
import LogoIconPair from './logo-icon-pair'
import { sidebarConfig as config, independentButtonConfig } from '../config/config'
import { useSidebar } from '../providers/sidebar-context'
import { cn } from '@/shared/lib/utils'
import type { NavItemConfig } from '../model/types'

/** Temporary stub until auth is re-implemented. */
interface User {
  id: string
  email: string | null
  name: string | null
  phone?: string | null
  created_at: string
  updated_at: string
}

interface SidebarHeaderProps {
  user: User
  isScrollable?: boolean
}

/** Must match open shell width so the absolute panel is revealed without reflow. */
const SIDEBAR_OPEN_WIDTH_PX = 300

export default function SidebarHeader({ user, isScrollable = false }: SidebarHeaderProps) {
  const pathname = usePathname()
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
  const [isCollapsed, setIsCollapsed] = useState(config.defaultCollapsed ?? false)
  const [expandAllSignal, setExpandAllSignal] = useState(0)
  const [collapseAllSignal, setCollapseAllSignal] = useState(0)

  const style = config.style || 'light'
  const navItems = config.items

  const hasExpandableGroups = useMemo(
    () => navItems.some((item) => Boolean(item.expandable && item.children?.length)),
    [navItems],
  )

  const bumpExpandAll = useCallback(() => {
    setExpandAllSignal((n) => n + 1)
  }, [])

  const bumpCollapseAll = useCallback(() => {
    setCollapseAllSignal((n) => n + 1)
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const getLastPathSegment = (path: string): string => {
    const segments = path.split('/').filter(Boolean)
    return segments[segments.length - 1] || ''
  }

  const isItemActive = (item: { href: string; children?: { href: string }[] }) => {
    const pathnameLastSegment = getLastPathSegment(pathname)
    const itemLastSegment = getLastPathSegment(item.href)

    if (pathnameLastSegment === itemLastSegment && pathnameLastSegment !== '') return true
    if (item.children) {
      return item.children.some((child) => {
        const childLastSegment = getLastPathSegment(child.href)
        return pathnameLastSegment === childLastSegment && pathnameLastSegment !== ''
      })
    }
    return false
  }

  const renderNavItems = (collapsedMode: boolean) =>
    navItems.map((item: NavItemConfig) => {
      const isActive = isItemActive(item)

      if (item.independent) {
        const itemConfig = item.independentConfig || independentButtonConfig
        const itemLastSegment = getLastPathSegment(item.href)
        const pathnameLastSegment = getLastPathSegment(pathname)
        const isActiveIndependent =
          pathnameLastSegment === itemLastSegment && pathnameLastSegment !== ''

        return (
          <LogoIconPair
            key={`${collapsedMode ? 'c' : 'o'}-${item.href}`}
            icon1={itemConfig.icon1}
            icon2={itemConfig.icon2}
            backgroundColor={itemConfig.container.backgroundColor}
            borderColor={itemConfig.container.borderColor}
            borderRadius={itemConfig.container.borderRadius}
            padding={itemConfig.container.padding}
            gap={itemConfig.container.gap}
            href={item.href}
            isActive={isActiveIndependent}
            style={style}
            isCollapsed={collapsedMode}
            styling={itemConfig.styling}
            subtext={itemConfig.subtext}
          />
        )
      }

      if (item.expandable && item.children) {
        return (
          <ExpandableGroup
            key={`${collapsedMode ? 'c' : 'o'}-${item.href}`}
            item={item}
            isActive={isActive}
            isCollapsed={collapsedMode}
            style={style}
            pathname={pathname}
            expandAllSignal={expandAllSignal}
            collapseAllSignal={collapseAllSignal}
          />
        )
      }

      const pathnameLastSegment = getLastPathSegment(pathname)
      const itemLastSegment = getLastPathSegment(item.href)
      const isActiveLink =
        pathnameLastSegment === itemLastSegment && pathnameLastSegment !== ''

      return (
        <NavLink
          key={`${collapsedMode ? 'c' : 'o'}-${item.href}`}
          href={item.href}
          text={item.text}
          subtext={item.subtext}
          icon={item.icon}
          imageUrl={item.imageUrl}
          isActive={isActiveLink}
          color={item.color}
          size={item.size}
          isCollapsed={collapsedMode}
          style={style}
        />
      )
    })

  return (
    <div
      className={`fixed ${style === 'dark' ? '' : 'p-2'} min-h-screen sm:fixed md:relative z-[90] transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isScrollable ? 'h-screen' : 'h-screen'}`}
    >
      <div
        className={cn(
          // Do not overflow-hide the shell — the collapse toggle sits at -right-6 outside the rail.
          // Nav open/collapsed layers are clipped by the dual-nav viewport below.
          'relative flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'md:w-24' : 'w-[calc(100vw-16px)] md:w-[300px]',
          style === 'dark'
            ? 'bg-[#0f0a2b]'
            : 'bg-background/90 md:bg-background/20 backdrop-blur-lg border border-tertiary/10 rounded-lg',
          isScrollable
            ? 'h-[calc(100vh-16px)] lg:h-full max-h-screen'
            : 'h-[calc(100vh-16px)] lg:h-full max-h-screen min-h-[700px]',
        )}
        style={{
          boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.01)',
        }}
      >
        {/* Gradient for dark mode */}
        <div
          className="hidden dark:block h-[50%] w-full absolute top-0 left-0 rounded-lg z-[-1]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(150, 166, 207, 0.1), transparent)',
          }}
        />

        {/* Close Button - Mobile Only */}
        <div className="md:hidden absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`${
              style === 'dark'
                ? 'bg-primary/20 border border-primary/30 text-white'
                : 'bg-background border border-border text-foreground hover:bg-foreground/5'
            } w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logo Section */}
        {config.logo && (
          <SidebarLogo
            logo={config.logo}
            logoText={config.logoText}
            isCollapsed={isCollapsed}
          />
        )}

        {/* Dual nav: collapsed fades out; opened is absolute + clipped when open.
            When collapsed, allow overflow so tooltips can escape (avoid overflow-y-auto +
            overflow-x-visible — CSS coerces visible→auto and still clips). */}
        <div
          className={cn(
            'relative my-2 min-h-0 flex-1',
            isCollapsed ? 'overflow-visible' : 'overflow-hidden',
          )}
        >
          {/* Collapsed icon rail */}
          <nav
            aria-hidden={!isCollapsed}
            className={cn(
              'absolute inset-0 z-[1] flex flex-col space-y-3 p-2 custom-scrollbar transition-opacity duration-300 ease-in-out',
              isCollapsed
                ? 'pointer-events-auto overflow-visible opacity-100'
                : 'pointer-events-none opacity-0',
            )}
          >
            {renderNavItems(true)}
          </nav>

          {/* Opened link panel — fixed open width, revealed as shell widens.
              Hard-hide when collapsed so 300px width does not spill past the rail. */}
          <nav
            aria-hidden={isCollapsed}
            className={cn(
              'absolute inset-y-0 left-0 z-[2] flex flex-col p-2 custom-scrollbar transition-opacity duration-300 ease-in-out',
              isCollapsed
                ? 'invisible w-0 overflow-hidden pointer-events-none opacity-0'
                : 'visible pointer-events-auto overflow-x-hidden overflow-y-auto opacity-100',
            )}
            style={isCollapsed ? undefined : { width: SIDEBAR_OPEN_WIDTH_PX }}
          >
            {hasExpandableGroups && (
              <div
                className={cn(
                  'mb-2 flex shrink-0 items-center justify-end gap-2 border-b border-tertiary/10 px-3 py-2',
                  style === 'dark' && 'border-white/10',
                )}
              >
                <button
                  type="button"
                  onClick={bumpExpandAll}
                  className={cn(
                    'text-xs text-foreground/70 transition-colors hover:text-foreground',
                    style === 'dark' && 'hover:text-white',
                  )}
                >
                  Expand all
                </button>
                <span className="text-foreground/30" aria-hidden>
                  ·
                </span>
                <button
                  type="button"
                  onClick={bumpCollapseAll}
                  className={cn(
                    'text-xs text-foreground/70 transition-colors hover:text-foreground',
                    style === 'dark' && 'hover:text-white',
                  )}
                >
                  Collapse all
                </button>
              </div>
            )}
            <div className="space-y-3">{renderNavItems(false)}</div>
          </nav>
        </div>

        {/* User Area */}
        <div className="relative">
          <SidebarUserArea isCollapsed={isCollapsed} style={style} user={user} />

          {/* Collapse Toggle Button - Hidden below md */}
          <div className="hidden md:flex absolute bottom-[40px] right-3 mt-auto p-4 justify-center">
            <button
              onClick={toggleCollapse}
              className={`absolute ${
                style === 'dark'
                  ? '-right-6 top-4 bg-primary border border-primary'
                  : '-right-6 top-4 bg-primary/60 dark:bg-tertiary border border-tertiary/20 hover:bg-foreground/5'
              } w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm z-10`}
            >
              <ChevronLeft
                className={`w-4 h-4 ${
                  style === 'dark' ? 'text-white' : 'text-background/60'
                } transition-transform duration-300 ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
