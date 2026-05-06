# Filter UI: show labels, keep IDs (or slugs) in the URL

This describes the pattern used across **`DropdownFilter`**, active-filter **badges**, and **`FilterConfig` / `FilterOption`** so the address bar stays machine-friendly while the UI stays readable.

## Core rule

- **URL query params** store the canonical filter value: UUID, slug, date key, etc. (`FilterOption.value`).
- **UI** shows **`FilterOption.label`** (or a formatter), not the raw URL token, wherever we render a choice to the user.

`features/filters/feature-filtering/components/filter-types.ts` — each select option is conceptually `{ value, label, ...counts }`.

## 1. Supply options with both `value` and `label`

Build or fetch `FilterConfig[]` so every multi/single-select row has:

| Field   | Role |
|--------|------|
| `value` | Written to the URL (comma-separated for multi-select). Must match what the list API expects. |
| `label` | Shown in dropdown rows, badges, etc. |

**Example (tasks assignee):** `features/tasks/utils/build-tasks-filters-from-tasks.ts` — `assigneeOptions` sets `value` to the user id and `label` from `assigneeUser.name` / `assigneeName`, falling back to id if no name.

Server-driven filter options (`GET …/filter-options`) should return the same shape: each option **`value`** = id, **`label`** = display string.

## 2. Dropdown list rows (`FilterOptionsList`)

**File:** `features/filters/feature-filtering/components/dropdown-filter/components/filter-options-list.tsx`

Display text per row:

1. If **`formatDisplayValue`** is passed → `formatDisplayValue(option.rawValue ?? option.value)`.
2. Else if **`option.label`** is non-empty after trim → use **`label`**.
3. Else → `String(option.value)` (last resort).

The URL / selection logic still uses **`option.value`** only.

## 3. Active filter badges (`ActiveFiltersSection`)

**File:** `features/filters/feature-filtering/components/dropdown-filter/components/active-filters-section.tsx`

Badges iterate **URL tokens** (`activeFilters: string[]`). For each token we resolve display text the same way as the list:

1. Find the matching option with **`String(opt.value) === String(filter)`**.
2. If **`formatDisplayValue`** → use it on **`option.rawValue ?? filter`**.
3. Else → **`option.label`** if set, else **`String(filter)`**.

### Why `labelLookupOptions` exists

The scrollable list uses a **search-filtered** list (`filteredOptions`). If the user types in the option search box, **selected** values can disappear from that filtered list. Badges used to resolve labels only from `filteredOptions`, so labels fell back to **raw IDs**.

**Fix:** `DropdownFilter` passes **`labelLookupOptions={filterOptions}`** — the **full** option list — into `ActiveFiltersSection`, while the list still uses **`filteredOptions`**. Badge lookup always uses the full map from URL id → label.

**File wiring:** `features/filters/feature-filtering/components/dropdown-filter/dropdown-filter.tsx` (`ActiveFiltersSection` props).

## 4. Optional `formatDisplayValue` on `DropdownFilter`

**Prop:** `formatDisplayValue?: (value: unknown) => string`

Use when:

- Labels need formatting that is not stored on `FilterOption` (e.g. normalizing dates), or
- `rawValue` carries a richer object and you want a single formatter.

`FiltersHeader` does not set this by default; pages can extend the header later to pass it per filter if needed. Internally, date-range filters get a default date formatter via `effectiveFormatDisplayValue` in `dropdown-filter.tsx`.

## 5. Options inferred from `dataSource` (no `filter.options`)

When options are derived inside **`dropdown-filter.tsx`** from `dataSource`, **`extractDisplayValue`** picks text for grouping keys: `name` → `email` → `id` → stringify. Prefer explicit **`filter.options`** with **`label` / `value`** for anything URL-serialized (especially UUIDs).

## 6. Checklist for new filters

1. [ ] API or builder returns **`value`** (URL + API) and **`label`** (UI).
2. [ ] URL param keys match **`FilterConfig.key`** and list contract (e.g. `TASK_LIST_URL` on tasks).
3. [ ] If you add a custom filter UI, mirror the badge rule: resolve display from a **full** option list, not a search-scoped list.
4. [ ] Optional: pass **`formatDisplayValue`** for non-trivial display without duplicating label strings on every option.

## Related paths (quick navigation)

| Area | Path |
|------|------|
| Dropdown orchestration | `features/filters/feature-filtering/components/dropdown-filter/dropdown-filter.tsx` |
| Option rows | `…/dropdown-filter/components/filter-options-list.tsx` |
| Active badges | `…/dropdown-filter/components/active-filters-section.tsx` |
| Header composition | `features/filters/components/filters-header.tsx` |
| Filter types | `features/filters/feature-filtering/components/filter-types.ts` |
