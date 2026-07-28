/**
 * Demo Client Page — layout + data wiring
 *
 * Purpose: `PageHeader`, `FiltersHeader`, `DemoClientFilteringContent`, `PaginationFooter`, URL-driven car drawer + confirm via `CarDrawerManager` + `car-confirm-manager`
 * Used in: `app/(root)/demo-client-page/page.tsx` inside `QueryProvider` + `Suspense`
 * Why: Same URL → TanStack pattern as `features/filters/page-client/page.tsx` (`EmployeesPageContent`)
 *
 * Steps:
 * 1. `useOpenCarAddDrawer` / `useOpenCarViewDrawer` — URL drawer triggers via `useDrawerParams`
 * 2. URL filters → `listQuery` → TanStack list + options; `CarDrawerManager` owns create + edit mutations and detail fetch
 * 3. `car-confirm-manager` owns delete confirm (reads `action=delete` from URL, runs mutation, toasts)
 * 4. Render filters, table, pagination, row click → view details, drawer + confirm
 */

'use client'

import { useCallback } from 'react'
import { FiltersHeader } from '@/platform/url-kit/filters/components/filters-header'
import { PaginationFooter } from '@/platform/url-kit/filters/components/pagination-footer'
import { LoadingFiltersBar } from '@/platform/url-kit/filters/feature-filtering/components'
import { useUrlFilters } from '@/platform/url-kit/filters/feature-filtering/hooks/useUrlFilters'
import { useUrlSorting } from '@/platform/url-kit/filters/feature-sorting/hooks/useUrlSorting'
import { useUrlPagination } from '@/platform/url-kit/filters/feature-pagination/hooks'
import ActionButtons from '@/views/demo-rsc-page/ui/action-buttons'

// Toast Notifications
import { useToast } from '@/shared/ui/toast/use-toast'

import {
  rentalCarSearchConfig,
  rentalCarPaginationConfig,
  rentalCarFiltersHeaderConfig,
} from './config/header-filters-config'
import {
  useRentalCars,
  useRentalCarFilterOptions,
  type RentalCarListQuery,
} from './tanstack'
import DemoClientFilteringContent from './demo-client-filtering-content'
import type { RentalCarTableItem } from './types/rental-car-table-item'
import { CarDrawerManager, useOpenCarAddDrawer, useOpenCarViewDrawer } from './components/drawer/car-drawer-manager'
import ConfirmRoot from './components/drawer/car-confirm-manager'

export default function DemoClientIndex() {
  const openAddCarDrawer = useOpenCarAddDrawer()
  const openViewCarDrawer = useOpenCarViewDrawer()

  const handleRowOpenView = useCallback(
    (car: RentalCarTableItem) => {
      openViewCarDrawer(car.id)
    },
    [openViewCarDrawer]
  )
  const exportForMailchimpStub = useCallback(async () => {}, [])

  //// ---------------------------------------------------------------------------
  //// Toasts (page chrome; create success/error toasts live in the drawer manager)
  //// ---------------------------------------------------------------------------
  const { showError } = useToast()

  //////////////////////////////////////////////////////////////
  // URL Filters
  //////////////////////////////////////////////////////////////
  // Get URL filters
  const { getList, get, getSearch, getNumberRange } = useUrlFilters()
  const { getSorts } = useUrlSorting()
  const { page, limit } = useUrlPagination(rentalCarPaginationConfig)
  // Get sorts from URL
  const sorts = getSorts()
  // Get number ranges from URL
  const year = getNumberRange('year')
  const pricePerDay = getNumberRange('pricePerDay')
  const mileage = getNumberRange('mileage')
  const rentalStartDate = get('rentalStartDate')
  const dateParam = get('date')

  // Build query object from URL (same idea as employees `filters` in page-client/page.tsx)
  const listQuery: RentalCarListQuery = {
    status: getList('status'),
    make: getList('make'),
    location: getList('location'),
    ...(year && (year.min !== undefined || year.max !== undefined) ? { year } : {}),
    ...(pricePerDay &&
    (pricePerDay.min !== undefined || pricePerDay.max !== undefined)
      ? { pricePerDay }
      : {}),
    ...(mileage &&
    (mileage.min !== undefined || mileage.max !== undefined)
      ? { mileage }
      : {}),
    ...(rentalStartDate ? { rentalStartDate } : {}),
    ...(dateParam ? { date: dateParam } : {}),
    q: getSearch() || undefined,
    sort: sorts.length > 0 ? sorts : undefined,
    page,
    limit,
  }

  //////////////////////////////////////////////////////////////
  // Use TanStack Query to fetch rental cars
  const {
    data: carsPayload,
    isLoading: carsLoading,
    error: carsErr,
  } = useRentalCars(listQuery)

  // Use TanStack Query to fetch rental car filter options
  const {
    data: filterOptions,
    isLoading: filtersLoading,
    error: filtersErr,
  } = useRentalCarFilterOptions(listQuery)

  const cars = carsPayload?.cars ?? []
  const pagination = carsPayload?.pagination
  const filters = filterOptions ?? []

  //////////////////////////////////////////////////////////////
  // Render the page
  //////////////////////////////////////////////////////////////

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden">
      <header className="flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold tracking-tight">
            Car Rentals (Client)
          </h1>
          <p className="hidden text-sm text-muted-foreground md:block">
            Client-side data via TanStack Query, URL filters, and shared ViewOrchestrator
          </p>
        </div>

        {/* Action buttons */}
        <ActionButtons
          exportForMailchimp={exportForMailchimpStub}
          openAddCarModal={openAddCarDrawer}
          onGenerateError={() =>
            showError(
              'This is a sample error toast from the demo client page.',
              'Demo error',
              5000
            )
          }
        />
      </header>

      <div className="flex-1 overflow-y-auto flex pb-0 min-w-0 pt-2 w-full">
        <div className="h-full w-full pr-2 pt-2 min-w-0 p-2 space-y-6 flex flex-col">
          {carsErr ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {carsErr instanceof Error ? carsErr.message : 'Failed to load cars.'}
            </div>
          ) : null}

          {filtersErr ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {filtersErr instanceof Error
                ? filtersErr.message
                : 'Failed to load filter options.'}
            </div>
          ) : null}

          <div>
            {filtersLoading && !filterOptions ? (
              <div className="space-y-4 py-2">
                <LoadingFiltersBar />
              </div>
            ) : (
              <FiltersHeader
                filters={filters}
                searchConfig={rentalCarSearchConfig}
                config={rentalCarFiltersHeaderConfig}
                dateFilterKey="rentalStartDate"
                dateFilterButtonText="Filter by Rental Start Date"
                dateFilterWidth="300px"
              />
            )}
          </div>

          <DemoClientFilteringContent
            data={cars}
            filters={filters}
            carsLoading={carsLoading}
            onRowClick={handleRowOpenView}
          />

          {pagination ? (
            <PaginationFooter
              totalItems={pagination.totalItems}
              config={rentalCarPaginationConfig}
              title="Pagination"
            />
          ) : null}
        </div>
      </div>

      <CarDrawerManager listQuery={listQuery} />
      <ConfirmRoot />
    </div>
  )
}
