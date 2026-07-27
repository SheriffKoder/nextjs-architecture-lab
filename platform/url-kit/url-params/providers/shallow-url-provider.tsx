/**
 * @file platform/url-kit/url-params/providers/shallow-url-provider.tsx
 * Convenience provider for hybrid / TanStack list pages.
 */

'use client'

import type { ReactNode } from 'react'
import { UrlParamsProvider } from './url-params-context'
import { useShallowUrlTransport } from '../hooks/use-shallow-url-transport'

export type ShallowUrlProviderProps = {
  children: ReactNode
  /** Server-rendered query string without leading `?` */
  initialSnapshot: string
}

function ShallowUrlProviderInner({
  children,
  initialSnapshot,
}: ShallowUrlProviderProps) {
  const transport = useShallowUrlTransport({ initialSnapshot })
  return <UrlParamsProvider value={transport}>{children}</UrlParamsProvider>
}

/**
 * Shallow URL transport — `replaceState` without App Router navigation.
 */
export function ShallowUrlProvider({
  children,
  initialSnapshot,
}: ShallowUrlProviderProps) {
  return (
    <ShallowUrlProviderInner initialSnapshot={initialSnapshot}>
      {children}
    </ShallowUrlProviderInner>
  )
}
