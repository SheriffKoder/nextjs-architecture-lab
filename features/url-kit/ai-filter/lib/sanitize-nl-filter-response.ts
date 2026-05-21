/**
 * Sanitize NL filter model output against catalog + exclusion lists
 *
 * Purpose: Strip unknown keys, illegal values, and excluded URL keys; append notes to feedback.
 * Used in: `POST /api/demo-rsc/nl-filters` before returning JSON to the client
 */

import type { NlFilterResponse } from '@/features/url-kit/ai-filter/lib/nl-filter-response-schema'
import type {
  NlFilterAssistantRuntimeConfig,
  NlFilterCatalogEntry,
  NlFilterSortSpec,
} from '@/features/url-kit/ai-filter/types/nl-filter-assistant'

/**
 * Decodes model output: stringified JSON object or null → patch record.
 */
function parseFilterPatchesJson(
  raw: string | null,
  notes: string[],
): Record<string, unknown> {
  if (raw == null) return {}
  const trimmed = raw.trim()
  if (trimmed === '' || trimmed === 'null') return {}
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>
    }
    notes.push('filterPatchesJson must decode to a JSON object; ignored.')
    return {}
  } catch {
    notes.push('filterPatchesJson was invalid JSON; ignored.')
    return {}
  }
}

function coerceStringArray(raw: unknown): string[] | null {
  if (raw === null) return []
  if (Array.isArray(raw) && raw.every((x) => typeof x === 'string')) {
    return raw as string[]
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return null
}

function coerceNumberRange(
  raw: unknown,
): { min?: number; max?: number } | null | 'invalid' {
  if (raw === null) return null
  if (typeof raw !== 'object' || raw === null) return 'invalid'
  const o = raw as Record<string, unknown>
  const min =
    o.min !== undefined && o.min !== null && o.min !== ''
      ? Number(o.min)
      : undefined
  const max =
    o.max !== undefined && o.max !== null && o.max !== ''
      ? Number(o.max)
      : undefined
  if (
    (o.min !== undefined &&
      o.min !== null &&
      o.min !== '' &&
      Number.isNaN(min)) ||
    (o.max !== undefined &&
      o.max !== null &&
      o.max !== '' &&
      Number.isNaN(max))
  ) {
    return 'invalid'
  }
  return {
    ...(min !== undefined && !Number.isNaN(min!) ? { min } : {}),
    ...(max !== undefined && !Number.isNaN(max!) ? { max } : {}),
  }
}

function coerceDateRange(
  raw: unknown,
): { start?: string; end?: string } | null | 'invalid' {
  if (raw === null) return null
  if (typeof raw !== 'object' || raw === null) return 'invalid'
  const o = raw as Record<string, unknown>
  const start = o.start !== undefined ? String(o.start) : undefined
  const end = o.end !== undefined ? String(o.end) : undefined
  if (
    (start !== undefined && start.trim() === '') ||
    (end !== undefined && end.trim() === '')
  ) {
    return 'invalid'
  }
  return { start, end }
}

/**
 * Returns sanitized patches/sorts safe to merge into URLSearchParams.
 *
 * @param raw - Parsed OpenAI payload
 * @param catalog - Same catalog sent in the request body
 * @param config - Host-supplied exclusions + allowed sort keys
 */
export function sanitizeNlFilterResponse(
  raw: NlFilterResponse,
  catalog: NlFilterCatalogEntry[],
  config: NlFilterAssistantRuntimeConfig,
): {
  feedback: string
  filterPatches: Record<string, unknown>
  sorts?: NlFilterSortSpec[]
} {
  const excludedSet = new Set(config.excludedUrlKeys)
  const allowedSortSet = new Set(config.allowedSortKeys)
  const catalogByKey = new Map(catalog.map((c) => [c.key, c]))
  const notes: string[] = []
  const filterPatches: Record<string, unknown> = {}

  const patches = parseFilterPatchesJson(raw.filterPatchesJson, notes)

  for (const [key, value] of Object.entries(patches)) {
    if (excludedSet.has(key)) {
      notes.push(`Ignored patch for excluded key "${key}".`)
      continue
    }

    const entry = catalogByKey.get(key)
    if (!entry) {
      notes.push(`Ignored unknown filter key "${key}" (not in catalog).`)
      continue
    }

    if (entry.type === 'multi-select' || entry.type === 'single-select') {
      const allowed = new Set((entry.options ?? []).map((o) => o.value))
      const arr = coerceStringArray(value)
      if (arr === null) {
        notes.push(`Skipped "${key}": expected string array or comma-separated string.`)
        continue
      }
      if (arr.length === 0) {
        filterPatches[key] = []
        continue
      }
      const kept: string[] = []
      const dropped: string[] = []
      for (const v of arr) {
        if (allowed.has(v)) kept.push(v)
        else dropped.push(v)
      }
      if (dropped.length) {
        notes.push(
          `For "${key}", dropped values not in catalog options: ${dropped.join(', ')}.`,
        )
      }
      filterPatches[key] = entry.type === 'single-select' ? kept.slice(0, 1) : kept
      continue
    }

    if (entry.type === 'number-range') {
      const r = coerceNumberRange(value)
      if (r === 'invalid') {
        notes.push(`Skipped "${key}": invalid number range object.`)
        continue
      }
      filterPatches[key] = r
      continue
    }

    if (entry.type === 'date-range') {
      const r = coerceDateRange(value)
      if (r === 'invalid') {
        notes.push(`Skipped "${key}": invalid date range object.`)
        continue
      }
      filterPatches[key] = r
      continue
    }
  }

  let sorts: NlFilterSortSpec[] | undefined
  if (raw.sorts != null) {
    if (raw.sorts.length === 0) {
      sorts = []
    } else {
      const kept: NlFilterSortSpec[] = []
      const dropped: string[] = []
      for (const s of raw.sorts) {
        if (allowedSortSet.has(s.key)) {
          kept.push({ key: s.key, direction: s.direction })
        } else {
          dropped.push(s.key)
        }
      }
      if (dropped.length) {
        notes.push(`Dropped sorts with disallowed keys: ${dropped.join(', ')}.`)
      }
      sorts = kept
    }
  }

  let feedback = raw.feedback.trim()
  if (notes.length) {
    feedback = [feedback, notes.join(' ')].filter(Boolean).join(' ')
  }

  return { feedback, filterPatches, sorts }
}
