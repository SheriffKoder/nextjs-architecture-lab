/**
 * Server-side list pipeline for GET /api/tasks: filter → sort → paginate in memory.
 *
 * Purpose: Honor `TaskListFilters` / `TASK_LIST_URL` until DB-level faceting is needed.
 * Used in: `app/api/tasks/route.ts`; filter-options uses **`filterTasksByListFiltersExcludingColumn`** for facets
 */


// @ts-nocheck
import { applySorts } from '@/features/filters/feature-sorting/utils'
import type { SortSpec } from '@/features/filters/feature-sorting/types'
import type { TaskListFilters } from '@/features/tasks/api/task-list-types'
import {
  TASK_LIST_SORT_KEYS,
  TASK_LIST_URL,
  type TaskListSortKey,
} from '@/features/tasks/config/tasks-list-contract'
import { ymdFromOverdueInput } from '@/lib/tasks/task-api-mappers'
import {
  DEFAULT_TASK_GROUPING_LEVELS,
  sortTasksByLevels,
} from '@/lib/tasks/task-grouping'
import type { TaskType } from '@/types/tasks'

const SORT_KEY_SET = new Set<string>(TASK_LIST_SORT_KEYS)

function taskOverdueYmd(t: TaskType): string | null {
  return ymdFromOverdueInput(t.overdueDate)
}

function compareYmd(a: string, b: string): number {
  return a.localeCompare(b)
}

/** `q` matches description (see `TASK_LIST_SEARCHABLE_FIELDS`). */
export function filterTasksByListFilters(
  tasks: TaskType[],
  f: TaskListFilters
): TaskType[] {
  let out = tasks

  const q = f.q?.trim().toLowerCase()
  if (q) {
    out = out.filter((t) => {
      const desc = (t.description ?? '').toLowerCase()
      return desc.includes(q)
    })
  }

  if (f.status.length > 0) {
    const set = new Set(f.status)
    out = out.filter((t) => set.has(t.status))
  }

  if (f.assignee.length > 0) {
    const set = new Set(f.assignee)
    out = out.filter((t) => {
      const id = t.userId?.trim() || t.assigneeUser?.id?.trim()
      return id && set.has(id)
    })
  }

  if (f.project.length > 0) {
    const set = new Set(f.project)
    out = out.filter((t) => {
      const p = t.project?.trim()
      return p && set.has(p)
    })
  }

  const range = f.overdueDate
  if (range && (range.start?.trim() || range.end?.trim())) {
    const start = range.start?.trim()
    const end = range.end?.trim()
    out = out.filter((t) => {
      const ymd = taskOverdueYmd(t)
      if (!ymd) return false
      if (start && compareYmd(ymd, start) < 0) return false
      if (end && compareYmd(ymd, end) > 0) return false
      return true
    })
  }

  return out
}

/**
 * Apply list filters but ignore the URL slice for one header column (facet counts for that column).
 * `q` and sort/page/limit are unchanged — only `status` / `assignee` / `project` / `overdueDate` participate.
 */
export function filterTasksByListFiltersExcludingColumn(
  tasks: TaskType[],
  f: TaskListFilters,
  excludeColumn: string
): TaskType[] {
  const narrowed: TaskListFilters = {
    ...f,
    status: excludeColumn === TASK_LIST_URL.status ? [] : f.status,
    assignee: excludeColumn === TASK_LIST_URL.assignee ? [] : f.assignee,
    project: excludeColumn === TASK_LIST_URL.project ? [] : f.project,
    overdueDate: excludeColumn === TASK_LIST_URL.overdueDate ? null : f.overdueDate,
  }
  return filterTasksByListFilters(tasks, narrowed)
}

function assigneeSortValue(t: TaskType): string {
  return (
    t.assigneeUser?.name?.trim() ||
    t.assigneeName?.trim() ||
    (t.assignee != null ? String(t.assignee) : '')
  ).toLowerCase()
}

function normalizedSorts(sorts: SortSpec[]): SortSpec[] {
  return sorts
    .filter((s) => s.key && SORT_KEY_SET.has(s.key))
    .map((s) => ({ ...s, key: s.key as TaskListSortKey }))
}

/**
 * Sort tasks for list display. `assignee` uses display name / legacy number for comparison only;
 * returned rows are original `TaskType` instances (assignee stays `number | null`).
 *
 * Default ordering (no user sort): `DEFAULT_TASK_GROUPING_LEVELS`
 * (`['project', 'phase', 'orderNumber', 'id']`). The level list is owned by
 * `task-grouping.ts` so the rule has a single source of truth and stays out
 * of the generic `applySorts` path (phase isn't in `TASK_LIST_SORT_KEYS`
 * because it isn't a clickable column header).
 *
 * When the user clicks a column header (URL has `sort=…`), that sort wins —
 * no grouping override is applied. See `task-list-grouping.md` for the
 * rationale (Mode A — default-only).
 */
export function sortTasksForList(tasks: TaskType[], sorts: SortSpec[]): TaskType[] {
  const effective = normalizedSorts(sorts)
  if (effective.length === 0) {
    return sortTasksByLevels(tasks, DEFAULT_TASK_GROUPING_LEVELS)
  }

  const needsAssignee = effective.some((s) => s.key === 'assignee')

  const augmented = tasks.map((t) => {
    const row = { ...t } as Record<string, unknown>
    if (needsAssignee) row.assignee = assigneeSortValue(t)
    return row
  })
  const sortedAugmented = applySorts(augmented, effective)
  if (!needsAssignee) {
    return sortedAugmented as unknown as TaskType[]
  }

  const byId = new Map(tasks.map((t) => [t.id, t]))
  return sortedAugmented
    .map((row) => byId.get(String((row as { id?: string }).id)))
    .filter((t): t is TaskType => t != null)
}

export function paginateTasks(
  tasks: TaskType[],
  page: number,
  limit: number
): { items: TaskType[]; total: number } {
  const total = tasks.length
  const safePage = Math.max(1, page)
  const safeLimit = Math.max(1, limit)
  const start = (safePage - 1) * safeLimit
  const items = tasks.slice(start, start + safeLimit)
  return { items, total }
}

export function applyTaskListPipeline(
  tasks: TaskType[],
  f: TaskListFilters
): { items: TaskType[]; total: number } {
  const filtered = filterTasksByListFilters(tasks, f)
  const sorted = sortTasksForList(filtered, f.sort)
  return paginateTasks(sorted, f.page, f.limit)
}
