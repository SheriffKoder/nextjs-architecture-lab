/**
 * Drawer URL schema (Zod)
 *
 * Purpose: Single validated contract for `drawer`, `mode`, `id`, and `action` search params
 * Used in: `drawer-parser.ts` — `parseDrawerState` feeds UI and hooks
 * Used for: Type-safe URL parsing; invalid combinations fall back to a closed drawer in the parser
 *
 * Steps:
 * 1. Define enums for `mode` and `action`
 * 2. Compose `drawerSearchParamsSchema` for partial URL objects
 * 3. Export inferred types for callers that only need the raw parsed shape
 */

import { z } from 'zod'

/////////////////////////////////////////////////////////////
// Zod pieces — match the URL contract in docs/darwer-system.md
/////////////////////////////////////////////////////////////

/** Allowed drawer modes in the query string (`mode=view|edit|create`). */
export const drawerModeSchema = z.enum(['view', 'edit', 'create'])

/** Optional secondary action while a row drawer is open (`action=delete`). */
export const drawerActionSchema = z.enum(['delete'])

/**
 * Partial URL object: every field is optional because users can bookmark incomplete URLs;
 * the parser derives `isOpen` only when `mode` is explicitly present (see `drawer-parser.ts`).
 */
export const drawerSearchParamsSchema = z.object({
  drawer: z.string().optional(),
  mode: drawerModeSchema.optional(),
  id: z.string().optional(),
  action: drawerActionSchema.optional(),
})

/** Shape returned by Zod after a successful parse (all keys optional). */
export type DrawerSearchParams = z.infer<typeof drawerSearchParamsSchema>

/**
 * Normalized drawer state for UI — includes derived `isOpen` so components avoid duplicating open/close rules.
 */
export type DrawerState = {
  /** Drawer key from URL (e.g. `car`), or null when closed / invalid. */
  drawer: string | null
  mode: 'view' | 'edit' | 'create'
  id: string | null
  action: 'delete' | null
  /** True when the drawer shell should mount (create without id, or view/edit with id). */
  isOpen: boolean
}
