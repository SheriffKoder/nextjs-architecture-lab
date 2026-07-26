/**
 * SideNav — orchestrates mobile drawer + desktop rail shells.
 */

'use client'

import React from 'react'
import { DesktopRail, MobileDrawer, type SideNavUser } from './shells'

interface SidebarHeaderProps {
  user: SideNavUser
  isScrollable?: boolean
}

export default function SidebarHeader({ user, isScrollable = false }: SidebarHeaderProps) {
  return (
    <>
      <MobileDrawer user={user} isScrollable={isScrollable} />
      <DesktopRail user={user} isScrollable={isScrollable} />
    </>
  )
}
