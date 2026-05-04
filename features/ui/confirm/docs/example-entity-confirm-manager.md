# Example: entity confirm manager (e.g. users)

This folder (`features/ui/confirm`) only provides **`useConfirmAction`** — open / cancel / done helpers on top of the same URL keys as the drawer (`drawer`, `mode`, `id`, `action`).

**Entity-specific** confirm UI (copy, which mutation, which cache keys for labels) lives **next to that feature**, aligned with its drawer manager — e.g. `features/demo-client-page/components/car-confirm-manager.tsx`.

## What stays generic (import from here)

* `useConfirmAction` — `openConfirm(action, drawer, id)`, `cancelConfirm()` (removes `action` only), `confirmDone()` (clears all drawer keys)
* Pair with `useDrawerParams` from `features/ui/drawer` when you need raw reads without the confirm helpers

## What you implement in the feature (example: `features/users-page/components/user-confirm-manager.tsx`)

* **Default export** a small client component mounted as a **sibling** of the entity drawer (not inside `RightDrawer`).
* **Read URL** via `useConfirmAction()`:
  * If `!isConfirmOpen` → return `null`.
  * Branch on `confirmDrawer` + `confirmAction` (e.g. only render delete UI when `confirmDrawer === 'user'` and `confirmAction === 'delete'`).
* **Resolve label** from TanStack cache for that entity (list pages first, detail key fallback) — avoids an extra GET for modal copy.
* **Wire mutations** — `useDeleteUser`, etc., only for the actions this manager owns.
* **Confirm success** — `await mutateAsync(confirmId)`, toast, then `confirmDone()` (clears drawer + action so the sheet closes if you cleared all).
* **Cancel** — `cancelConfirm()` so the user stays in `mode=view` / `edit` with the same `id`.

## Opening delete from anywhere

* Table row: `openConfirm('delete', 'user', row.id)` or equivalently `setParams({ drawer: 'user', id: row.id, action: 'delete' })` (optionally omit `mode` if delete-from-table without opening the drawer first — product choice; ensure your confirm manager guards on the fields you require).
* Edit form trash: same, while `mode` + `id` already set — `action` layers on top (composable).

## Checklist for a new entity

* [ ] Confirm manager only handles `drawer` values that belong to that feature (ignore others → `null`).
* [ ] Extend `DrawerAction` in `drawer.types.ts` when you add new actions (`archive`, …), then branch in the entity confirm manager.
* [ ] Do not import entity TanStack hooks into `features/ui/confirm/*` — keep generic folder free of domain.
