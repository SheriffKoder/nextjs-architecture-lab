# `features/ui/confirm`

## What this is

Shared **confirm intent** helpers on the same URL keys as the drawer: `useConfirmAction` wraps `useDrawerParams` with `openConfirm`, `cancelConfirm` (clears `action` only), and `confirmDone` (clears all drawer keys). **No modals here** — put entity-specific confirm UI next to that feature (e.g. `car-confirm-manager.tsx`).

## How to use

```tsx
import { useConfirmAction } from '@/features/ui/confirm'

function CarConfirmManager() {
  const { isConfirmOpen, confirmAction, confirmId, cancelConfirm, confirmDone } = useConfirmAction()

  // From a form or table: setParams({ drawer: 'car', id, action: 'delete' })
  // Or: openConfirm('delete', 'car', id)

  if (!isConfirmOpen || confirmAction !== 'delete') return null
  // …render ConfirmModal; on success → confirmDone(); on cancel → cancelConfirm()
}
```

See `docs/example-entity-confirm-manager.md` for a full “new entity” checklist.
