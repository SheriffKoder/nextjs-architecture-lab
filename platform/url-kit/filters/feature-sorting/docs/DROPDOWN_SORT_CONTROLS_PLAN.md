# Dropdown Sort Controls — Plan

## Objective

Move **column data sorting** into the header `DropdownFilter` panel as an explicit Asc / Desc / None / Clear-all strip, while the table header cell shows only a compact **direction + level** indicator beside the filter icon.

Reuse `useUrlSorting` (URL `sort=key:dir,...`). Do **not** invent a second sort state. Keep option-list A↔Z sorting in `DropdownHeader` separate (local UI only).

---

## How to use

### 1. Enable on a display config

Set `sortPlacement: 'dropdown'` on `headerFilters`, and keep `sortConfig` as the whitelist of sortable columns (key + label). Cast `headerFilters` as `HeaderFilterConfig` so the literal union is preserved.

```ts
import type { HeaderFilterConfig } from '@/widgets/multi-view/types'

export const tableHeaderConfig = {
  headerFilters: {
    columnToFilterMap: { make: 'make', status: 'status' /* … */ },
    enabledFilterKeys: { make: ['make'], status: ['status'] /* … */ },
    autoApply: false,
    showBadges: true,
    showInitialCount: true,
    sortPlacement: 'dropdown', // ← enable in-dropdown sort strip
  } as HeaderFilterConfig,

  sortConfig: [
    { key: 'make', label: 'Make' },
    { key: 'status', label: 'Status' },
    // only keys listed here get sort UI
  ],
}
```

Spread into `tableConfig` / `listConfig` / `subheadingsConfig` as today (`…tableHeaderConfig`).

**Reference configs:** `views/demo-rsc-page/config/ui/displays/{table,list,subheadings}-config.ts` and the matching `entities/demo-client-page/config/displays/*` files.

### 2. What you get

| Surface | Behavior when `sortPlacement: 'dropdown'` |
|---------|-------------------------------------------|
| Header cell | `label` · `[filter + sort indicator]` (`gap-2` to label, **no** gap between filter and indicator). Dual-arrow `SortButton` is hidden. |
| Sort indicator | Direction glyph + level badge — only when that column is in the URL `sort` list. |
| Filter dropdown | `DropdownSortRow` above options search: plain `Sort by Make` + pill `level: N`, then `[Asc] [Desc] [None] [Clear all]`. |

Default / omit `sortPlacement` (or `'header'`) keeps the legacy cell `SortButton`.

### 3. Wire path (already implemented)

```text
display config
  headerFilters.sortPlacement + sortConfig
       ↓
filtering-table-header
  passes columnSort into DropdownFilter when placement is dropdown
  ColumnHeaderChrome renders indicator | SortButton
       ↓
DropdownFilter (columnSort prop)
  mounts <DropdownSortRow sortKey label />
       ↓
useUrlSorting → URL sort=make:asc,year:desc
```

You do **not** need to import `DropdownSortRow` in page configs; the header does it when the flag is set.

### 4. Manual mount (optional)

If you use `DropdownFilter` outside the table header:

```tsx
import { DropdownFilter } from '@/platform/url-kit/filters/feature-filtering/components/dropdown-filter'

<DropdownFilter
  filter={makeFilter}
  columnSort={{ key: 'make', label: 'Make' }}
/>
```

Omit `columnSort` / pass `null` for filter-only.

### 5. Do not confuse with option-list sort

The ArrowUpDown control in `DropdownHeader` only reorders **filter options** inside the menu (local state). It does **not** change the page `sort` URL param. Column data sorting is only the Asc/Desc/None strip / header indicator / `SortButton`.

### 6. URL format (unchanged)

```text
sort=make:asc
sort=make:asc,year:desc
```

First entry = level 1, second = level 2, etc. `None` removes this key; `Clear all` deletes the whole `sort` param.

---

## UI / UX gain

| Today | Target |
|-------|--------|
| Dual-arrow `SortButton` sits in the header cell next to the filter icon | Sort actions live **inside** the filter dropdown |
| Header cell mixes label + filter + sort controls | Cell chrome: `[indicator] gap-2 [label] gap-2 [filter]` only |
| Multi-level priority is a tiny badge on the arrow stack | Status **pill**: `Sort by Make (level: N)` plus clear radio actions |
| Clearing one column vs all sorts is awkward from the header toggle | Explicit **None** (this key) and **Clear all** (global) |

**Locked product choices:**

1. **Status pill** (non-interactive): `Sort by ${label}` + `(level: N)` when active (1-based, same as current `getSortLevel + 1` badge). When inactive: `Sort by ${label}` with no level (or optional `(none)`).
2. **Action row**: `[Asc] [Desc] [None] [Clear all]`
   - Asc / Desc / None = **radio trio** for this column key
   - Clear all = `clearSorts()` (every level)
