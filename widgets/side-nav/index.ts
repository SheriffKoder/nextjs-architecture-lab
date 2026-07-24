/**
 * @file widgets/side-nav/index.ts
 * Public barrel for the app sidebar widget.
 */

export { default as SideNav } from './ui/side-nav'
export { default } from './ui/side-nav'

export { SidebarProvider, useSidebar } from './providers/sidebar-context'

export { default as LogoIconPair } from './ui/logo-icon-pair'
export { default as UserAvatar } from './ui/user-avatar'

export type {
  SidebarConfig,
  NavItemConfig,
  IndependentButtonConfig,
  IndependentIconConfig,
} from './model/types'
