'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { AddToastPayload } from './toast'

export interface ToastMethods {
  showSuccess: (message: string, title?: string, duration?: number) => void
  showError: (message: string, title?: string, duration?: number) => void
  showWarning: (message: string, title?: string, duration?: number) => void
  showInfo: (message: string, title?: string, duration?: number) => void
  addToast: (toast: AddToastPayload) => void
  clearToastsByGroup: (group: string) => void
}

const ToastContext = createContext<ToastMethods | null>(null)

export function ToastContextProvider({
  value,
  children,
}: {
  value: ToastMethods
  children: ReactNode
}) {
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToastContext(): ToastMethods {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
