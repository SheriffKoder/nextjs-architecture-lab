✅ Typed URL schema (Zod)
✅ Single source of truth for parsing
✅ Clean actions API
✅ Support for RSC + client
✅ action=delete instead of confirmDelete
✅ Minimal but explicit URL contract

🧱 Final URL Contract
?drawer=car
&mode=view | edit | create
&id=123
&action=delete   (optional)

🧠 State Model
type DrawerState = {
  drawer: string | null
  mode: 'view' | 'edit' | 'create'
  id: string | null
  action: 'delete' | null
}

📦 Install Zod
npm install zod

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
// Files

📁 platform/url-kit/url-drawer/drawer-schema.ts
import { z } from 'zod'

export const drawerModeSchema = z.enum(['view', 'edit', 'create'])
export const drawerActionSchema = z.enum(['delete'])

export const drawerSearchParamsSchema = z.object({
  drawer: z.string().optional(),
  mode: drawerModeSchema.optional(),
  id: z.string().optional(),
  action: drawerActionSchema.optional(),
})

export type DrawerSearchParams = z.infer<typeof drawerSearchParamsSchema>

export type DrawerState = {
  drawer: string | null
  mode: 'view' | 'edit' | 'create'
  id: string | null
  action: 'delete' | null
  isOpen: boolean
}

///////////////////////////////////////////////////////////////
📁 platform/url-kit/url-drawer/drawer-parser.ts
import { drawerSearchParamsSchema, type DrawerState } from './drawer-schema'

export function parseDrawerState(
  raw: Record<string, string | string[] | undefined>
): DrawerState {
  const parsed = drawerSearchParamsSchema.safeParse(raw)

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

  const resolvedMode = mode ?? 'view'

  const isOpen =
    resolvedMode === 'create' ||
    ((resolvedMode === 'view' || resolvedMode === 'edit') && !!id)

  return {
    drawer: drawer ?? null,
    mode: resolvedMode,
    id: id ?? null,
    action: action ?? null,
    isOpen,
  }
}


///////////////////////////////////////////////////////////////
📁 platform/url-kit/url-drawer/hooks/use-drawer-actions.ts
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

function updateParams(
  searchParams: URLSearchParams,
  updates: Record<string, string | null>
) {
  const next = new URLSearchParams(searchParams.toString())

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) next.delete(key)
    else next.set(key, value)
  })

  return next
}

export function useDrawerActions() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const replace = (next: URLSearchParams) => {
    const q = next.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }

  return {
    openCreate: (drawer: string) => {
      const next = updateParams(searchParams, {
        drawer,
        mode: 'create',
        id: null,
        action: null,
      })
      replace(next)
    },

    openView: (drawer: string, id: string) => {
      const next = updateParams(searchParams, {
        drawer,
        mode: 'view',
        id,
        action: null,
      })
      replace(next)
    },

    openEdit: (drawer: string, id: string) => {
      const next = updateParams(searchParams, {
        drawer,
        mode: 'edit',
        id,
        action: null,
      })
      replace(next)
    },

    close: () => {
      const next = updateParams(searchParams, {
        drawer: null,
        mode: null,
        id: null,
        action: null,
      })
      replace(next)
    },

    triggerDelete: () => {
      const next = updateParams(searchParams, {
        action: 'delete',
      })
      replace(next)
    },

    cancelAction: () => {
      const next = updateParams(searchParams, {
        action: null,
      })
      replace(next)
    },
  }
}

///////////////////////////////////////////////////////////////
📁 platform/url-kit/url-drawer/components/drawer-wrapper.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { parseDrawerState } from './drawer-parser'
import RightDrawer from '@/components/design/right-drawer'

export default function DrawerWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()

  const state = parseDrawerState(Object.fromEntries(searchParams.entries()))

  if (!state.isOpen) return null

  return <RightDrawer isOpen>{children}</RightDrawer>
}


///////////////////////////////////////////////////////////////
Copy style from: components\confirm-modal.tsx
📁 platform/url-kit/url-drawer/components/delete-action-modal.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { parseDrawerState } from './drawer-parser'
import { useDrawerActions } from './use-drawer'

export default function DeleteActionModal({
  onConfirm,
}: {
  onConfirm: (id: string) => void
}) {
  const searchParams = useSearchParams()
  const { cancelAction } = useDrawerActions()

  const state = parseDrawerState(Object.fromEntries(searchParams.entries()))

  if (state.action !== 'delete' || !state.id) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded shadow">
        <p>Are you sure you want to delete this item?</p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onConfirm(state.id!)}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Confirm
          </button>

          <button
            onClick={cancelAction}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

📁 Example Usage (Page)


<!-- Action Button -->
const { openCreate } = useDrawerActions()

<button onClick={() => openCreate('car')}>
  Add Car
</button>


<!-- Table Row -->
const { openView } = useDrawerActions()

onRowClick={(row) => openView('car', row.id)}


<!-- Drawer Header Actions -->
const { openEdit, triggerDelete } = useDrawerActions()

<button onClick={() => openEdit('car', id)}>Edit</button>
<button onClick={triggerDelete}>Delete</button>

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

🧠 Final Architecture
URL (single source of truth)
   ↓
Zod Schema (validation)
   ↓
parseDrawerState (normalized state)
   ↓
UI (DrawerWrapper / Modals / Content)
   ↓
useDrawerActions (state transitions)

///////////////////////////////////////////////////////////////
🚀 Why This Is “Senior-Level Clean”
✔ Type-safe URL parsing (no invalid states)
✔ Explicit state machine
✔ Works in RSC + Client
✔ No global state needed
✔ Scales to multiple entities
✔ Easy to extend (more actions later)
✔ Fully debuggable via URL