/**
 * url-drawer — URL-driven drawer system (Zod + Next router)
 *
 * Purpose: Public exports for schema, parser, hook, and UI shells
 * Used in: App routes that want `?drawer=&mode=&id=&action=` without global state
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
