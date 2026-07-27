/**
 * @file platform/url-kit/url-params/providers/url-params-context.tsx
 * React context for pluggable URL transport.
 */

'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useRouterUrlTransport } from '../hooks/use-router-url-transport'
import type { UrlParamsContextValue } from '../model/types'

const UrlParamsContext = createContext<UrlParamsContextValue | null>(null)

export type UrlParamsProviderProps = {
  children: ReactNode
  value: UrlParamsContextValue
}

/** Low-level provider — prefer `ShallowUrlProvider` on hybrid pages. */
export function UrlParamsProvider({ children, value }: UrlParamsProviderProps) {
  return (
    <UrlParamsContext.Provider value={value}>{children}</UrlParamsContext.Provider>
  )
}

/**
 * Read URL transport from context, or fall back to App Router transport.
 */
export function useUrlParamsTransport(): UrlParamsContextValue {
  const context = useContext(UrlParamsContext)
  const routerFallback = useRouterUrlTransport()
  return context ?? routerFallback
}

/**
 * Effective search params for presentational components (pagination footer, search bar, …).
 */
export function useEffectiveSearchParams(): URLSearchParams {
  return useUrlParamsTransport().getEffectiveParams()
}
