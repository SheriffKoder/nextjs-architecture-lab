/**
 * Task grouping/ordering utility — dynamic, level-driven.
 *
 * Purpose: Build a stable comparator from an ordered list of *level keys*
 *          (e.g. `['project', 'phase', 'orderNumber']`). Each level has a
 *          single registered comparator; the final comparator falls through
 *          levels in order, returning the first non-zero result.
 * Used in: `lib/tasks/task-list-query-server.ts` (default branch when the
 *          user hasn't selected a column-header sort).
 *
 * Composition with the rest of the pipeline:
 *   filter → sort → paginate
 *   ─────   ────   ────────
 *   filters narrow the input; this comparator only sees survivors.
 *   pagination is unchanged — pages straddle group boundaries by design.
 *
 * Why a level array (not a SortSpec[] from feature-sorting):
 *   The list contract's `applySorts` is generic-key + asc/desc and lives in
 *   the URL-driven sort pipeline (column header clicks). This file is for
 *   *structural* default ordering — always ascending, nulls always sink
 *   last, and some keys (like `phase`) need an ordinal map rather than
 *   alpha compare. Keeping them split avoids leaking phase ordinals into
 *   the generic sort path.
 *
 * Adding a new level:
 *   1. Append the key to `TASK_GROUPING_LEVELS`.
 *   2. Add an entry to `LEVEL_COMPARATORS`.
 *   That's it — every existing caller keeps working, and the new key
 *   becomes available everywhere `TaskGroupingLevel` is accepted.
 *
 * Constraints (kept on purpose to stay simple):
 *   - Always ascending. Pass keys in the order you want; reverse the array
 *     for descending priority. If you need per-level direction, build a
 *     thin `{ key, direction }` wrapper above this file rather than
 *     bloating the registry.
 *   - Nulls/undefined/empty always sink last at every level.
 *   - Duplicate keys in `levels` (e.g. `['phase', 'phase']`) are no-ops on
 *     the second pass — the registry comparator is deterministic, so the
 *     follow-up call returns 0.
 *   - Empty `levels` returns 0 always (preserves input order). Include
 *     `'id'` as the final level if you want deterministic ties.
 */
// @ts-nocheck

import type { TaskType } from '@/types/tasks'

////////////////////////////////////
// Level keys (single source of truth)
////////////////////////////////////

/**
 * Every level the registry knows how to compare. Add a new key here and a
 * matching entry in `LEVEL_COMPARATORS` to extend the system.
 */
export const TASK_GROUPING_LEVELS = [
  'project',
  'phase',
  'orderNumber',
  'description',
  'dueDays',
  'overdueDate',
  'status',
  'value',
  'id',
] as const

export type TaskGroupingLevel = (typeof TASK_GROUPING_LEVELS)[number]

/**
 * Default ordering for the tasks list (matches the project → phase grouping
 * the API uses when no user sort is active). `'id'` is appended as a
 * deterministic tiebreaker so otherwise-identical rows don't reshuffle
 * between fetches.
 */
export const DEFAULT_TASK_GROUPING_LEVELS: readonly TaskGroupingLevel[] = [
  'project',
  'phase',
  'orderNumber',
  'id',
] as const

////////////////////////////////////
// Phase ordinal map
////////////////////////////////////

/**
 * Display order for `TaskType.phase` values. `phase1` precedes `nepa`.
 * Plain string compare would put `nepa` first (`'n' < 'p'`), which is wrong
 * for the user-facing flow.
 */
export const PHASE_ORDER: Record<NonNullable<TaskType['phase']>, number> = {
  phase1: 0,
  nepa: 1,
}

////////////////////////////////////
// Primitive null-last comparators
////////////////////////////////////

/** Compare two values, treating `null` as "after" any non-null. Returns -1 / 0 / 1. */
function compareNullable<T>(
  a: T | null,
  b: T | null,
  cmp: (x: T, y: T) => number,
): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return cmp(a, b)
}

