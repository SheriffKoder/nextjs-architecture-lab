/**
 * NL filter assistant — POST /api/demo-rsc/nl-filters
 *
 * Purpose: Structured OpenAI completion from natural language + filter catalog → sanitized patches.
 * Used in: `NlFilterAssistant` on demo RSC page
 */

import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
  buildNlFilterSystemPrompt,
  buildNlFilterUserContent,
} from '@/features/ui/ai-filter/config/nl-filter-openai-messages'
import {
  nlFilterResponseSchema,
  type NlFilterResponse,
} from '@/features/ui/ai-filter/lib/nl-filter-response-schema'
import {
  buildClearAllFilterPatches,
  isClearAllFiltersIntent,
} from '@/features/ui/ai-filter/lib/nl-filter-clear-helpers'
import { sanitizeNlFilterResponse } from '@/features/ui/ai-filter/lib/sanitize-nl-filter-response'
import type { NlFilterCatalogEntry } from '@/features/ui/ai-filter/types/nl-filter-assistant'

const nlFilterTypeSchema = z.enum([
  'multi-select',
  'single-select',
  'date-range',
  'number-range',
])

const nlCatalogEntrySchema = z.object({
  key: z.string(),
  label: z.string(),
  type: nlFilterTypeSchema,
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .optional(),
}) satisfies z.ZodType<NlFilterCatalogEntry>

let client: OpenAI | null = null

try {
  const apiKey = process.env.OPENAI_API_KEY_TEXT_CHECK
  if (apiKey) {
    client = new OpenAI({ apiKey })
  } else {
    console.error(
      'OPENAI_API_KEY_TEXT_CHECK is not set (nl-filters route needs it)',
    )
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client (nl-filters):', error)
  client = null
}

const nlAssistantRuntimeConfigSchema = z.object({
  excludedUrlKeys: z.array(z.string()),
  allowedSortKeys: z.array(z.string()),
  domainDescription: z.string().optional(),
  keysToClearOnFullReset: z.array(z.string()).optional(),
  paginationPageParamKey: z.string().optional(),
})

const requestBodySchema = z.object({
  userText: z.string().min(1),
  catalog: z.array(nlCatalogEntrySchema),
  assistantConfig: nlAssistantRuntimeConfigSchema,
  currentParams: z.record(z.string(), z.string()).optional(),
  currentParamsReference: z.string().optional(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsedBody = requestBodySchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsedBody.error.flatten() },
      { status: 400 },
    )
  }

  const {
    userText,
    catalog,
    assistantConfig,
    currentParams,
    currentParamsReference,
  } = parsedBody.data

  if (isClearAllFiltersIntent(userText)) {
    return NextResponse.json({
      feedback: 'Cleared all filters.',
      filterPatches: buildClearAllFilterPatches(catalog),
      sorts: [],
    })
  }

  if (!client) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured.' },
      { status: 500 },
    )
  }

  const catalogJson = JSON.stringify(catalog, null, 2)
  const currentParamsJson = JSON.stringify(currentParams ?? {}, null, 2)
  const reference =
    currentParamsReference?.trim() ||
    '(No reference string provided — infer only from JSON.)'

  const userContent = buildNlFilterUserContent({
    userText,
    catalogJson,
    currentParamsJson,
    currentParamsReference: reference,
  })

  try {
    const completion = await client.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildNlFilterSystemPrompt(assistantConfig) },
        { role: 'user', content: userContent },
      ],
      temperature: 0.2,
      response_format: zodResponseFormat(
        nlFilterResponseSchema,
        'nl_filter_response',
      ),
    })

    const message = completion.choices[0]?.message
    if (!message) {
      return NextResponse.json(
        { error: 'OpenAI returned no message' },
        { status: 500 },
      )
    }

    if (message.refusal) {
      return NextResponse.json({ error: message.refusal }, { status: 400 })
    }

    const parsed = message.parsed as NlFilterResponse | null
    if (!parsed) {
      return NextResponse.json(
        { error: 'OpenAI returned no structured payload' },
        { status: 500 },
      )
    }

    const sanitized = sanitizeNlFilterResponse(parsed, catalog, assistantConfig)

    return NextResponse.json(sanitized)
  } catch (openaiError: unknown) {
    const msg =
      openaiError instanceof Error
        ? openaiError.message
        : 'OpenAI request failed'
    console.error('nl-filters OpenAI error:', openaiError)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
