/**
 * NL filter assistant — Zod schema for OpenAI structured output
 *
 * Purpose: Stable JSON shape for model replies; detailed validation happens in `sanitize-nl-filter-response.ts`.
 * Used in: `POST /api/demo-rsc/nl-filters`
 */

import { z } from 'zod'

export const nlFilterSortSpecSchema = z.object({
  key: z.string(),
  direction: z.enum(['asc', 'desc']),
})

export const nlFilterResponseSchema = z.object({
  feedback: z.string(),
  /**
   * JSON-encoded object of catalog filter keys → patch values (OpenAI rejects `z.record` / propertyNames).
   * Use JSON `null` when no filter URL changes; otherwise a stringified object, e.g. `{"make":["ford"]}`.
   */
  filterPatchesJson: z.string().nullable(),
  /**
   * Required key — use `null` to leave current sort unchanged; `[]` clears the `sort` param.
   */
  sorts: z.array(nlFilterSortSpecSchema).nullable(),
})

export type NlFilterResponse = z.infer<typeof nlFilterResponseSchema>
