/**
 * @file views/demo-hybrid-page/ui/drawer/modes/create/create-content.tsx
 * Create mode (`mode=create`) — form + TanStack create mutation.
 */

'use client'

import { useCallback, useRef, useState } from 'react'
import { useDrawerActions } from '@/platform/url-kit/url-drawer'
import { useToast } from '@/shared/ui/toast/use-toast'
import { useCreateRentalCar } from '@/entities/demo-hybrid-cars/mutations'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import { CarDrawerCreateHeader } from '../../chrome/sticky-header'
import { HybridCarCreateForm } from '../../forms/create-form'

const HYBRID_CAR_CREATE_FORM_ID = 'hybrid-car-create-form'

export default function CarDrawerCreateContent() {
  const { close } = useDrawerActions()
  const { showError, showSuccess } = useToast()
  const createCar = useCreateRentalCar()
  const [formRemountKey, setFormRemountKey] = useState(0)
  const resetFormRef = useRef<(() => void) | null>(null)

  const handlePersist = useCallback(
    (values: RentalCarTableItem) => {
      createCar.mutate(values, {
        onSuccess: (car) => {
          showSuccess(
            `${car.year} ${car.make} ${car.model}`,
            'Car created',
            5000,
          )
          close()
        },
        onError: (e) => {
          showError(
            e instanceof Error ? e.message : 'Failed to create car.',
            'Create failed',
            8000,
          )
        },
      })
    },
    [close, createCar, showError, showSuccess],
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CarDrawerCreateHeader
        formId={HYBRID_CAR_CREATE_FORM_ID}
        isSubmitting={createCar.isPending}
        onResetForm={() => {
          resetFormRef.current?.()
          setFormRemountKey((k) => k + 1)
        }}
      />
      <HybridCarCreateForm
        key={formRemountKey}
        formId={HYBRID_CAR_CREATE_FORM_ID}
        onSubmitPersist={handlePersist}
        isSubmitting={createCar.isPending}
        onRegisterActions={(actions) => {
          resetFormRef.current = actions.resetForm
        }}
      />
    </div>
  )
}
