/**
 * useDrawerActions — URL transitions for the drawer system
 *
 * Purpose: Imperative API to open/close drawers and toggle `action=delete` without global store
 * Used in: Page headers, tables, drawer chrome (edit / delete buttons)
 * Used for: Keeps Next.js URL as the single source of truth (`router.replace`, `scroll: false`)
 *
 * Steps:
 * 1. Read current pathname + search string from Next navigation hooks
 * 2. Merge param updates (null removes a key)
 * 3. Replace URL in place so back button / share URL stay predictable
 */

'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useNavigationTransitionOptional } from '@/features/ui/filters/navigation-transition-context'

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
  // Clone so we never mutate the instance from `useSearchParams()`.
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
 * Returns stable action callbacks that rewrite only drawer-related query keys.
 * Used in: Any client component under a router context
 */
export function useDrawerActions() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { wrapNavigation } = useNavigationTransitionOptional()

  /**
   * Applies new query string or strips `?` when empty.
   * Why `scroll: false`: filtering/drawer toggles should not jump scroll position.
   */
  const replace = (next: URLSearchParams) => {
    const q = next.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }

  return {
    /** Opens create flow: sets drawer key and mode create; clears id and secondary action. */
    openCreate: (drawer: string) => {
      const next = updateParams(searchParams, {
        drawer,
        mode: 'create',
        id: null,
        action: null,
      })
      replace(next)
    },

    /** Opens read-only entity drawer — requires stable entity id. */
    openView: (drawer: string, id: string) => {
      const next = updateParams(searchParams, {
        drawer,
        mode: 'view',
        id,
        action: null,
      })
      // replace(next)
      wrapNavigation(() => replace(next)) // useTransition wrapper on router.replace
    },

    /** Opens edit mode for an existing id. */
    openEdit: (drawer: string, id: string) => {
      const next = updateParams(searchParams, {
        drawer,
        mode: 'edit',
        id,
        action: null,
      })
      replace(next)
    },

    /** Clears all drawer params — overlay and panel should unmount. */
    close: () => {
      const next = updateParams(searchParams, {
        drawer: null,
        mode: null,
        id: null,
        action: null,
      })
      replace(next)
    },

    /** Sets `action=delete` for confirm modal; keeps drawer/mode/id intact. */
    triggerDelete: () => {
      const next = updateParams(searchParams, {
        action: 'delete',
      })
      replace(next)
    },

    /**
     * Table row delete entry point: sets `drawer`, `id`, and `action=delete`. Does not read or write `mode`,
     * so an open view/edit drawer keeps its mode; a bare table URL stays without `mode` (drawer stays closed per parser).
     */
    openRowDeleteConfirm: (drawer: string, id: string) => {
      const next = updateParams(searchParams, {
        drawer,
        id,
        action: 'delete',
      })
      replace(next)
    },

    /** Clears only `action` — modal closes, drawer stays open. */
    cancelAction: () => {
      const next = updateParams(searchParams, {
        action: null,
      })
      replace(next)
    },
  }
}
