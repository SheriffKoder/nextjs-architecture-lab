/**
 * Drawer param types
 *
 * Purpose: Shared TypeScript types and URL param key constants for the generic drawer system
 * Used in: `useDrawerParams`, `useConfirmAction`, `ConfirmRoot`, entity drawer managers
 * Used for: Single source of truth for drawer/mode/id/action URL contract
 */

/////////////////////////////////////////////////////////////
// URL param key constants
/////////////////////////////////////////////////////////////

/** Entity type: `car`, `employee`, etc. */
export const DRAWER_PARAM = 'drawer'

/** Drawer mode: `add` | `view` | `edit` */
export const MODE_PARAM = 'mode'

/** Record id for view/edit/action flows */
export const ID_PARAM = 'id'

/** Optional action intent layered on top of mode: `delete`, (later `archive`, `duplicate`, …) */
export const ACTION_PARAM = 'action'

/////////////////////////////////////////////////////////////
// Type definitions
/////////////////////////////////////////////////////////////

export type DrawerMode = 'add' | 'view' | 'edit'

/** Extensible union — only `delete` is in scope for now */
export type DrawerAction = 'delete'

/** Parsed state derived from URL search params */
export interface DrawerParams {
  drawer: string | null
  mode: DrawerMode | null
  id: string | null
  action: DrawerAction | null
}

/** Partial patch for `setParams` — only set the keys you pass */
export type DrawerParamsPatch = Partial<{
  drawer: string | null
  mode: DrawerMode | null
  id: string | null
  action: DrawerAction | null
}>
