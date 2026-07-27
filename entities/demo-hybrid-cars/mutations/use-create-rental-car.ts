/**
 * @file entities/demo-hybrid-cars/mutations/use-create-rental-car.ts
 * TanStack mutation: create rental car with optimistic list prepend.
 *
 * Purpose: Add a car without `revalidatePath` / `router.refresh`
 * Used in: hybrid create drawer form
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import {
  invalidateRentalCarListCaches,
  invalidateRentalCarOptionCaches,
} from '@/entities/demo-hybrid-cars/cache/invalidate-rental-car-caches'
import type { RentalCarsPageResponse } from '@/entities/demo-hybrid-cars/client/fetch-rental-cars'
import {
  createRentalCar,
  type CreateRentalCarInput,
} from '@/entities/demo-hybrid-cars/client/mutate-rental-cars'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'

export type CreateRentalCarVariables = CreateRentalCarInput | RentalCarTableItem

type CreateRentalCarContext = {
  snapshots: [readonly unknown[], RentalCarsPageResponse | undefined][]
  tempId: string
}

function toTableRowWithId(
  variables: CreateRentalCarVariables,
  id: string,
): RentalCarTableItem {
  return { ...(variables as RentalCarTableItem), id }
}

export function useCreateRentalCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: CreateRentalCarVariables) => createRentalCar(variables),

    onMutate: async (variables): Promise<CreateRentalCarContext> => {
      await queryClient.cancelQueries({ queryKey: rentalCarKeys.lists() })

      const snapshots = queryClient.getQueriesData<RentalCarsPageResponse>({
        queryKey: rentalCarKeys.lists(),
      })
      const tempId = `temp-${crypto.randomUUID()}`
      const tempRow = toTableRowWithId(variables, tempId)

      for (const [queryKey] of snapshots) {
        queryClient.setQueryData<RentalCarsPageResponse>(queryKey, (old) => {
          if (!old) return old
          return {
            cars: [tempRow, ...old.cars],
            pagination: {
              ...old.pagination,
              totalItems: old.pagination.totalItems + 1,
            },
          }
        })
      }

      return { snapshots, tempId }
    },

    onError: (_err, _variables, context) => {
      if (!context?.snapshots) return
      for (const [queryKey, data] of context.snapshots) {
        queryClient.setQueryData(queryKey, data)
      }
    },

    onSuccess: (data, _variables, context) => {
      if (!context) return

      for (const [queryKey] of context.snapshots) {
        queryClient.setQueryData<RentalCarsPageResponse>(queryKey, (old) => {
          if (!old) return old
          return {
            ...old,
            cars: old.cars.map((c) => (c.id === context.tempId ? data : c)),
          }
        })
      }

      queryClient.setQueryData(rentalCarKeys.detail(data.id), data)
    },

    onSettled: () => {
      invalidateRentalCarListCaches(queryClient)
      invalidateRentalCarOptionCaches(queryClient)
    },
  })
}