3. **Header indicator** (when dropdown placement is on): direction glyph + level badge to the **right** of the filter icon (same control cluster, no gap) — not the full Asc/Desc/None strip.
4. **Placement in dropdown**: strip **above** option search (always visible without scrolling past options).
5. **Enablement**: config-driven (`sortPlacement: 'dropdown'`); default remains header `SortButton` for back-compat.

```text
┌──────────────────────────────────────────┐
│ Filter: Make                    [A↔Z]    │  ← option-list sort (unchanged)
├──────────────────────────────────────────┤
│ Sort by Make  [level: 2]                 │  ← title + level pill
│ [Asc] [Desc] [None] [Clear all]          │  ← URL column sort
├──────────────────────────────────────────┤
│ 🔍 Search options…                       │
│ … virtualized options …                  │
│ Clear · Cancel · Apply                   │
└──────────────────────────────────────────┘
```

Header cell when `sortPlacement === 'dropdown'`:

```text
Make  [ filter ][ ↑ ² ]
label  gap-2  [filter + indicator, gap-0]
```

---

## Hook mapping (`useUrlSorting`)

| Control | API |
|---------|-----|
| Asc (pressed when active) | `setSort(key, 'asc')` |
| Desc | `setSort(key, 'desc')` |
| None | `removeSort(key)` |
| Clear all | `clearSorts()` |
| Pill label / level | `label` from `sortConfig` + `getSortLevel(key)` (display `level + 1`) |
| Pressed state | `getSort(key)` → `'asc' \| 'desc' \| null` |

No new URL format. Existing multi-level order rules stay as implemented in `useUrlSorting`.

---

## Target folder structure

```text
platform/url-kit/filters/feature-sorting/
├── components/
│   ├── sort-button.tsx                 # keep — header / toolbar / legacy
│   ├── sort-buttons.tsx
│   ├── dropdown-sort-row/              # NEW
│   │   ├── dropdown-sort-row.tsx       # pill + Asc/Desc/None/Clear all
│   │   ├── sort-status-pill.tsx        # optional split
│   │   ├── sort-direction-actions.tsx  # optional split
│   │   └── index.ts
│   └── index.ts                        # export DropdownSortRow
├── hooks/useUrlSorting.ts              # unchanged API
└── docs/
    └── DROPDOWN_SORT_CONTROLS_PLAN.md  # this file
```

**Header orchestration (widgets, not url-kit):**

```text
widgets/multi-view/components/
├── filtering-table-header.tsx          # thinner: compose chrome
└── column-header-chrome.tsx            # NEW — indicator | label | filter
```

Also mirror wiring in `widgets/multi-view/features/virtualized-list/components/filtering-table-header.tsx` if it stays a parallel copy.

---

## Config

Extend `HeaderFilterConfig` (`widgets/multi-view/types/header-filter-config.ts`):

```ts
sortPlacement?: 'header' | 'dropdown'  // default: 'header'
```

`sortConfig` on the display config remains the **whitelist** of sortable columns (key + label). Unchanged shape.

**Consumers to update when enabling the new UX:**

- `views/demo-rsc-page/config/ui/displays/table-config.ts`
- `views/demo-rsc-page/config/ui/displays/list-config.ts`
- `views/demo-rsc-page/config/ui/displays/subheadings-config.ts`
- `entities/demo-client-page/config/displays/table-config.ts`
- `entities/demo-client-page/config/displays/list-config.ts`
- `entities/demo-client-page/config/displays/subheadings-config.ts`

Example:

```ts
headerFilters: {
  // ...existing maps / autoApply / showBadges ...
  sortPlacement: 'dropdown',
},
sortConfig: [
  { key: 'make', label: 'Make' },
  // ...
],
```

---

## Wiring

### DropdownFilter

Add optional prop, e.g.:

```ts
columnSort?: { key: string; label: string } | null
```

When set, render `<DropdownSortRow sortKey={…} label={…} />` above search.

`filtering-table-header` resolves the entry from `sortConfig` for the column (same key rules as today’s `renderSortButton`) and passes it only when `headerFilterConfig.sortPlacement === 'dropdown'`.

### Header cell

When `sortPlacement === 'dropdown'`:

- Do **not** render header `SortButton` (`showSortButton` derived false for that mode, or skip in chrome).
- Render left-of-label **SortStatusIndicator** if column is in `sortConfig` (show glyph + badge only when `getSort(key)` is non-null, or always muted when none — product choice in Step 4).
- Keep existing cell padding / borders / sticky / accordion; only internal gap between indicator, label, and filter is `gap-2`.

When `sortPlacement === 'header'` (default): behavior unchanged.

