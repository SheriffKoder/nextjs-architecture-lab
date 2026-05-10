'use client'

/**
 * NL filter assistant — natural language → configurable API route → URL merge
 */

import { useCallback, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useToast } from '@/components/design/toast/use-toast'
import MaskImage from '@/components/mask-image'
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
import { useApplyTextSearchFromNlAssistant } from '@/features/ui/ai-filter/hooks/use-apply-text-search-from-nl-assistant'
import type {
  NlFilterAssistantRuntimeConfig,
  NlFilterCatalogEntry,
} from '@/features/ui/ai-filter/types/nl-filter-assistant'
import { useNavigationTransitionOptional } from '@/features/ui/filters/navigation-transition-context'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

import { NlFilterTextSearchSubmitButton } from './nl-filter-text-search-submit-button'

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

const NL_FILTER_SPARKLES_MASK_SRC = '/icons/nl-filter-sparkles.svg'
const NL_FILTER_SPARKLES_GRADIENT = {
  direction: 'to bottom right',
  colors: ['#12c2e9 0%', '#c471ed 100%'],
}

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

  const { applyTextSearch, clearTextSearch } = useApplyTextSearchFromNlAssistant(
    assistantConfig.paginationPageParamKey ?? 'page',
  )

  const hasUrlSearch = Boolean(searchParams.get('q')?.trim())

  const [text, setText] = useState('')
  const [isPending, setIsPending] = useState(false)

  const currentParamsReference = useMemo(
    () => buildNlCurrentParamsReference(catalog, searchParams),
    [catalog, searchParams],
  )

  const submit = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || isPending) return

    setIsPending(true)

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
        return
      }

      if (typeof data.feedback !== 'string') {
        showError('Unexpected response from assistant.', 'AI filter')
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
    } catch {
      showError('Network error — try again.', 'AI filter')
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
      <div
        className={cn(
          'flex py-1 w-full items-center gap-2 rounded-full bg-tertiary/10 pl-4 pr-2 backdrop-blur-sm',
          'ring-1 ring-border/30 transition-[box-shadow] focus-within:ring-tertiary/40',
        )}
      >
        <span className="text-muted-foreground border-r border-border pr-2 text-sm">Search</span>
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
          autoComplete="off"
          className={cn(
            'h-9 min-w-0 flex-1 border-0 bg-transparent px-2 py-0 text-sm text-foreground shadow-none',
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
            'inline-flex gap-1 shrink-0 items-center justify-center group',
            'text-foreground/70 hover:text-foreground hover:bg-tertiary/15 dark:hover:bg-tertiary/10',
            'disabled:pointer-events-none disabled:opacity-40',
            'transition-colors',
          )}
        >
          <span className="text-sm text-foreground/70 group-hover:text-foreground">Search with AI</span>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <span className="inline-flex group-hover:opacity-100 opacity-80" aria-hidden>
              <MaskImage
                width={16}
                height={16}
                image={NL_FILTER_SPARKLES_MASK_SRC}
                maskSize="100%"
                gradient={NL_FILTER_SPARKLES_GRADIENT}
              />
            </span>
          )}
        </button>

        <NlFilterTextSearchSubmitButton
          hasUrlSearch={hasUrlSearch}
          disabled={hasUrlSearch ? isPending : isPending || !text.trim()}
          onApply={() => {
            applyTextSearch(text)
          }}
          onClear={() => {
            clearTextSearch()
            setText('')
          }}
        />
      </div>
    </div>
  )
}
