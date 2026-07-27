/**
 * useDrawerActions — URL transitions for the drawer system
 *
 * Purpose: Imperative API to open/close drawers and toggle `action=delete` without global store
 * Used in: Page headers, tables, drawer chrome (edit / delete buttons)
 * Used for: Keeps URL as the single source of truth via `url-params` transport
 *   (router.replace on RSC, shallow history on hybrid)
 *
 * Steps:
 * 1. Read current params from `useUrlParamsTransport().buildParams()`
 * 2. Merge param updates (null removes a key)
 * 3. `commit` so back button / share URL stay predictable
 */

'use client'

import { useCallback } from 'react'
import { useUrlParamsTransport } from '@/platform/url-kit/url-params'

/////////////////////////////////////////////////////////////
// updateParams — immutable URLSearchParams patch
/////////////////////////////////////////////////////////////

/**
 * Clones current search string and applies set/delete for each entry.
 * Used in: `useDrawerActions` methods only
 * Used for: Centralizing “delete vs set” so all actions behave consistently
 */
function updateParams(
  searchParams: URLSearchParams,
  updates: Record<string, string | null>
): URLSearchParams {
  // Clone so we never mutate the instance from the transport snapshot.
  const next = new URLSearchParams(searchParams.toString())

  for (const [key, value] of Object.entries(updates)) {
    // null means “remove this param from the URL entirely”.
    if (value === null) next.delete(key)
    // Non-null writes or overwrites a single value.
    else next.set(key, value)
  }

  return next
}

/////////////////////////////////////////////////////////////
// useDrawerActions — public hook
/////////////////////////////////////////////////////////////

/**
 * Returns action callbacks that rewrite only drawer-related query keys.
 * Used in: Any client component under router context or `ShallowUrlProvider`
 */
export function useDrawerActions() {
  const { buildParams, commit, committedSnapshot } = useUrlParamsTransport()

  /**
   * Applies new query string via transport `commit`.
   * Router adapter already wraps `router.replace` in `wrapNavigation`;
   * shallow adapter updates history without an RSC flight.
   */
  const replace = useCallback(
    (next: URLSearchParams) => {
      const q = next.toString()
      if (q === committedSnapshot) return
      commit(q)
    },
    [commit, committedSnapshot],
  )

  return {
    /** Opens create flow: sets drawer key and mode create; clears id and secondary action. */
    openCreate: (drawer: string) => {
      const next = updateParams(buildParams(), {
        drawer,
        mode: 'create',
        id: null,
        action: null,
      })
      replace(next)
    },

    /** Opens read-only entity drawer — requires stable entity id. */
    openView: (drawer: string, id: string) => {
      const next = updateParams(buildParams(), {
        drawer,
        mode: 'view',
        id,
        action: null,
      })
      replace(next)
    },

    /** Opens edit mode for an existing id. */
    openEdit: (drawer: string, id: string) => {
      const next = updateParams(buildParams(), {
        drawer,
        mode: 'edit',
        id,
        action: null,
      })
      replace(next)
    },

    /** Clears all drawer params — overlay and panel should unmount. */
    close: () => {
      const next = updateParams(buildParams(), {
        drawer: null,
        mode: null,
        id: null,
        action: null,
      })
      replace(next)
    },

    /** Sets `action=delete` for confirm modal; keeps drawer/mode/id intact. */
    triggerDelete: () => {
      const next = updateParams(buildParams(), {
        action: 'delete',
      })
      replace(next)
    },

    /**
     * Table row delete entry point: sets `drawer`, `id`, and `action=delete`. Does not read or write `mode`,
     * so an open view/edit drawer keeps its mode; a bare table URL stays without `mode` (drawer stays closed per parser).
     */
    openRowDeleteConfirm: (drawer: string, id: string) => {
      const next = updateParams(buildParams(), {
        drawer,
        id,
        action: 'delete',
      })
      replace(next)
    },

    /** Clears only `action` — modal closes, drawer stays open. */
    cancelAction: () => {
      const next = updateParams(buildParams(), {
        action: null,
      })
      replace(next)
    },
  }
}
