/**
 * @file entities/demo-hybrid-cars/mutations/use-delete-rental-car.ts
 * TanStack mutation: DELETE rental car with optimistic list removal.
 *
 * Purpose: Remove a row without `revalidatePath` / `router.refresh`
 * Used in: hybrid delete confirmation modal
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import {
  invalidateRentalCarListCaches,
  invalidateRentalCarOptionCaches,
} from '@/entities/demo-hybrid-cars/cache/invalidate-rental-car-caches'
import type { RentalCarsPageResponse } from '@/entities/demo-hybrid-cars/client/fetch-rental-cars'
import { deleteRentalCar } from '@/entities/demo-hybrid-cars/client/mutate-rental-cars'

export function useDeleteRentalCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRentalCar(id),

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: rentalCarKeys.all() })

      const snapshots = queryClient.getQueriesData<RentalCarsPageResponse>({
        queryKey: rentalCarKeys.lists(),
      })

      for (const [queryKey] of snapshots) {
        queryClient.setQueryData<RentalCarsPageResponse>(queryKey, (old) => {
          if (!old?.cars) return old
          if (!old.cars.some((c) => c.id === deletedId)) return old
          return {
            ...old,
            cars: old.cars.filter((c) => c.id !== deletedId),
            pagination: {
              ...old.pagination,
              totalItems: Math.max(0, old.pagination.totalItems - 1),
            },
          }
        })
      }

      queryClient.removeQueries({ queryKey: rentalCarKeys.detail(deletedId) })

      return { snapshots }
    },

    onError: (_err, _deletedId, context) => {
      if (!context?.snapshots) return
      for (const [queryKey, data] of context.snapshots) {
        queryClient.setQueryData(queryKey, data)
      }
    },

    onSettled: () => {
      invalidateRentalCarListCaches(queryClient)
      invalidateRentalCarOptionCaches(queryClient)
    },
  })
}