---

## Steps

### Step 0 — Types & config flag ✅

**Files**

- Update: `widgets/multi-view/types/header-filter-config.ts` — add `sortPlacement?`
- Docs note in this plan; no visual change yet

**Expected outcomes**

- Types compile; configs can set the flag without effect until later steps

---

### Step 1 — `DropdownSortRow` (+ optional atom split) ✅

**Files**

- Create: `feature-sorting/components/dropdown-sort-row/*`
- Update: `feature-sorting/components/index.ts`

**Behavior**

- Pill: `Sort by ${label}` + `(level: N)` when sorted
- Buttons call `setSort` / `removeSort` / `clearSorts`
- Asc / Desc / None reflect pressed/selected styling from `getSort(key)`
- Clear all always available (disabled only if `getSorts().length === 0`, optional)

**Expected outcomes**

- Standalone component usable in Story / temporary mount; URL updates correctly

---

### Step 2 — Mount inside `DropdownFilter` ✅

**Files**

- Update: `dropdown-filter/types.ts` — `columnSort?`
- Update: `dropdown-filter.tsx` — slot above search (multi-select / single-select; decide range filters: same strip if `columnSort` passed)

**Expected outcomes**

- Passing `columnSort` shows the strip; omitting it leaves dropdown unchanged

---

### Step 3 — Header passes `columnSort` + hides cell `SortButton` ✅

**Files**

- Update: `widgets/multi-view/components/filtering-table-header.tsx`
- Update: list variant header if applicable

**Logic**

```ts
const sortPlacement = headerFilterConfig?.sortPlacement ?? 'header'
const sortEntry = sortConfig?.find(s => s.key === column.key)

// DropdownFilter:
columnSort={
  sortPlacement === 'dropdown' && sortEntry
    ? { key: sortEntry.key, label: sortEntry.label || column.name }
    : null
}

// Cell SortButton:
show when sortPlacement === 'header' && sortEntry
```

**Expected outcomes**

- With `sortPlacement: 'dropdown'` on a demo config, sort UI moves into the open filter; header no longer shows dual-arrow button

---

### Step 4 — `ColumnHeaderChrome` + left indicator ✅

**Files**

- Create: `widgets/multi-view/components/column-header-chrome.tsx` (or under a small `header/` folder)
- Refactor: `filtering-table-header.tsx` to compose it
- Optional small indicator in `feature-sorting/components/` if reused

**Layout**

```tsx
<div className="flex items-center gap-2">
  {sortPlacement === 'dropdown' ? <SortStatusIndicator … /> : null}
  {showFilterTitle ? <span>{column.name}</span> : null}
  {filter}
  {sortPlacement === 'header' ? <SortButton … /> : null}
</div>
```

Preserve outer cell padding; do not add extra padding on the chrome beyond `gap-2`.

**Expected outcomes**

- Active sorts readable at a glance without opening the dropdown; cell stays uncluttered

---

### Step 5 — Flip display configs ✅

**Files**

- Demo RSC + demo-client display configs listed above → `sortPlacement: 'dropdown'`

**Expected outcomes**

- Table / list / subheadings demos exercise the new path end-to-end

---

### Step 6 — Smoke checklist

- Asc / Desc / None update URL for that key only
- Multi-column sorts: level numbers update on pill and header badge
- Clear all removes entire `sort` param
- None removes only current key; other levels renumber
- Option-list A↔Z header control still only reorders dropdown options
- Filter Apply / Clear / Cancel behavior unchanged
- `sortPlacement: 'header'` (or omit) restores legacy SortButton

---

## Out of scope

- Changing URL sort format or `applySorts` server/client algorithms
- Replacing `SortingControl` / builder UI
- Moving option-list sort into this strip
- Mobile-specific redesign of the strip (wrap if needed later)

---

## Acceptance checklist

- [ ] `DropdownSortRow` pill + Asc / Desc / None / Clear all wired to `useUrlSorting`
- [ ] Mounted in `DropdownFilter` when `columnSort` is set (above search)
- [ ] `HeaderFilterConfig.sortPlacement` defaults to `'header'`
- [ ] `'dropdown'` hides cell `SortButton`, shows left-of-label indicator + level
- [ ] Cell layout: indicator / label / filter with `gap-2`; outer paddings preserved
- [ ] Demo display configs updated where the new UX is desired
- [ ] Option-list sort and column URL sort remain distinct

---

## Implementation order (summary)

1. Config type flag  
2. `DropdownSortRow`  
3. `DropdownFilter` prop + slot  
4. Header wire + hide SortButton  
5. `ColumnHeaderChrome` + indicator  
6. Enable on display configs  
7. Smoke  

Ready to implement starting at **Step 0** when approved.
