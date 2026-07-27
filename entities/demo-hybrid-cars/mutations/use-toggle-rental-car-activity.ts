/**
 * @file entities/demo-hybrid-cars/mutations/use-toggle-rental-car-activity.ts
 * TanStack mutation: optimistic available ↔ reserved toggle for the activity column.
 *
 * Purpose: Replace RSC `useOptimistic` + `router.refresh()` with cache surgery
 * Used in: `demo-hybrid-content` `columnActions.setActivity`
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { invalidateRentalCarListCaches } from '@/entities/demo-hybrid-cars/cache/invalidate-rental-car-caches'
import type { RentalCarsPageResponse } from '@/entities/demo-hybrid-cars/client/fetch-rental-cars'
import { patchRentalCarRowStatus } from '@/entities/demo-hybrid-cars/client/mutate-rental-cars'
import { getNextActivityStatus } from '@/entities/demo-hybrid-cars/lib/rental-car-activity-status'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import type { RentalCarStatusValue } from '@/entities/demo-hybrid-cars/model/rental-car-status'

type ToggleVariables = {
  id: string
  /** Current status before toggle — used to compute next + rollback. */
  currentStatus: string
}

type ToggleContext = {
  snapshots: [readonly unknown[], RentalCarsPageResponse | undefined][]
  previousDetail: RentalCarTableItem | undefined
  nextStatus: RentalCarStatusValue
}

export function useToggleRentalCarActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, currentStatus }: ToggleVariables) =>
      patchRentalCarRowStatus(id, getNextActivityStatus(currentStatus)),

    onMutate: async ({ id, currentStatus }): Promise<ToggleContext> => {
      const nextStatus = getNextActivityStatus(currentStatus)

      await queryClient.cancelQueries({ queryKey: rentalCarKeys.lists() })
      await queryClient.cancelQueries({ queryKey: rentalCarKeys.detail(id) })

      const snapshots = queryClient.getQueriesData<RentalCarsPageResponse>({
        queryKey: rentalCarKeys.lists(),
      })
      const previousDetail = queryClient.getQueryData<RentalCarTableItem>(
        rentalCarKeys.detail(id),
      )

      for (const [queryKey] of snapshots) {
        queryClient.setQueryData<RentalCarsPageResponse>(queryKey, (old) => {
          if (!old?.cars) return old
          const idx = old.cars.findIndex((c) => c.id === id)
          if (idx === -1) return old
          const cars = [...old.cars]
          cars[idx] = { ...cars[idx], status: nextStatus }
          return { ...old, cars }
        })
      }

      if (previousDetail) {
        queryClient.setQueryData(rentalCarKeys.detail(id), {
          ...previousDetail,
          status: nextStatus,
        })
      }

      return { snapshots, previousDetail, nextStatus }
    },

    onError: (_err, { id }, context) => {
      if (!context) return
      for (const [queryKey, data] of context.snapshots) {
        queryClient.setQueryData(queryKey, data)
      }
      if (context.previousDetail !== undefined) {
        queryClient.setQueryData(rentalCarKeys.detail(id), context.previousDetail)
      }
    },

    onSuccess: (car) => {
      queryClient.setQueryData(rentalCarKeys.detail(car.id), car)
      queryClient.setQueriesData<RentalCarsPageResponse>(
        { queryKey: rentalCarKeys.lists() },
        (old) => {
          if (!old?.cars) return old
          const idx = old.cars.findIndex((c) => c.id === car.id)
          if (idx === -1) return old
          const cars = [...old.cars]
          cars[idx] = car
          return { ...old, cars }
        },
      )
    },

    onSettled: () => {
      invalidateRentalCarListCaches(queryClient)
    },
  })
}
