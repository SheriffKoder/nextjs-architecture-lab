/**
 * TableSection
 *
 * Purpose: Async RSC boundary for the main table / multi-view client island
 * Used in: `demo-rsc-index.tsx` inside `<Suspense>`
 */

import DemoRscContent from '../../demo-rsc-content'
import { getRentalCarsPageData } from '../../utils/server/get-rental-cars-page-data'
import type { RentalCarListQuery } from '@/features/demo-rsc-page/types/rental-car-list-query'

export default async function TableSection({ query }: { query: RentalCarListQuery }) {
  const { carsPayload } = await getRentalCarsPageData(query)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DemoRscContent cars={carsPayload.cars} />
    </div>
  )
}
