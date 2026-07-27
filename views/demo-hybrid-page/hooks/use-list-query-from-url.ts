/**
 * @file views/demo-hybrid-page/hooks/use-list-query-from-url.ts
 * Derive typed list query from url-kit transport (shallow or router).
 */

'use client'

import { useMemo } from 'react'
import { useUrlParamsTransport } from '@/platform/url-kit/url-params'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import { parseListQueryFromSearchParams } from '@/entities/demo-hybrid-cars/transform/parse-list-query-from-search-params'

/**
 * TanStack `queryKey` source — reads current URL via transport layer.
 */
export function useListQueryFromUrl(): RentalCarListQuery {
  const { effectiveParams } = useUrlParamsTransport()
  return useMemo(
    () => parseListQueryFromSearchParams(effectiveParams),
    [effectiveParams]
  )
}
