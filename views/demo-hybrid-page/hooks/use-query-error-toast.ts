/**
 * @file views/demo-hybrid-page/hooks/use-query-error-toast.ts
 * Shows a persistent error toast with Retry when a TanStack query fails.
 */

'use client'

import { useEffect } from 'react'
import { ToastType } from '@/shared/ui/toast/toast'
import { useToast } from '@/shared/ui/toast/use-toast'

type UseQueryErrorToastOptions = {
  /** Stable group id — cleared when error resolves or before re-showing */
  group: string
  error: unknown
  title: string
  fallbackMessage: string
  onRetry: () => void
}

/**
 * Toast on query failure; clears the group when `error` is null/undefined.
 */
export function useQueryErrorToast({
  group,
  error,
  title,
  fallbackMessage,
  onRetry,
}: UseQueryErrorToastOptions) {
  const { addToast, clearToastsByGroup } = useToast()

  useEffect(() => {
    if (!error) {
      clearToastsByGroup(group)
      return
    }

    const message =
      error instanceof Error ? error.message : fallbackMessage

    clearToastsByGroup(group)
    addToast({
      type: ToastType.ERROR,
      title,
      message,
      duration: 0,
      group,
      action: {
        label: 'Retry',
        onClick: onRetry,
      },
    })
  }, [
    error,
    group,
    title,
    fallbackMessage,
    onRetry,
    addToast,
    clearToastsByGroup,
  ])
}
