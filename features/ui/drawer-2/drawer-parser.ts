/**
 * Drawer state parser
 *
 * Purpose: Turn raw Next.js search params into a single `DrawerState` object
 * Used in: `DrawerWrapper`, `DeleteActionModal`, RSC/layout code that has `searchParams`
 * Used for: One place for open/close rules so URL stays the source of truth
 *
 * Steps:
 * 1. Normalize `string | string[]` values to single strings (App Router compatibility)
 * 2. Run Zod `safeParse` — on failure, return a safe “closed” state
 * 3. Default returned `mode` to `view` when omitted (for a stable `DrawerState` shape); `isOpen` does not use this default
 * 4. Derive `isOpen`: only when `mode` is explicitly present — create without id, or view/edit with id
 */

import {
  drawerSearchParamsSchema,
  type DrawerState,
} from './drawer-schema'

/////////////////////////////////////////////////////////////
// Normalize raw search params (Next may pass `string[]` for a key)
/////////////////////////////////////////////////////////////

/**
 * Collapses `string | string[] | undefined` to `string | undefined` using the first array element.
 * Why: Zod schema expects strings; `Record` from `page` can contain arrays.
 */
export function normalizeRawSearchParams(
  raw: Record<string, string | string[] | undefined>
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  // Walk each key so we never pass arrays into Zod string fields.
  for (const [key, value] of Object.entries(raw)) {
    // Skip missing keys — parser / Zod treat omissions as optional.
    if (value === undefined) continue
    // Take first entry when Next collapses duplicates into an array.
    const scalar = Array.isArray(value) ? value[0] : value
    out[key] = scalar
  }
  return out
}

/////////////////////////////////////////////////////////////
// parseDrawerState — URL → DrawerState
/////////////////////////////////////////////////////////////

/**
 * Parses and validates drawer-related search params.
 * Used in: Client wrappers reading `useSearchParams()`, server code passing `searchParams` object
 * Used for: Feeding `RightDrawer` visibility and delete-modal open state
 *
 * @param raw - Typically `searchParams` from the page or `Object.fromEntries(urlSearchParams)`
 * @returns Normalized `DrawerState`; invalid URLs yield `isOpen: false` and null ids.
 */
export function parseDrawerState(
  raw: Record<string, string | string[] | undefined>
): DrawerState {
  // Reduce to plain strings so Zod never sees an unexpected array.
  const flat = normalizeRawSearchParams(raw)
  // safeParse avoids throwing on bad user input (tampered URLs).
  const parsed = drawerSearchParamsSchema.safeParse(flat)

  // Any validation failure → treat as fully closed drawer (explicit state machine default).
  if (!parsed.success) {
    return {
      drawer: null,
      mode: 'view',
      id: null,
      action: null,
      isOpen: false,
    }
  }

  const { drawer, mode, id, action } = parsed.data
  // Stable normalized mode for consumers; when `mode` was omitted from the URL, `isOpen` is still false below.
  const resolvedMode = mode ?? 'view'

  // Drawer shell opens only when `mode` is explicitly set (no implicit view). Omitting `mode` allows e.g.
  // `drawer` + `id` + `action=delete` so `DeleteActionModal` can open without mounting `DrawerWrapper` content.
  const isOpen =
    mode === 'create' ||
    ((mode === 'view' || mode === 'edit') && !!id)

  return {
    drawer: drawer ?? null,
    mode: resolvedMode,
    id: id ?? null,
    action: action ?? null,
    isOpen,
  }
}
