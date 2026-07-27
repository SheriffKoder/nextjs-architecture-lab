/**
 * @file views/demo-hybrid-page/ui/drawer/modes/edit/edit-content.tsx
 * Edit mode (`mode=edit`) — seeds from TanStack detail; PATCH via mutation.
 */

'use client'

import { useCallback, useRef } from 'react'
import { useToast } from '@/shared/ui/toast/use-toast'
import { useRentalCarDetail } from '@/entities/demo-hybrid-cars/queries'
import { useUpdateRentalCar } from '@/entities/demo-hybrid-cars/mutations'
import type { RentalCarEditFormValues } from '@/entities/demo-hybrid-cars/schema/rental-car-edit-form-schema'
import { CarDrawerEditHeader } from '../../chrome/sticky-header'
import { HybridCarEditForm } from '../../forms/edit-form'

const HYBRID_CAR_EDIT_FORM_ID = 'hybrid-car-edit-form'

interface CarDrawerEditContentProps {
  id: string
}

export default function CarDrawerEditContent({ id }: CarDrawerEditContentProps) {
  const { data: car, isLoading, error } = useRentalCarDetail(id)
  const updateCar = useUpdateRentalCar()
  const { showError, showSuccess } = useToast()
  const resetFormRef = useRef<(() => void) | null>(null)

  const handlePersist = useCallback(
    (patch: RentalCarEditFormValues) => {
      updateCar.mutate(
        { id, patch },
        {
          onSuccess: (updated) => {
            showSuccess(
              `${updated.make} ${updated.model} saved`,
              'Car updated',
              5000,
            )
          },
          onError: (e) => {
            showError(
              e instanceof Error ? e.message : 'Failed to update car.',
              'Update failed',
              8000,
            )
          },
        },
      )
    },
    [id, showError, showSuccess, updateCar],
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CarDrawerEditHeader
        id={id}
        formId={HYBRID_CAR_EDIT_FORM_ID}
        isSubmitting={updateCar.isPending}
        onResetForm={() => resetFormRef.current?.()}
      />

      {isLoading && !car ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          Loading car…
        </div>
      ) : error || !car ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Could not load this car.'}
        </div>
      ) : (
        <HybridCarEditForm
          formId={HYBRID_CAR_EDIT_FORM_ID}
          initialCar={car}
          onSubmitPersist={handlePersist}
          isSubmitting={updateCar.isPending}
          onRegisterActions={(actions) => {
            resetFormRef.current = actions.resetForm
          }}
        />
      )}
    </div>
  )
}
