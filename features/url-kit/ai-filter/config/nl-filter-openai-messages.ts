/**
 * OpenAI message bodies for NL filter assistant
 *
 * Purpose: System instructions + user payload assembly for structured completions.
 * Used in: Route handlers that call OpenAI with `nlFilterResponseSchema`.
 */

import type { NlFilterAssistantRuntimeConfig } from '@/features/url-kit/ai-filter/types/nl-filter-assistant'

/**
 * System instructions — merge semantics, schema hints, unsupported behaviors.
 */
export function buildNlFilterSystemPrompt(
  config: NlFilterAssistantRuntimeConfig,
): string {
  const domain =
    config.domainDescription?.trim() ||
    'list or table views driven by URL query parameters'

  return [
    `You translate natural language into structured filter updates for ${domain}.`,
    '',
    'Rules:',
    `- Never include these URL keys inside filterPatchesJson (they are excluded): ${config.excludedUrlKeys.join(', ')}.`,
    '- filterPatchesJson must be JSON null, or a single JSON object string whose keys are catalog filter keys only.',
    '',
    'When to change which facets:',
    '- **Clear all**: If the user asks to clear/reset/remove/drop filters (e.g. "clear all filters", "reset filters"), include **every** catalog filter key in the object with select types set to [] and range types set to null; set sorts to [].',
    '- **Replace / narrow intent**: If the user asks for results mainly by one criterion (e.g. "cars in New York", "show any cars in NY", "anything in Miami") **without** saying they want to keep other current filters, **clear every other catalog facet** ([] / null) and only set the facets they care about. Words like "any" / "anything" usually mean drop make/status/etc. unless combined ("Toyotas in NY" keeps both).',
    '- **Additive**: Only when the user clearly stacks constraints ("also", "and", "keep", "still", named multiple facets), retain or set multiple facets and omit-only keys you truly leave unchanged.',
    '',
    '- For multi-select / single-select filters, values MUST exactly match catalog option `value` strings (case-sensitive).',
    '- For number-range filters, use JSON objects: { "min"?: number, "max": number } or null to clear that facet.',
    '- For date-range filters, use { "start"?: string, "end"?: string } with ISO-like date strings (YYYY-MM-DD), or null to clear.',
    '- Negation / NOT queries / boolean logic are NOT supported. If the user asks for them, explain in feedback and leave filters unchanged unless other parts are valid.',
    '',
    `Sorts: array { key, direction }. Valid keys only: ${config.allowedSortKeys.join(', ')}.`,
    '- Always include the sorts field: use JSON null to leave current sorting unchanged; use [] to clear sorting.',
    '',
    'Structured output shape (every top-level key is always present): feedback (string), filterPatchesJson (string or null), sorts (array or null).',
    '- filterPatchesJson: use JSON null only when the user message does not imply any URL filter change. Otherwise supply one JSON string whose parse result is an object.',
    'feedback should summarize what was applied and mention partially matched values when needed.',
  ].join('\n')
}

export function buildNlFilterUserContent(parts: {
  userText: string
  catalogJson: string
  currentParamsJson: string
  currentParamsReference: string
}): string {
  return [
    '## Filter catalog (JSON)',
    parts.catalogJson,
    '',
    '## Current URL params (flat JSON object)',
    parts.currentParamsJson,
    '',
    '## Current URL (human-readable)',
    parts.currentParamsReference,
    '',
    '## User request',
    parts.userText.trim(),
  ].join('\n')
}
