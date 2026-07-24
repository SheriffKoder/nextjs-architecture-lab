/**
 * Demo Client Page — TanStack mutation: PATCH partial rental car
 *
 * Purpose: `useMutation` + sync list + detail cache after mock store update
 * Used in: `DemoClientCreateCarDrawerManager` (edit drawer save)
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalCarKeys } from './key-factory'
import { updateRentalCarPartial, type RentalCarsPageResponse } from './handler'
import type { RentalCarEditFormValues } from '../validation/rental-car-edit-form-schema'

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
        }
      )
    },
  })
}
