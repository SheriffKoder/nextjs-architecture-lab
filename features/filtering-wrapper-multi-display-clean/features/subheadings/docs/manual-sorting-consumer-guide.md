# Guide: Enabling manual sorting on a subheadings page

Use this when you already render subheadings through **`FilteringWrapper`** from `features/filtering-wrapper-multi-display-clean` and want **per-row reorder** (and optional **cross-group** moves) with the reducer-driven manual path.

**Related docs**

- `manual-sorting.md` — how manual sort was integrated into clean (internals / phases).
- `manual-sorting-upgrade-plan.md` — original roadmap; **nested + manual** is now implemented in clean (reorder + cross-leaf bucket moves).

---

## 1. When manual sort actually turns on

Manual UI (slot droppables, insert placeholder, drag overlay behavior) is active when:

| Condition | Why |
|-----------|-----|
| `subheadingsConfig.manualSorting === true` | Opt-in flag (flat **or** nested grouping). |
| `onSubheadingsItemUpdate` is provided | The reducer notifies the parent after each successful drop so you can persist or update local state. |

If `manualSorting` is true but `onSubheadingsItemUpdate` is missing, the reducer still runs internally, but you have no supported way to sync your page state—**always wire the callback**.

---

## 2. Data your rows should carry

### Stable row id (`idKey`)

- Default is `'id'`.
- Every row must expose a stable string (or value coerced to string) at that key so drag ids match. Set `idKey` if your primary key is `_id`, `uuid`, etc.

### Group field matches `columnKey` (flat) or primary + secondary (nested)

**Flat grouping:** `FilteringWrapper` passes `groupByKey={subheadingsConfig.columnKey ?? …}`. Rows are bucketed by `item[columnKey]` (stringified). On a **cross-bucket** manual drop, the reducer sets **`item[columnKey] = targetGroupKey`** (the target bucket’s string).

**Nested grouping:** buckets use a **composite key** `` `${primary}${separator}${secondary}` `` from `nestedGrouping.primaryKey`, `secondaryKey`, and `separator`. On a **cross-bucket** drop into another leaf, the reducer sets **`item[primaryKey]`** and **`item[secondaryKey]`** from parsing the target composite key (first separator only—avoid `|` inside field values, or encode keys).

`columnKey` remains used for `groupByKey` in the container API; nested layout still requires **`nestedGrouping`** with the real primary/secondary field names.

### `manual_sorting` (recommended)

- For each **leaf bucket** (each flat group value, or each composite key when nested), assign integers **`0 .. n-1`** in the order you want rows to appear initially.
- The container sorts each bucket by `manual_sorting` ascending whenever `manualSorting` is true (flat or nested).
- After each drop, the reducer **reindexes** `manual_sorting` in the **source** and **target** buckets when manual mode applies—so your `onSubheadingsItemUpdate` receives items with updated indices.

If you omit `manual_sorting`, order falls back to `0` for missing values (unstable / insertion order); define it for predictable UX and persistence.

**Example shape (conceptual)**

```ts
type Row = {
  id: string
  status: string        // same as subheadingsConfig.columnKey
  manual_sorting?: number
  // ...other fields
}
```

Seed `manual_sorting` when you load or normalize data (e.g. per-status counters), similar to `assignManualSortingForSubheadingsDemo` in `features/demo-rsc-page/utils/server/data-source.ts`.

---

## 3. `FilteringWrapper` + `subheadingsConfig`

Pass everything through the existing **`subheadingsConfig`** object (it is also spread into subheadings **table** config for row height, header filters, etc.).

### Required for manual mode

| Field | Type | Notes |
|--------|------|--------|
| `columnKey` | `string` | Grouping / persistence field on each row. |
| `manualSorting` | `true` | Enables manual path when nested is off. |
| `onSubheadingsItemUpdate` | `(ctx) => void \| Promise<void>` | Called after a successful drop with flattened `data` and `groupedData`. |

### Optional but common

| Field | Notes |
|--------|--------|
| `idKey` | Default `'id'`. |
| `groups` | `Array<{ key, label }>` — fixed buckets / labels; keys must align with `item[columnKey]`. |
| `loadingItemIds` | `string[]` — ids (per `idKey`) showing loading on row after async persist. |
| `listView` | Hides group headers for a single-column reorder-style layout (see container JSDoc). |
| `isManualOnChangeRef` | Set to `true` before you update `data` from the parent in response to your **own** persist, so the internal `UPDATE_DATA` effect does not overwrite reducer state mid-flight (advanced; see below). |
| `subheadingsDragEnd` | Legacy **whole-group** drag path when `manualSorting` is false; **not** used to commit manual slot drops (manual path uses `onSubheadingsItemUpdate` only). You can still keep it for non-manual pages or future toggles. |

### `SubheadingsUpdateContext` (callback argument)

Import type from:

