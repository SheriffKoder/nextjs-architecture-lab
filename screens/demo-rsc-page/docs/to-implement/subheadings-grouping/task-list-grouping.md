# Task List — Project → Phase Grouping (default ordering)

## Goal

On the tasks page, the default ordering of rows is **project → phase**, so
pages naturally cluster by project/phase boundaries:

| Page   | Contents (example)                                           |
| ------ | ------------------------------------------------------------ |
| Page 1 | `projectA / phase1` (start)                                  |
| Page 2 | `projectA / phase1` (tail) → `projectA / nepa` (head)        |
| Page 3 | `projectA / nepa` (tail) → `projectB / phase1` (head)        |
| …      | …                                                            |

A page boundary may straddle a project/phase boundary by design — that's the
behaviour the user requested.

## Composition with the existing pipeline

The tasks API runs a fixed three-stage pipeline in
[`lib/tasks/task-list-query-server.ts`](../../../lib/tasks/task-list-query-server.ts):

```
filter → sort → paginate
```

| Stage      | What changed?                                                                 |
| ---------- | ----------------------------------------------------------------------------- |
| Filter     | Unchanged. Filters narrow the input set before sort.                          |
| Sort       | New default branch when no user sort is active (see "Mode A" below).          |
| Paginate   | Unchanged. Pages slice the sorted set; boundaries can straddle groups.        |

Because each stage operates on a `TaskType[]` and is independent, this change
plays cleanly with column-header sorts, `q` search, status / assignee /
project / overdue-date filters, and pagination.

The conditional-task resolver (`filterVisibleTasks`) still runs **before**
`applyTaskListPipeline`, so hidden child rows are excluded from the grouping
input — pages won't have phantom gaps where a hidden row would have lived.

## Mode A — default-only (chosen)

Three composition modes were considered:

| Mode | Behaviour                                                            | Chosen? |
| ---- | -------------------------------------------------------------------- | ------- |
| A    | When no header sort is active → group by project/phase. Click wins.  | ✅      |
| B    | Group by project/phase always; user header sort is secondary.        | ✗       |
| C    | User header sort wins; project/phase only as tiebreaker.             | ✗       |

**Mode A** matches the mental model "this is the natural view of the list",
while preserving the user's ability to override by clicking a column header.

## Implementation

### 1. Utility — `lib/tasks/task-grouping.ts`

Pure helpers, no React/Next dependencies:

| Export                          | Purpose                                                                |
| ------------------------------- | ---------------------------------------------------------------------- |
| `TASK_GROUPING_LEVELS`          | `readonly [...]` of every level the registry knows how to compare.     |
| `TaskGroupingLevel`             | Type alias — union of the keys above (use for type-safe input arrays). |
| `DEFAULT_TASK_GROUPING_LEVELS`  | `['project', 'phase', 'orderNumber', 'id']` — the API default.         |
| `PHASE_ORDER`                   | `{ phase1: 0, nepa: 1 }` — explicit ordinal, not alpha.                |
| `compareTasksByLevels(levels)`  | Builds a comparator from a level array. Empty array → no-op.           |
| `sortTasksByLevels(tasks, lv)`  | Non-mutating sort wrapper around the comparator builder.               |

There are no named-preset functions on top of these. Callers that want the
default ordering pass `DEFAULT_TASK_GROUPING_LEVELS` explicitly, which keeps
"what fields drive the order" visible at every call site.

### Dynamic level-list API

The comparator is registry-driven: pass any ordered subset of
`TASK_GROUPING_LEVELS`, the comparator walks them in priority order and
returns the first non-zero result.

```ts
import {
  compareTasksByLevels,
  sortTasksByLevels,
} from '@/lib/tasks/task-grouping'

// Phase first, then template-defined intra-phase order.
const a = sortTasksByLevels(tasks, ['phase', 'orderNumber'])

// Just by phase (duplicate keys collapse — second compare always returns 0).
const b = sortTasksByLevels(tasks, ['phase', 'phase'])

// Per-row deterministic order with no grouping.
const c = sortTasksByLevels(tasks, ['id'])

// Or build the comparator and reuse it inline.
const cmp = compareTasksByLevels(['project', 'overdueDate', 'id'])
[...tasks].sort(cmp)
```

### Available levels

| Key            | Type     | Compare                                                |
| -------------- | -------- | ------------------------------------------------------ |
| `project`      | string   | locale-aware, case-insensitive                         |
| `phase`        | ordinal  | `PHASE_ORDER` (`phase1` < `nepa`)                      |
| `orderNumber`  | number   | numeric                                                |
| `description`  | string   | locale-aware, case-insensitive                         |
| `dueDays`      | number   | numeric                                                |
| `overdueDate`  | YMD      | lexicographic (matches ISO YMD ordering)               |
| `status`       | string   | locale-aware, case-insensitive                         |
| `value`        | string   | locale-aware, case-insensitive (project task answer)   |
| `id`           | string   | locale-aware (always present — terminal tiebreaker)    |

