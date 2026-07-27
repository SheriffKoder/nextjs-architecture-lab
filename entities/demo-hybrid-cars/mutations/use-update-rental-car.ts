/**
 * @file entities/demo-hybrid-cars/mutations/use-update-rental-car.ts
 * TanStack mutation: PATCH partial rental car (edit drawer).
 *
 * Purpose: Sync detail + list caches after mock store update
 * Used in: hybrid edit drawer form
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import {
  invalidateRentalCarListCaches,
  invalidateRentalCarOptionCaches,
} from '@/entities/demo-hybrid-cars/cache/invalidate-rental-car-caches'
import type { RentalCarsPageResponse } from '@/entities/demo-hybrid-cars/client/fetch-rental-cars'
import { updateRentalCarPartial } from '@/entities/demo-hybrid-cars/client/mutate-rental-cars'
import type { RentalCarEditFormValues } from '@/entities/demo-hybrid-cars/schema/rental-car-edit-form-schema'

export type UpdateRentalCarVariables = { id: string; patch: RentalCarEditFormValues }

export function useUpdateRentalCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, patch }: UpdateRentalCarVariables) =>
      updateRentalCarPartial(id, patch),

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
      invalidateRentalCarOptionCaches(queryClient)
    },
  })
}