`@/features/filtering-wrapper-multi-display-clean/features/subheadings/dnd`

Fields:

- **`data`** — `T[]`, flattened from all buckets (order is bucket iteration, not necessarily your original array order); use it to replace page state when persisting a flat list.
- **`groupedData`** — `Record<string, T[]>` keyed by group string.
- **`sourceGroup`**, **`targetGroup`** — bucket keys before/after the move (same value for same-bucket reorder).

---

## 4. Minimal page pattern (local state)

```tsx
'use client'

import { useCallback, useState } from 'react'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display-clean/filtering-wrapper'
import type { SubheadingsUpdateContext } from '@/features/filtering-wrapper-multi-display-clean/features/subheadings/dnd'
import type { YourRow } from './types'

export function YourPage({ initialRows }: { initialRows: YourRow[] }) {
  const [data, setData] = useState(initialRows)

  const onSubheadingsItemUpdate = useCallback(
    (ctx: SubheadingsUpdateContext<YourRow>) => {
      setData(ctx.data)
      // optional: await persistYourRows(ctx.data)
    },
    []
  )

  return (
    <FilteringWrapper
      data={data}
      columns={yourColumns}
      availableViews={['subheadings', /* … */]}
      subheadingsConfig={{
        columnKey: 'status',
        manualSorting: true,
        onSubheadingsItemUpdate,
        idKey: 'id',
        headerFilters: /* … */,
        sortConfig: /* … */,
        rowHeight: 40,
        // nestedGrouping: optional; when enabled + manualSorting, use composite buckets + manual_sorting per leaf
      }}
      /* filters, minimalControlsConfig, … */
    />
  )
}
```

After server persist, either **`setData` from response** or merge server rows; if you optimistically updated from `ctx.data` and then refetch, consider **`isManualOnChangeRef`** (see §6).

---

## 5. View switcher and subheadings

Ensure **`availableViews`** includes `'subheadings'` and **`subheadingsConfig`** is defined whenever the user can pick that view. `FilteringWrapper` only mounts `SubHeadingsContainer` when the current view is subheadings and config exists.

---

## 6. `isManualOnChangeRef` (parent owns data after persist)

The container’s reducer subscribes to derived grouped data via `UPDATE_DATA` when props change. If you:

1. Apply `ctx.data` in `onSubheadingsItemUpdate`, then  
2. Immediately replace `data` from a refetch that **lags** or **differs** slightly,

you can get flicker or stale merges.

Pattern some apps use:

- `const isManualOnChangeRef = useRef(false)`
- In `onSubheadingsItemUpdate`, after you commit local state from `ctx`, set `isManualOnChangeRef.current = true` **before** `setData` if the next render would dispatch `UPDATE_DATA` you want to skip once.
- Pass `isManualOnChangeRef` into `subheadingsConfig`.

Only add this if you observe double updates; the demo can work without it when `setData(ctx.data)` is the single source of truth.

---

## 7. Nested grouping + manual sorting

When **`nestedGrouping.enabled`** and **`manualSorting`**, each **secondary (leaf)** section uses the same slot-based DnD as flat mode. `groupedData` keys are **composite strings**; `onSubheadingsItemUpdate` receives rows whose **`primaryKey` / `secondaryKey`** fields may change after a cross-leaf drop.

**Caveat:** composite keys are built with `` primary + separator + secondary ``. If either field value contains the separator character, grouping and `primaryGroupsMap` can split incorrectly—use a rare separator (e.g. `\u001f`) or sanitize values.

---

## 8. Checklist before shipping

- [ ] **Flat:** `columnKey` on every row matches the field the reducer updates on cross-bucket move.  
- [ ] **Nested:** `nestedGrouping.primaryKey` / `secondaryKey` match persisted fields; composite keys are unambiguous.  
- [ ] `idKey` stable and unique.  
- [ ] `manual_sorting` initialized **per leaf bucket**; persisted after drops if order matters across reloads.  
- [ ] `onSubheadingsItemUpdate` updates state or calls API; errors logged/handled so UI does not silently diverge.  
- [ ] Optional: `loadingItemIds` while persist in flight.  
- [ ] `subheadingsDisableRowDrag` in table config if you need non-draggable rows (grip hidden) for certain rows—separate from manual mode.

---

## 9. Reference implementation in repo

- **Config + data seeding:** `features/demo-rsc-page/config/displays/subheadings-config.ts`, `utils/server/data-source.ts`, `types/rental-car-table-item.ts`  
- **Parent handler:** `features/demo-rsc-page/demo-rsc-content.tsx` (`onSubheadingsItemUpdate` + optional `onSubheadingsDragEnd` forwarding)  
- **Wire-through:** `features/filtering-wrapper-multi-display-clean/filtering-wrapper.tsx` (`subheadingsConfig` → `SubHeadingsContainer`)
