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
 * Convert transport/HTTP error text into compact toast copy.
 */
function getFriendlyQueryErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!(error instanceof Error)) return fallbackMessage

  const raw = error.message.trim()
  if (!raw) return fallbackMessage

  // Most fetch wrappers throw "Failed to fetch <entity>: <status> <statusText>".
  const responseDetail = raw.match(/:\s*(\d{3})\s*(.*)$/)
  if (responseDetail) {
    const status = responseDetail[1]
    const statusText = responseDetail[2]?.trim()

    if (status === '401') return 'Unauthorized. Please sign in again.'
    if (status === '403') return 'You do not have permission for this action.'
    if (status === '404') return 'Requested data was not found.'
    if (status.startsWith('5')) return `Server error (${status}). Please try again.`
    if (statusText) return `${statusText} (${status}).`
    return `Request failed (${status}).`
  }

  // Browser/network failures often surface as plain "Failed to fetch".
  if (/failed to fetch/i.test(raw)) {
    return 'Network error. Please check your connection and retry.'
  }

  // Fall back to the original message only when it is already concise.
  return raw.length <= 96 ? raw : fallbackMessage
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

    const message = getFriendlyQueryErrorMessage(error, fallbackMessage)

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