const compareString = (a: string, b: string) => a.localeCompare(b)
const compareNumber = (a: number, b: number) => a - b

////////////////////////////////////
// Field accessors (null-safe)
////////////////////////////////////

function trimmedStringOrNull(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s.length > 0 ? s : null
}

function caseInsensitiveStringOrNull(v: unknown): string | null {
  const s = trimmedStringOrNull(v)
  return s === null ? null : s.toLowerCase()
}

function finiteNumberOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

function projectKey(t: TaskType): string | null {
  return caseInsensitiveStringOrNull(t.project)
}

function phaseRank(t: TaskType): number | null {
  if (!t.phase) return null
  return PHASE_ORDER[t.phase]
}

function orderNumberKey(t: TaskType): number | null {
  return finiteNumberOrNull(t.orderNumber)
}

////////////////////////////////////
// Level comparator registry
////////////////////////////////////

type LevelComparator = (a: TaskType, b: TaskType) => number

/**
 * One comparator per level key. Each is null-last and ascending. The order
 * users pass to `compareTasksByLevels` decides the priority — the registry
 * only knows how to compare *one* level at a time.
 */
const LEVEL_COMPARATORS: Record<TaskGroupingLevel, LevelComparator> = {
  project: (a, b) =>
    compareNullable(projectKey(a), projectKey(b), compareString),
  phase: (a, b) =>
    compareNullable(phaseRank(a), phaseRank(b), compareNumber),
  orderNumber: (a, b) =>
    compareNullable(orderNumberKey(a), orderNumberKey(b), compareNumber),
  description: (a, b) =>
    compareNullable(
      caseInsensitiveStringOrNull(a.description),
      caseInsensitiveStringOrNull(b.description),
      compareString,
    ),
  dueDays: (a, b) =>
    compareNullable(finiteNumberOrNull(a.dueDays), finiteNumberOrNull(b.dueDays), compareNumber),
  // YMD strings sort lexicographically; the API mapper already normalises
  // overdue dates to that shape, so plain string compare is correct.
  overdueDate: (a, b) =>
    compareNullable(
      trimmedStringOrNull(a.overdueDate),
      trimmedStringOrNull(b.overdueDate),
      compareString,
    ),
  status: (a, b) =>
    compareNullable(
      caseInsensitiveStringOrNull(a.status),
      caseInsensitiveStringOrNull(b.status),
      compareString,
    ),
  value: (a, b) =>
    compareNullable(
      caseInsensitiveStringOrNull(a.value),
      caseInsensitiveStringOrNull(b.value),
      compareString,
    ),
  // `id` is always present and non-empty, so we can skip the null wrapper.
  id: (a, b) => compareString(a.id, b.id),
}

////////////////////////////////////
// Public API
////////////////////////////////////

/**
 * Build a comparator that walks the given level list in order, returning
 * the first non-zero result. Empty array yields a comparator that always
 * returns 0 (preserves input order).
 *
 * @example
 *   const cmp = compareTasksByLevels(['project', 'phase', 'orderNumber', 'id'])
 *   const sorted = [...tasks].sort(cmp)
 */
export function compareTasksByLevels(
  levels: readonly TaskGroupingLevel[],
): (a: TaskType, b: TaskType) => number {
  // Snapshot the level list so callers mutating their array post-build
  // don't change the comparator's behaviour mid-sort.
  const frozen = [...levels]
  return (a, b) => {
    for (const level of frozen) {
      const cmp = LEVEL_COMPARATORS[level](a, b)
      if (cmp !== 0) return cmp
    }
    return 0
  }
}

/**
 * Non-mutating sort wrapper around `compareTasksByLevels`.
 *
 * @example
 *   sortTasksByLevels(tasks, ['project', 'phase'])
 *   sortTasksByLevels(tasks, ['orderNumber', 'id'])
 */
export function sortTasksByLevels(
  tasks: TaskType[],
  levels: readonly TaskGroupingLevel[],
): TaskType[] {
  return [...tasks].sort(compareTasksByLevels(levels))
}

