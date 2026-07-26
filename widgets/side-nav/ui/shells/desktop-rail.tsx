/**
 * Desktop side-nav rail — dual nav layers + collapse chevron.
 * Ignores mobile drawer open state.
 */

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import SidebarUserArea from '../sidebar-user-area'
import SidebarLogo from '../sidebar-logo'
import NavItemsList from './nav-items-list'
import { sidebarConfig as config } from '../../config/config'
import { cn } from '@/shared/lib/utils'
import type { SideNavShellProps } from './types'

/** Must match open shell width so the absolute panel is revealed without reflow. */
const SIDEBAR_OPEN_WIDTH_PX = 300

export default function DesktopRail({ user, isScrollable = false }: SideNavShellProps) {
  const pathname = usePathname()
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

  return (
    <div
      className={cn(
        'relative hidden h-screen min-h-screen md:block',
        style === 'dark' ? '' : 'p-2',
        isScrollable ? 'h-screen' : 'h-screen',
      )}
    >
      <div
        className={cn(
          'relative flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-24' : 'w-[300px]',
          style === 'dark'
            ? 'bg-[#0f0a2b]'
            : 'bg-background/20 backdrop-blur-lg border border-tertiary/10 rounded-lg',
          isScrollable
            ? 'h-full max-h-screen'
            : 'h-full max-h-screen min-h-[700px]',
        )}
        style={{
          boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.01)',
        }}
      >
        <div
          className="hidden dark:block h-[50%] w-full absolute top-0 left-0 rounded-lg z-[-1]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(150, 166, 207, 0.1), transparent)',
          }}
        />

        {config.logo && (
          <SidebarLogo
            logo={config.logo}
            logoText={config.logoText}
            isCollapsed={isCollapsed}
          />
        )}

        <div
          className={cn(
            'relative my-2 min-h-0 flex-1',
            isCollapsed ? 'overflow-visible' : 'overflow-hidden',
          )}
        >
          <nav
            aria-hidden={!isCollapsed}
            className={cn(
              'absolute inset-0 z-[1] flex flex-col space-y-3 p-2 custom-scrollbar transition-opacity duration-300 ease-in-out',
              isCollapsed
                ? 'pointer-events-auto overflow-visible opacity-100'
                : 'pointer-events-none opacity-0',
            )}
          >
            <NavItemsList
              items={navItems}
              pathname={pathname}
              style={style}
              isCollapsed
              keyPrefix="c"
            />
          </nav>

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
            <div className="space-y-3">
              <NavItemsList
                items={navItems}
                pathname={pathname}
                style={style}
                isCollapsed={false}
                keyPrefix="o"
                expandAllSignal={expandAllSignal}
                collapseAllSignal={collapseAllSignal}
              />
            </div>
          </nav>
        </div>

        <div className="relative">
          <SidebarUserArea isCollapsed={isCollapsed} style={style} user={user} />

          <div className="absolute bottom-[40px] right-3 mt-auto flex justify-center p-4">
            <button
              type="button"
              onClick={() => setIsCollapsed((v) => !v)}
              className={cn(
                'absolute -right-6 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-colors duration-200',
                style === 'dark'
                  ? 'border border-primary bg-primary'
                  : 'border border-tertiary/20 bg-primary/60 hover:bg-foreground/5 dark:bg-tertiary',
              )}
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform duration-300',
                  style === 'dark' ? 'text-white' : 'text-background/60',
                  isCollapsed && 'rotate-180',
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
