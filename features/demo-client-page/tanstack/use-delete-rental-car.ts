/**
 * Demo Client Page — TanStack mutation: DELETE rental car by id
 *
 * Purpose: `useMutation` + optimistic removal from all cached list queries + rollback on error
 * Used in: `ConfirmRoot` (URL-driven delete confirm)
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalCarKeys } from './key-factory'
import { deleteRentalCar, type RentalCarsPageResponse } from './handler'

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
      queryClient.invalidateQueries({ queryKey: rentalCarKeys.optionsAll() })
    },
  })
}