`null` / undefined / empty always sink last at every level. Include `'id'`
as the last entry whenever you want deterministic order between fetches.

### Adding a new level

1. Append the key to `TASK_GROUPING_LEVELS`.
2. Add an entry to `LEVEL_COMPARATORS`.

Every existing caller continues to work, and the new key is immediately
type-safe everywhere `TaskGroupingLevel` is accepted.

### Constraints (kept on purpose)

- **Always ascending.** Reverse the level array if you want a different
  primary; build a thin `{ key, direction }` wrapper above this file if you
  need true per-level direction (avoid bloating the registry for it).
- **Empty array** returns 0 always (preserves input order). Add `'id'` if
  you want determinism.
- **Duplicate keys** are no-ops on the second pass — the registry comparator
  is deterministic.

### 2. Pipeline wiring — `lib/tasks/task-list-query-server.ts`

```ts
import {
  DEFAULT_TASK_GROUPING_LEVELS,
  sortTasksByLevels,
} from '@/lib/tasks/task-grouping'

export function sortTasksForList(tasks: TaskType[], sorts: SortSpec[]): TaskType[] {
  const effective = normalizedSorts(sorts)
  if (effective.length === 0) {
    return sortTasksByLevels(tasks, DEFAULT_TASK_GROUPING_LEVELS)   // Mode A: default-only
  }
  // …existing applySorts(...) path for user-driven column sorts
}
```

Replaces the old `DEFAULT_SORT = [{ key: 'description', direction: 'asc' }]`
fallback. The user-sort branch is untouched — clicking a column header still
goes through `applySorts` exactly as before.

### 3. Header arrow — `features/tasks/config/tasks-list-contract.ts`

`getTasksTableSortConfig` no longer marks `description` as the *initial*
sort. Reason: the visual arrow would have lied — data is grouped by
project/phase, which has no clickable column. With `initial` cleared, the
header reads "no column sorted" by default, which is the truth.

`useInitialSorts` is a no-op (see its file header) so this change is
purely visual.

## Edge cases handled

| Case                                  | Behaviour                                          |
| ------------------------------------- | -------------------------------------------------- |
| `project` is `null` / empty           | Row sinks to the bottom (within its phase tie).    |
| `phase` is `null` / undefined         | Row sinks to the bottom (within its project tie).  |
| `orderNumber` is `null`               | Row sinks to the bottom (within its phase tie).    |
| Pure tie (same project, phase, order) | Stable order via `id` `localeCompare` fallback.    |
| Conditional child hidden by parent    | Already excluded by `filterVisibleTasks` upstream. |
| Column header clicked                 | `applySorts` path runs — grouping default skipped. |

## What this does **not** do

- Does **not** add `phase` to `TASK_LIST_SORT_KEYS`. Phase is not a clickable
  column header today; if you want one, register `'phase'` in the contract
  and add a `SORT_LABELS` entry. The grouping helper would still work
  unchanged because it lives outside the generic `applySorts` path.

- Does **not** change `applyTaskListFiltersExcludingColumn` — facet counts
  on `/api/tasks/filter-options` use the same filter set independent of
  ordering, so they're unaffected.

- Does **not** alter the Supabase fetch order. `app/api/tasks/route.ts`
  still does `.order('created_at')` for stable fetch deduplication; the
  user-visible order is whatever `sortTasksForList` produces afterwards.

## Switching modes later

Want **Mode B** (always-on primary)? Prepend grouping `SortSpec`s to
`effective` before calling `applySorts`, OR call
`compareTasksByLevels(DEFAULT_TASK_GROUPING_LEVELS)` first and let
`applySorts` resolve only equal-group ties.

Want **Mode C** (tiebreaker only)? Pass `compareTasksByLevels([...])` as a
final stable-sort pass after `applySorts` returns.

Both options reuse the same utility — that's why it's registry-driven and
split into its own file rather than inlined into the pipeline.

### Custom orderings without touching the pipeline

Because the dynamic API takes any `readonly TaskGroupingLevel[]`, callers
outside the tasks API (dashboard widgets, exports, ad-hoc CSV dumps) can
build whatever ordering they want without re-implementing null-handling or
phase ordinals:

```ts
// Triage view: overdue first, then by project, then deterministic id.
const triage = sortTasksByLevels(tasks, ['overdueDate', 'project', 'id'])

// Project export: stable canonical order matching the form's phase tables.
const exportRows = sortTasksByLevels(tasks, [
  'project',
  'phase',
  'orderNumber',
  'description',
  'id',
])
```
