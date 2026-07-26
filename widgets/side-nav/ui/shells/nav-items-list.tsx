/**
 * Shared nav item list for mobile and desktop shells.
 */

'use client'

import React from 'react'
import NavLink from '../nav-link'
import ExpandableGroup from '../expandable-group'
import LogoIconPair from '../logo-icon-pair'
import { independentButtonConfig } from '../../config/config'
import { getLastPathSegment, isNavItemActive } from '../../lib'
import type { NavItemConfig } from '../../model/types'

export interface NavItemsListProps {
  items: NavItemConfig[]
  pathname: string
  style: 'dark' | 'light'
  /** Desktop collapsed rail uses true; mobile always false. */
  isCollapsed: boolean
  /** Prefix keys so dual-layer desktop mounts stay distinct. */
  keyPrefix: string
  expandAllSignal?: number
  collapseAllSignal?: number
}

export default function NavItemsList({
  items,
  pathname,
  style,
  isCollapsed,
  keyPrefix,
  expandAllSignal = 0,
  collapseAllSignal = 0,
}: NavItemsListProps) {
  return (
    <>
      {items.map((item: NavItemConfig) => {
        const isActive = isNavItemActive(pathname, item)
        const key = `${keyPrefix}-${item.href}`

        if (item.independent) {
          const itemConfig = item.independentConfig || independentButtonConfig
          const itemLastSegment = getLastPathSegment(item.href)
          const pathnameLastSegment = getLastPathSegment(pathname)
          const isActiveIndependent =
            pathnameLastSegment === itemLastSegment && pathnameLastSegment !== ''

          return (
            <LogoIconPair
              key={key}
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
              isCollapsed={isCollapsed}
              styling={itemConfig.styling}
              subtext={itemConfig.subtext}
            />
          )
        }

        if (item.expandable && item.children) {
          return (
            <ExpandableGroup
              key={key}
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

        const pathnameLastSegment = getLastPathSegment(pathname)
        const itemLastSegment = getLastPathSegment(item.href)
        const isActiveLink =
          pathnameLastSegment === itemLastSegment && pathnameLastSegment !== ''

        return (
          <NavLink
            key={key}
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
    </>
  )
}
