'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import ToastContainer, { type ToastItem } from './toast-container'
import { ToastContextProvider, type ToastMethods } from './toast-context'
import OfflineDetector from './offline/offline-detector'
import type { UseOfflineToastOptions } from './offline/use-offline-toast'
import {
  DEFAULT_TOAST_STACK_GAP,
  ToastPosition,
  ToastStacking,
  ToastType,
  type AddToastPayload,
} from './toast'

type ToastProviderProps = {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
  stacking?: ToastStacking
  gap?: number
  /**
   * Optional connectivity toasts feature.
   * - false/undefined: disabled
   * - true: enabled with defaults
   * - object: enabled with custom options
   */
  offline?: boolean | UseOfflineToastOptions
}

export function ToastProvider({
  children,
  position = ToastPosition.BOTTOM_RIGHT,
  maxToasts = 5,
  stacking = ToastStacking.PUSH_DOWN,
  gap = DEFAULT_TOAST_STACK_GAP,
  offline = false,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback(
    (toast: AddToastPayload) => {
      const id = crypto.randomUUID()
      const newToast: ToastItem = {
        ...toast,
        id,
        position,
        stacking,
      }

      setToasts((prev) => {
        const updated = [newToast, ...prev]
        return updated.slice(0, maxToasts)
      })
    },
    [position, stacking, maxToasts]
  )

  const removeToast = useCallback((id?: string) => {
    if (!id) {
      return
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearToastsByGroup = useCallback((group: string) => {
    setToasts((prev) => prev.filter((toast) => toast.group !== group))
  }, [])

  const showSuccess = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({
        type: ToastType.SUCCESS,
        title,
        message,
        duration,
      })
    },
    [addToast]
  )

  const showError = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({
        type: ToastType.ERROR,
        title,
        message,
        duration,
      })
    },
    [addToast]
  )

  const showWarning = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({
        type: ToastType.WARNING,
        title,
        message,
        duration,
      })
    },
    [addToast]
  )

  const showInfo = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({
        type: ToastType.INFO,
        title,
        message,
        duration,
      })
    },
    [addToast]
  )

  const toastMethods = useMemo<ToastMethods>(
    () => ({
      showSuccess,
      showError,
      showWarning,
      showInfo,
      addToast,
      clearToastsByGroup,
    }),
    [showSuccess, showError, showWarning, showInfo, addToast, clearToastsByGroup]
  )

  return (
    <ToastContextProvider value={toastMethods}>
      {children}
      {offline ? <OfflineDetector {...(typeof offline === 'object' ? offline : {})} /> : null}
      <ToastContainer toasts={toasts} gap={gap} onRemove={removeToast} />
    </ToastContextProvider>
  )
}
