/**
 * Mobile side-nav drawer — slide-over panel with flexible-width nav list.
 * Always shows full labels (no collapsed rail / dual layers).
 */

'use client'

import React, { useMemo, useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import SidebarUserArea from '../sidebar-user-area'
import SidebarLogo from '../sidebar-logo'
import NavItemsList from './nav-items-list'
import { sidebarConfig as config } from '../../config/config'
import { useSidebar } from '../../providers/sidebar-context'
import { cn } from '@/shared/lib/utils'
import type { SideNavShellProps } from './types'

export default function MobileDrawer({ user, isScrollable = false }: SideNavShellProps) {
  const pathname = usePathname()
  const { isSidebarOpen, closeSidebar } = useSidebar()
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

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={closeSidebar}
        className={cn(
          'fixed inset-0 z-[89] bg-black/40 transition-opacity duration-300 md:hidden',
          isSidebarOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-[90] flex w-[min(100vw-16px,320px)] max-w-full p-2 transition-transform duration-300 ease-in-out md:hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isScrollable ? 'h-screen' : 'h-screen',
        )}
      >
        <div
          className={cn(
            'relative flex h-[calc(100vh-16px)] max-h-screen w-full min-w-0 flex-col rounded-lg border border-tertiary/10 backdrop-blur-lg',
            style === 'dark' ? 'bg-[#0f0a2b]' : 'bg-background/90',
            !isScrollable && 'min-h-[700px]',
          )}
          style={{
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.01)',
          }}
        >
          <div
            className="absolute left-0 top-0 z-[-1] hidden h-[50%] w-full rounded-lg dark:block"
            style={{
              background:
                'linear-gradient(to bottom, rgba(150, 166, 207, 0.1), transparent)',
            }}
          />

          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={closeSidebar}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors duration-200',
                style === 'dark'
                  ? 'border border-primary/30 bg-primary/20 text-white'
                  : 'border border-border bg-background text-foreground hover:bg-foreground/5',
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {config.logo && (
            <SidebarLogo
              logo={config.logo}
              logoText={config.logoText}
              isCollapsed={false}
            />
          )}

          <nav className="relative my-2 min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-2 custom-scrollbar">
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
            <div className="w-full min-w-0 space-y-3">
              <NavItemsList
                items={navItems}
                pathname={pathname}
                style={style}
                isCollapsed={false}
                keyPrefix="m"
                expandAllSignal={expandAllSignal}
                collapseAllSignal={collapseAllSignal}
              />
            </div>
          </nav>

          <div className="relative w-full min-w-0">
            <SidebarUserArea isCollapsed={false} style={style} user={user} />
          </div>
        </div>
      </div>
    </>
  )
}
