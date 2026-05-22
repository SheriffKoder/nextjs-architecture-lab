# Cell optimistic update + server action (`setActivity`)

Ordered implementation manual for the **Set activity** table column: checkbox UI → `columnActions` → `useOptimistic` → `rowStatusUpdateAction` → mock store patch.

Build **bottom-up** (each step depends on the ones above). Prerequisite: `types/rental-car-status.ts` (existing status constants).

---

## 1. `features/demo-rsc-page/lib/rental-car-activity-status.ts`

Pure toggle rules and labels — no React, no server. Defines `getNextActivityStatus` (`available` → `reserved`, anything else → `available`), `formatActivityStatusLabel`, and `isActivityToggleChecked` (checkbox on when `reserved`).

---

## 2. `features/demo-rsc-page/utils/server/update-rental-car-row-status.ts`

Server-side mock persistence: finds the row in `data-source` `rentalCars`, patches `status`, returns a shallow copy. Demo behavior: **1.5s delay** on every call, **~50% simulated failure** (`RentalCarRowStatusSimulatedError`). Replace with a real DB update when persistence exists.

---

## 3. `features/demo-rsc-page/actions/row-status-update-action.ts`

`'use server'` entry point: Zod-validates `id`, reads current row, computes next status via `getNextActivityStatus`, calls `updateRentalCarRowStatusInMockStore`, then `revalidatePath('/demo-rsc-page')` (path revalidation — not `revalidateTag` — until list/facet caches share tags). Returns discriminated `{ success, id, status }` or `{ success: false, error }`.

---

## 4. `features/demo-rsc-page/config/cells/rental-car-set-activity-cell.tsx`

`cellRenderer` UI for the `setActivity` column: checkbox box (`border-tertiary/10`, `bg-tertiary/10`), Lucide `Check` with `text-tertiary` when reserved, `stopPropagation`, calls `columnAction(item, nextStatus)` on click.

---

## 5. `features/demo-rsc-page/config/columns.ts`

Registers the column in `allColumns` (**before** `licensePlate`): `key: 'setActivity'`, `cellRenderer: rentalCarSetActivityCell`. Adds `'setActivity'` to `tableColumns` export array (table-only column, alongside `delete` / `actions`).

---

## 6. `features/demo-rsc-page/hooks/use-demo-rsc-table-activity-toggle.ts`

Client hook: `tableData` + sync from `cars` prop, `useOptimistic` → `displayData`, `handleSetActivityColumnAction` (optimistic patch → `rowStatusUpdateAction` → toast + `router.refresh()` on success, revert optimistic + error toast on failure). Exposes `setTableData`, `displayData`, `setActivityColumnAction`. Includes comment on optional `startTransition` (not used).

---

## 7. `features/demo-rsc-page/demo-rsc-content.tsx`

Wires the feature into the page: `useDemoRscTableActivityToggle(cars)`, passes `displayData` to `FilteringWrapper`, `columnActions.setActivity: setActivityColumnAction`, hides `setActivity` when not on table view (with `delete`). Keeps `setTableData` for inline `onCellValueChange` and subheadings drag.

---

## Related (unchanged but required)

| File | Role |
|------|------|
| `features/demo-rsc-page/types/rental-car-status.ts` | Status enum used by lib + action |
| `features/demo-rsc-page/utils/server/data-source.ts` | In-memory `rentalCars` store patched by step 2 |
| `features/demo-rsc-page/docs/to-implement/table-checkbox-column-outside-handler.md` | General `columnActions` + `cellRenderer` pattern |
| `features/filtering-wrapper-multi-display-clean/.../table-row.tsx` | Looks up `columnActions[column.key]` and passes `columnAction` into `cellRenderer` |

---

## Data flow (quick)

1. User clicks checkbox → `rentalCarSetActivityCell` → `setActivityColumnAction(item)`.
2. Hook `addOptimistic` updates `displayData` immediately.
3. `rowStatusUpdateAction(id)` → mock store (delay + maybe error) → `revalidatePath`.
4. Success: success toast + `router.refresh()`; failure: revert optimistic + error toast.
