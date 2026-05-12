'use client'

/**
 * NL filter assistant — natural language → configurable API route → URL merge
 */

import { useCallback, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useToast } from '@/components/design/toast/use-toast'
import { Input } from '@/components/ui/input'
import { applyNlFilterPatchToSearchParams } from '@/features/ui/ai-filter/lib/apply-nl-filter-patch-to-search-params'
import { buildNlCurrentParamsReference } from '@/features/ui/ai-filter/lib/build-nl-current-params-reference'
import {
  buildClearAllFilterPatches,
  isClearAllFiltersIntent,
  isFullCatalogClear,
  resetNlApplyPaginationPage,
  stripNlResetKeys,
} from '@/features/ui/ai-filter/lib/nl-filter-clear-helpers'
import type {
  NlFilterAssistantRuntimeConfig,
  NlFilterCatalogEntry,
} from '@/features/ui/ai-filter/types/nl-filter-assistant'
import { useNavigationTransitionOptional } from '@/features/ui/filters/navigation-transition-context'
import { cn } from '@/lib/utils'
import { Loader2, Search, Sparkles } from 'lucide-react'

// import { NlFilterFeedback } from './nl-filter-feedback'

function searchParamsToPlainRecord(sp: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {}
  sp.forEach((value, key) => {
    out[key] = value
  })
  return out
}

export type NlFilterAssistantProps = {
  catalog: NlFilterCatalogEntry[]
  assistantConfig: NlFilterAssistantRuntimeConfig
  /** POST handler that accepts the NL filter body (must run sanitize + OpenAI with same schema). */
  apiPath: string
  /** Input placeholder (host-defined copy). */
  placeholder?: string
  /** Container class name. */
  className?: string
}

const DEFAULT_PLACEHOLDER = 'e.g search to filter and sort results"'

export function NlFilterAssistant({
  catalog,
  assistantConfig,
  apiPath,
  placeholder = DEFAULT_PLACEHOLDER,
  className,
}: NlFilterAssistantProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { wrapNavigation } = useNavigationTransitionOptional()
  const { showError, showInfo, showSuccess } = useToast()

  const [text, setText] = useState('')
  // const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const currentParamsReference = useMemo(
    () => buildNlCurrentParamsReference(catalog, searchParams),
    [catalog, searchParams],
  )

  const submit = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || isPending) return

    setIsPending(true)
    // setFeedback(null)

    try {
      const clearIntent = isClearAllFiltersIntent(trimmed)

      if (clearIntent) {
        const patches = buildClearAllFilterPatches(catalog)
        let qs = applyNlFilterPatchToSearchParams({
          current: new URLSearchParams(searchParams.toString()),
          catalog,
          filterPatches: patches,
          sorts: [],
        }).queryString
        qs = stripNlResetKeys(qs, assistantConfig.keysToClearOnFullReset)
        qs = resetNlApplyPaginationPage(
          qs,
          assistantConfig.paginationPageParamKey ?? 'page',
        )
        const href = qs ? `${pathname}?${qs}` : pathname
        if (qs !== searchParams.toString()) {
          wrapNavigation(() => {
            router.replace(href, { scroll: false })
          })
        }
        showSuccess('Cleared all filters.', 'Filters')
        // setFeedback('Cleared all filters.')
        return
      }

      const currentParams = searchParamsToPlainRecord(searchParams)
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userText: trimmed,
          catalog,
          assistantConfig,
          currentParams,
          currentParamsReference,
        }),
      })

      const data = (await res.json()) as {
        feedback?: string
        filterPatches?: Record<string, unknown>
        sorts?: { key: string; direction: 'asc' | 'desc' }[]
        error?: string
      }

      if (!res.ok) {
        showError(data.error ?? `Request failed (${res.status})`, 'AI filter')
        // setFeedback(data.error ?? `Request failed (${res.status})`)
        return
      }

      if (typeof data.feedback !== 'string') {
        showError('Unexpected response from assistant.', 'AI filter')
        // setFeedback('Unexpected response from assistant.')
        return
      }

      const patches = data.filterPatches ?? {}
      let qs = applyNlFilterPatchToSearchParams({
        current: new URLSearchParams(searchParams.toString()),
        catalog,
        filterPatches: patches,
        sorts: data.sorts,
      }).queryString

      if (
        assistantConfig.keysToClearOnFullReset?.length &&
        isFullCatalogClear(patches, catalog)
      ) {
        qs = stripNlResetKeys(qs, assistantConfig.keysToClearOnFullReset)
      }

      qs = resetNlApplyPaginationPage(
        qs,
        assistantConfig.paginationPageParamKey ?? 'page',
      )

      const href = qs ? `${pathname}?${qs}` : pathname
      if (qs !== searchParams.toString()) {
        wrapNavigation(() => {
          router.replace(href, { scroll: false })
        })
      }

      showInfo(data.feedback, 'AI filter')
      // setFeedback(data.feedback)
    } catch {
      showError('Network error — try again.', 'AI filter')
      // setFeedback('Network error — try again.')
    } finally {
      setIsPending(false)
    }
  }, [
    apiPath,
    assistantConfig,
    catalog,
    currentParamsReference,
    isPending,
    pathname,
    router,
    searchParams,
    showError,
    showInfo,
    showSuccess,
    text,
    wrapNavigation,
  ])

  return (
    <div className={className}>
      {/* <label htmlFor="nl-filter-assistant-input" className="text-sm font-medium text-foreground">
        Describe filters or sorting
      </label> */}
      <div
        className={cn(
          'flex py-1 w-full items-center gap-2 rounded-full bg-tertiary/10 pl-3 pr-2 backdrop-blur-sm',
          'ring-1 ring-border/30 transition-[box-shadow] focus-within:ring-tertiary/40',
        )}
      >
        <Search
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="nl-filter-assistant-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void submit()
            }
          }}
          placeholder={placeholder}
          disabled={isPending}
          className={cn(
            'h-9 min-w-0 flex-1 border-0 bg-transparent py-0 text-sm text-foreground shadow-none px-2',
            'placeholder:text-muted-foreground',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
        <button
          type="button"
          disabled={isPending || !text.trim()}
          aria-label={isPending ? 'Applying…' : 'Apply with AI'}
          onClick={() => void submit()}
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
            'bg-tertiary dark:bg-tertiary/80 text-white dark:text-white/80 hover:bg-tertiary/15 dark:hover:bg-tertiary/100',
            'disabled:pointer-events-none disabled:opacity-40',
            'transition-colors',
          )}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
        </button>
      </div>
      {/* {feedback ? <NlFilterFeedback text={feedback} /> : null} */}
    </div>
  )
}
