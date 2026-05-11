/**
 * Serialize filter configs for NL assistant catalog
 *
 * Purpose: JSON-safe facet definitions (keys/types/options) for prompts + validation.
 * Used in: `FiltersSection` → `NlFilterAssistant`
 */

import type { FilterConfig } from '@/features/ui/filters/feature-filtering/components/filter-types'
import type { NlFilterCatalogEntry } from '@/features/ui/ai-filter/types/nl-filter-assistant'

/**
 * Maps server filter configs to catalog entries suitable for OpenAI + client validation.
 *
 * @param filters - Output of `getFilterOptionsServer` (includes populated `options`)
 */
export function serializeFiltersForNlCatalog(
  filters: FilterConfig[],
): NlFilterCatalogEntry[] {
  return filters.map((f) => ({
    key: f.key,
    label: f.label,
    type: f.type,
    options: f.options?.map((o) => ({ value: o.value, label: o.label })),
  }))
}
