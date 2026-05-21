/**
 * Sidebar Header Component
 * 
 * Purpose: Configurable vertical sidebar navigation
 * Used in: Pages that need sidebar navigation
 * Why: Follows SRP - renders navigation based on config, delegates to NavLink/ExpandableGroup
 * 
 * Implementation Steps:
 * 1. Accept navigation config as prop
 * 2. Map over config items
 * 3. Render NavLink for non-expandable items
 * 4. Render ExpandableGroup for expandable items
 * 5. Handle sidebar collapse state
 */

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronLeft, X } from 'lucide-react'
import { User } from '@/features/auth'
import NavLink from './nav-link'
import ExpandableGroup from './expandable-group'
import SidebarUserArea from './sidebar-user-area'
import SidebarLogo from './sidebar-logo'
import LogoIconPair from './logo-icon-pair'
import { sidebarConfig as config, independentButtonConfig } from '../config'
import { useSidebar } from '../contexts/sidebar-context'
import { isInternalAdmin } from '@/features/auth/roles/authorization'
import { useAppSelector } from '@/features/auth/store/hooks'
import '@/components/custom-scrollbar.css'

interface SidebarHeaderProps {
  user: User
  isScrollable?: boolean
}

export default function SidebarHeader({ user, isScrollable = false }: SidebarHeaderProps) {
  const pathname = usePathname()
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandAllSignal, setExpandAllSignal] = useState(0)
  const [collapseAllSignal, setCollapseAllSignal] = useState(0)

  const sliceUser = useAppSelector((state) => state.user.user)
  const role = useAppSelector((state) => state.user.role)
  const userWithRole = useMemo(
    () => (sliceUser ? { ...sliceUser, role } : null),
    [sliceUser, role]
  )

  const style = config.style || 'light'

  const navItems = useMemo(() => {
    const adminOnly = isInternalAdmin(userWithRole)
    if (adminOnly) return config.items
    return config.items.filter((item) => item.href !== '/admin-settings')
  }, [userWithRole])

  // Handle Expand All and Collapse All
  const hasExpandableGroups = useMemo(
    () => navItems.some((item) => Boolean(item.expandable && item.children?.length)),
    [navItems]
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

  // Helper function to get the last part of a URL path
  const getLastPathSegment = (path: string): string => {
    const segments = path.split('/').filter(Boolean)
    return segments[segments.length - 1] || ''
  }

  // Check if a nav item is active based on last path segment
  const isItemActive = (item: { href: string; children?: { href: string }[] }) => {
    const pathnameLastSegment = getLastPathSegment(pathname)
    const itemLastSegment = getLastPathSegment(item.href)
    
    if (pathnameLastSegment === itemLastSegment && pathnameLastSegment !== '') return true
    if (item.children) {
      return item.children.some(child => {
        const childLastSegment = getLastPathSegment(child.href)
        return pathnameLastSegment === childLastSegment && pathnameLastSegment !== ''
      })
    }
    return false
  }

  return (
    <div className={`fixed ${style === 'dark' ? '' : 'p-2'} min-h-screen sm:fixed md:relative z-[90] transition-all duration-300 ease-in-out ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isScrollable ? 'h-screen' : 'h-screen'}
    `}>


      <div className={`flex flex-col transition-all duration-300 ease-in-out 
      ${isCollapsed ? 'md:w-24' : 'w-[calc(100vw-16px)] md:w-[300px]'} 
      ${style === 'dark' ? 'bg-[#0f0a2b]' : 'bg-background/90 md:bg-background/20 backdrop-blur-lg border border-tertiary/10 rounded-lg'}
      ${isScrollable ? 'h-[calc(100vh-16px)] lg:h-full max-h-screen ' : 'h-[calc(100vh-16px)] lg:h-full max-h-screen min-h-[700px] '}
      }`}
      style={{
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.01)'
      }}
      >

        {/* Gradient for dark mode */}
        <div className='hidden dark:block h-[50%] w-full absolute top-0 left-0 rounded-lg z-[-1]'
        style={{
          background: 'linear-gradient(to bottom, rgba(150, 166, 207, 0.1), transparent)'
          }}/>

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

        {!isCollapsed && hasExpandableGroups && (
          <div
            className={`flex shrink-0 items-center justify-end gap-2 border-b border-tertiary/10 px-3 py-2 ${
              style === 'dark' ? 'border-white/10' : ''
            }`}
          >
            <button
              type="button"
              onClick={bumpExpandAll}
              className={`text-xs text-foreground/70 transition-colors hover:text-foreground ${
                style === 'dark' ? 'hover:text-white' : ''
              }`}
            >
              Expand all
            </button>
            <span className="text-foreground/30" aria-hidden>
              ·
            </span>
            <button
              type="button"
              onClick={bumpCollapseAll}
              className={`text-xs text-foreground/70 transition-colors hover:text-foreground ${
                style === 'dark' ? 'hover:text-white' : ''
              }`}
            >
              Collapse all
            </button>
          </div>
        )}

        {/* Navigation Links - Rendered from config */}
        <nav className={`flex-1 p-2 space-y-3 custom-scrollbar my-2
        ${isScrollable ? 'overflow-y-auto overflow-x-hidden' : ''}
        ${isCollapsed ? '' : 'overflow-y-auto'}
        `}>
          {navItems.map((item) => {
            const isActive = isItemActive(item)
            
            // Render LogoIconPair as clickable component for independent items
            // Why: Provides a clickable component using LogoIconPair for special navigation items
            // How: Uses item's independentConfig if provided, otherwise falls back to global independentButtonConfig
            if (item.independent) {
              // Use per-item config if provided, otherwise use global config
              const config = item.independentConfig || independentButtonConfig
              const itemLastSegment = getLastPathSegment(item.href)
              const pathnameLastSegment = getLastPathSegment(pathname)
              const isActiveIndependent = pathnameLastSegment === itemLastSegment && pathnameLastSegment !== ''
              
              return (
                <LogoIconPair
                  key={item.href}
                  icon1={config.icon1}
                  icon2={config.icon2}
                  backgroundColor={config.container.backgroundColor}
                  borderColor={config.container.borderColor}
                  borderRadius={config.container.borderRadius}
                  padding={config.container.padding}
                  gap={config.container.gap}
                  href={item.href}
                  isActive={isActiveIndependent}
                  style={style}
                  isCollapsed={isCollapsed}
                  styling={config.styling}
                  subtext={config.subtext}
                />
              )
            }
            
            // Render ExpandableGroup for expandable items
            if (item.expandable && item.children) {
              return (
                <ExpandableGroup
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                  style={style}
                  pathname={pathname}
                  expandAllSignal={expandAllSignal}
                  collapseAllSignal={collapseAllSignal}
                />
              )
            }
            
            // Render NavLink for regular items
            const pathnameLastSegment = getLastPathSegment(pathname)
            const itemLastSegment = getLastPathSegment(item.href)
            const isActiveLink = pathnameLastSegment === itemLastSegment && pathnameLastSegment !== ''
            
            return (
              <NavLink
                key={item.href}
                href={item.href}
                text={item.text}
                subtext={item.subtext}
                icon={item.icon}
                imageUrl={item.imageUrl}
                isActive={isActiveLink}
                color={item.color}
                size={item.size}
                isCollapsed={isCollapsed}
                style={style}
              />
            )
          })}
        </nav>



        {/* User Area */}
        <div className='relative'>
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
            <ChevronLeft className={`w-4 h-4 ${
              style === 'dark' ? 'text-white' : 'text-background/60'
            } transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        </div>
      </div>
    </div>
  )
}
