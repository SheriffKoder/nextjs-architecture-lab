# `features/ui/drawer`

## What this is

Shared **URL ↔ drawer state** helpers only: param names, types, and `useDrawerParams` to read/write `drawer`, `mode`, `id`, and `action` on the current page’s query string. No entity UI, no `RightDrawer`, no TanStack.

## How to use

```tsx
import { useDrawerParams } from '@/features/ui/drawer'

function MyEntityDrawerManager() {
  const { isOpen, mode, id, action, setParams, closeDrawer, clearAction } = useDrawerParams()

  // Open add: setParams({ drawer: 'user', mode: 'add' })
  // Open view: setParams({ drawer: 'user', mode: 'view', id: row.id })
  // Close: closeDrawer()
  // Drop confirm only: clearAction()

  return <RightDrawer isOpen={isOpen} onClose={closeDrawer}>…</RightDrawer>
}
```

See `docs/example-entity-drawer-manager.md` for a full “new entity” checklist.
