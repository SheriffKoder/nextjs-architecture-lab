/**
 * Demo Client Page — TanStack mutation: create rental car
 *
 * Purpose: `useMutation` + optimistic list cache patch; forward-prep invalidation commented out until GET uses DB
 * Used in: `demo-client-index.tsx` (slider save / add flow)
 * Why: Mock GET does not include new rows — refetch would drop them; reconcile from POST `car` instead
 */

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalCarKeys } from './key-factory'
import type { RentalCarListQuery } from './key-factory'
import {
  createRentalCar,
  type CreateRentalCarInput,
  type RentalCarsPageResponse,
} from './handler'
import type { RentalCarTableItem } from '../types/rental-car-table-item'

export type CreateRentalCarVariables = CreateRentalCarInput | RentalCarTableItem

type CreateRentalCarContext = {
  listKey: ReturnType<typeof rentalCarKeys.list>
  previous: RentalCarsPageResponse | undefined
  tempId: string
}

function toTableRowWithId(
  variables: CreateRentalCarVariables,
  id: string
): RentalCarTableItem {
  const base = variables as RentalCarTableItem
  return { ...base, id }
}

//////////////////////////////////
// useCreateRentalCar
// Purpose: Optimistic prepend + replace temp id with server row on success; rollback on error
// Used in: demo client page index + slider
// Used for: Add car without relying on mock list refetch until DB migration
//////////////////////////////////
export function useCreateRentalCar(listQuery?: RentalCarListQuery) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: CreateRentalCarVariables) => createRentalCar(variables),

    onMutate: async (variables): Promise<CreateRentalCarContext> => {
      const listKey = rentalCarKeys.list(listQuery)
      await queryClient.cancelQueries({ queryKey: listKey })

      const previous = queryClient.getQueryData<RentalCarsPageResponse>(listKey)
      const tempId = `temp-${crypto.randomUUID()}`
      const tempRow = toTableRowWithId(variables, tempId)

      queryClient.setQueryData<RentalCarsPageResponse>(listKey, (old) => {
        if (!old) return old
        return {
          cars: [tempRow, ...old.cars],
          pagination: {
            ...old.pagination,
            totalItems: old.pagination.totalItems + 1,
          },
        }
      })

      return { listKey, previous, tempId }
    },

    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.listKey, context.previous)
      }
    },

    onSuccess: (data, _variables, context) => {
      if (!context) return

      queryClient.setQueryData<RentalCarsPageResponse>(context.listKey, (old) => {
        if (!old) return old
        return {
          ...old,
          cars: old.cars.map((c) => (c.id === context.tempId ? data : c)),
        }
      })

      // Uncomment when `getRentalCarsData` / filter options read from the same DB as POST.
      // queryClient.invalidateQueries({ queryKey: rentalCarKeys.lists() })
      // queryClient.invalidateQueries({ queryKey: rentalCarKeys.optionsAll() })
    },
  })
}
