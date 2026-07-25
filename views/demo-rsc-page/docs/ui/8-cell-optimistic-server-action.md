# Cell Optimistic Update + Server Action (`setActivity`)

Ordered implementation manual for the **Set activity** table column: checkbox UI → `columnActions` → `useOptimistic` → `rowStatusUpdateAction` → mock store patch.

Build **bottom-up** (each step depends on the ones above). Prerequisite: `entities/cars-rsc/types/rental-car-status.ts` (existing status constants).

---

## 1. `entities/cars-rsc/lib/rental-car-activity-status.ts`

Pure toggle rules and labels — no React, no server. Defines:

- `getNextActivityStatus` — `available` → `reserved`, anything else → `available`
- `formatActivityStatusLabel`
- `isActivityToggleChecked` — checkbox on when `reserved`

Shared by the cell, the client hook, and the server action.

---

## 2. `entities/cars-rsc/server/update-rental-car-row-status.ts`

Server-side mock persistence: finds the row in `data-source` `rentalCars`, patches `status`, returns a shallow copy.

Demo behavior:

- **1.5s delay** on every call (`DEMO_UPDATE_DELAY_MS`)
- **~50% simulated failure** (`RentalCarRowStatusSimulatedError`)

Replace with a real DB update when persistence exists.

---

## 3. `entities/cars-rsc/actions/row-status-update-action.ts`

`'use server'` entry point:

1. Zod-validates `id`
2. Reads current row from `rentalCars`
3. Computes next status via `getNextActivityStatus`
4. Calls `updateRentalCarRowStatusInMockStore`
5. `revalidatePath('/demo-rsc-page')` — path revalidation, not `revalidateTag`, until list/facet caches share tags

Returns discriminated `{ success, id, status }` or `{ success: false, error }`.

---

## 4. `views/demo-rsc-page/config/ui/cells/rental-car-set-activity-cell.tsx`

`cellRenderer` UI for the `setActivity` column:

- Checkbox box (`border-tertiary/10`, `bg-tertiary/10`)
- Lucide `Check` with `text-tertiary` when reserved
- `stopPropagation` so the row click / drawer open does not fire
- Calls `columnAction(item, nextStatus)` on click

---

## 5. `views/demo-rsc-page/config/ui/columns.ts`

Registers the column in `allColumns` (before `licensePlate` in the definition list):

- `key: 'setActivity'`
- `cellRenderer: rentalCarSetActivityCell`

Adds `'setActivity'` to the `tableColumns` export array (alongside `delete` / `actions`).

---

## 6. `views/demo-rsc-page/hooks/use-demo-rsc-table-activity-toggle.ts`

Client hook:

- `tableData` + sync from `cars` prop
- `useOptimistic` → `displayData`
- `handleSetActivityColumnAction` — optimistic patch → `rowStatusUpdateAction` → success toast + `router.refresh()`, or revert optimistic + error toast on failure

Exposes `setTableData`, `displayData`, `setActivityColumnAction`.

Includes a comment on optional `startTransition` (not used).

---

## 7. `views/demo-rsc-page/demo-rsc-content.tsx`

Wires the feature into the page:

- `useDemoRscTableActivityToggle(cars)`
- passes `displayData` to `FilteringWrapper`
- `columnActions.setActivity: setActivityColumnAction`
- keeps `setTableData` for inline `onCellValueChange` and subheadings drag

---

## Related (unchanged but required)

| File | Role |
|------|------|
| `entities/cars-rsc/types/rental-car-status.ts` | Status enum used by lib + action |
| `entities/cars-rsc/server/data-source.ts` | In-memory `rentalCars` store patched by step 2 |
| `views/demo-rsc-page/docs/to-implement/done/table-checkbox-column-outside-handler.md` | General `columnActions` + `cellRenderer` pattern |
| `widgets/multi-view/.../table-row.tsx` | Looks up `columnActions[column.key]` and passes `columnAction` into `cellRenderer` |

---

## Data flow (quick)

```text
1. Click checkbox → rentalCarSetActivityCell → setActivityColumnAction(item)
2. Hook addOptimistic updates displayData immediately
3. rowStatusUpdateAction(id) → mock store (delay + maybe error) → revalidatePath
4. Success: success toast + router.refresh()
   Failure: revert optimistic + error toast
```

---

## Key Learnings

- **Cell UI stays dumb** — The renderer only calls `columnAction`; mutation, toasts, and refresh live in the page hook.
- **Optimistic first, server authoritative** — `useOptimistic` paints immediately; `rowStatusUpdateAction` decides success or revert.
- **Shared toggle rules** — Pure lib (`getNextActivityStatus`) keeps cell, hook, and server action aligned.
- **Path revalidation until tags exist** — `revalidatePath` + `router.refresh()` refresh the RSC list; switch to `revalidateTag` when loaders share cache tags.
- **`columnActions[key]` matches column `key`** — The multi-view row injects the handler into `cellRenderer` by key (`setActivity`).
