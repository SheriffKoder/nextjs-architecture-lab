'use client'

import { Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'

export type NlFilterTextSearchSubmitButtonProps = {
  /** When the URL already has a non-empty `q`, show clear (X) instead of apply (search). */
  hasUrlSearch: boolean
  disabled: boolean
  onApply: () => void
  onClear: () => void
}

/**
 * Compact control: apply field text as normal URL search (`q`), aligned with
 * {@link features/ui/filters/feature-filtering/components/expandable-search/expandable-search-control.tsx} behavior.
 * When `q` is already set, swaps to an X that clears `q` (and page) from the URL.
 */
export function NlFilterTextSearchSubmitButton({
  hasUrlSearch,
  disabled,
  onApply,
  onClear,
}: NlFilterTextSearchSubmitButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={hasUrlSearch ? 'Clear search' : 'Apply as search'}
      title={hasUrlSearch ? 'Clear search' : 'Apply as search'}
      onClick={hasUrlSearch ? onClear : onApply}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
        'bg-background hover:bg-tertiary/15 dark:hover:bg-tertiary/10',
        'disabled:pointer-events-none disabled:opacity-40',
        'transition-colors',
      )}
    >
      {hasUrlSearch ? (
        <X className="size-4 text-muted-foreground" aria-hidden />
      ) : (
        <Search className="size-4 text-muted-foreground" aria-hidden />
      )}
    </button>
  )
}
