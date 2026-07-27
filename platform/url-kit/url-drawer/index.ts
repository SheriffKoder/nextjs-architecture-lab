/**
 * url-drawer — URL-driven drawer system (Zod + url-params transport)
 *
 * Purpose: Public exports for schema, parser, hook, and UI shells
 * Used in: App routes that want `?drawer=&mode=&id=&action=` without global state
 * Transport: `useDrawerActions` / shells read & write via `url-params`
 *   (router fallback on RSC; shallow under `ShallowUrlProvider` on hybrid)
 */

export {
  drawerModeSchema,
  drawerActionSchema,
  drawerSearchParamsSchema,
  type DrawerSearchParams,
  type DrawerState,
} from './drawer-schema'

export { normalizeRawSearchParams, parseDrawerState } from './drawer-parser'

export { useDrawerActions } from './hooks/use-drawer-actions'

export {
  useDrawerChrome,
  useDrawerChromeOptional,
  DrawerChromeProvider,
  type DrawerChromeContextValue,
} from './providers/drawer-chrome-context'

export { default as DrawerWrapper } from './components/drawer-wrapper'
export { default as DeleteActionModal } from './components/delete-action-modal'
