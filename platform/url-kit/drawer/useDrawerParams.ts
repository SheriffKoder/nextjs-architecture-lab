/**
 * useDrawerParams
 *
 * Purpose: Generic hook that syncs drawer state (drawer, mode, id, action) with URL search params
 * Used in: Entity drawer managers, open-trigger hooks, `useConfirmAction`
 * Used for: Centralised read/write of the 4-key drawer URL contract so no component reinvents param logic
 *
 * Steps:
 * 1. Read current search params and parse typed `DrawerParams`
 * 2. Expose `setParams(patch)` to merge keys into the query string (preserves filters, pagination, etc.)
 * 3. Expose convenience helpers: `clearAll`, `clearAction`, `closeDrawer`
 * 4. Derive `isOpen` from the parsed state
 */

'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  DRAWER_PARAM,
  MODE_PARAM,
  ID_PARAM,
  ACTION_PARAM,
  type DrawerMode,
  type DrawerAction,
  type DrawerParams,
  type DrawerParamsPatch,
} from './drawer.types'

/////////////////////////////////////////////////////////////
// Param keys managed by the drawer system (used during clear)
/////////////////////////////////////////////////////////////

const ALL_DRAWER_KEYS = [DRAWER_PARAM, MODE_PARAM, ID_PARAM, ACTION_PARAM] as const

/////////////////////////////////////////////////////////////
// Helpers: parse a single param as a known union member
/////////////////////////////////////////////////////////////

const VALID_MODES: readonly DrawerMode[] = ['add', 'view', 'edit']
const VALID_ACTIONS: readonly DrawerAction[] = ['delete']

//////////////////////////////////
// parseMode — coerce raw string to DrawerMode | null
// Used in: useDrawerParams (internal)
// Used for: Safe narrowing of the `mode` param
function parseMode(raw: string | null): DrawerMode | null {
  return raw && (VALID_MODES as readonly string[]).includes(raw) ? (raw as DrawerMode) : null
}
//////////////////////////////////

//////////////////////////////////
// parseAction — coerce raw string to DrawerAction | null
// Used in: useDrawerParams (internal)
// Used for: Safe narrowing of the `action` param
function parseAction(raw: string | null): DrawerAction | null {
  return raw && (VALID_ACTIONS as readonly string[]).includes(raw) ? (raw as DrawerAction) : null
}
//////////////////////////////////

/////////////////////////////////////////////////////////////
// Hook
/////////////////////////////////////////////////////////////

//////////////////////////////////
// useDrawerParams — read + write the 4-key drawer URL contract
// Used in: `car-drawer-manager.tsx`, `useConfirmAction`, open-trigger hooks
// Used for: Single source of truth for drawer URL state across entities
//////////////////////////////////
export function useDrawerParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 1. Parse current URL state
  const params: DrawerParams = useMemo(() => {
    const drawer = searchParams.get(DRAWER_PARAM)?.trim() || null
    const mode = parseMode(searchParams.get(MODE_PARAM))
    const id = searchParams.get(ID_PARAM)?.trim() || null
    const action = parseAction(searchParams.get(ACTION_PARAM))
    return { drawer, mode, id, action }
  }, [searchParams])

  // 2. Derived: drawer is open when `drawer` is set and either `mode=add` or (`mode` + `id`)
  const isOpen = useMemo(() => {
    if (!params.drawer || !params.mode) return false
    if (params.mode === 'add') return true
    return Boolean(params.id)
  }, [params])

  // 3. Core writer: merge a partial patch into the current query string, preserve everything else
  const setParams = useCallback(
    (patch: DrawerParamsPatch) => {
      const next = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined) {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }

      // When setting `mode=add`, clear `id` so stale id doesn't hang around
      if (patch.mode === 'add') {
        next.delete(ID_PARAM)
        next.delete(ACTION_PARAM)
      }

      const q = next.toString()
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  // 4. Convenience: remove all drawer-related keys (close drawer + any action)
  const clearAll = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString())
    for (const key of ALL_DRAWER_KEYS) next.delete(key)
    const q = next.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }, [router, pathname, searchParams])

  // 5. Convenience: remove `action` only (cancel confirm, keep drawer open)
  const clearAction = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete(ACTION_PARAM)
    const q = next.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }, [router, pathname, searchParams])

  return {
    ...params,
    isOpen,
    setParams,
    clearAll,
    clearAction,
    closeDrawer: clearAll,
  }
}
//////////////////////////////////
