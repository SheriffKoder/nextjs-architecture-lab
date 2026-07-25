/**
 * url-kit / view-switchers
 *
 * URL-driven view chrome variants. Each switcher lives in its own folder.
 * Shares `useViewResolution` from `minimal-controls` for `view` / `all` sync.
 *
 * ```ts
 * import {
 *   ViewSwitcherWrapper,
 *   FolderTabs,
 * } from '@/platform/url-kit/view-switchers'
 * ```
 */

export {
  ViewSwitcher,
  ViewSwitcherWrapper,
} from './view-switcher'
export type {
  ViewSwitcherOption,
  ViewSwitcherWrapperProps,
} from './view-switcher'

export { FolderTabs } from './folder-tabs'
export type { FolderTabsProps, FolderTabsConfig } from './folder-tabs'
