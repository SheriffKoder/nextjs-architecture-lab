/**
 * Car Drawer Manager
 *
 * Purpose: `RightDrawer` shell + URL-driven mode branches (add / view / edit) for rental cars
 * Used in: `demo-client-index.tsx`
 * Used for: Renders the correct body component based on `useDrawerParams`, owns create + update mutations and detail queries
 *
 * Steps:
 * 1. Read drawer state from `useDrawerParams`
 * 2. Branch to `AddDrawerBody` / `ViewDrawerBody` / `EditDrawerBody` by `mode`
 * 3. Each body owns its own TanStack query/mutation + toasts
 * 4. Delete confirm is NOT here — driven by `ConfirmRoot` via URL `action=delete`
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import RightDrawer from '@/components/design/right-drawer'
import { useToast } from '@/components/design/toast/use-toast'
import CarSliderForm from './car-add-slider-form'
import DemoClientCarViewDrawerContainer from './view-drawer-container'
import EditSliderForm from './car-edit-slider-form'
import { useDrawerParams } from '@/features/ui/drawer'
import {
  useCreateRentalCar,
  useRentalCarDetail,
  useUpdateRentalCar,
  type RentalCarListQuery,
} from '../../tanstack'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import type { RentalCarEditFormValues } from '../../validation/rental-car-edit-form-schema'

/////////////////////////////////////////////////////////////
// Add branch — create mutation + form
/////////////////////////////////////////////////////////////

//////////////////////////////////
// AddDrawerBody — handles create mutation, renders CarSliderForm
// Used in: CarDrawerManager (mode=add)
// Used for: New car creation flow
//////////////////////////////////
function AddDrawerBody({
  listQuery,
  formRemountKey,
  onClose,
}: {
  listQuery: RentalCarListQuery
  formRemountKey: number
  onClose: () => void
}) {
  const createCar = useCreateRentalCar(listQuery)
  const { showError, showSuccess } = useToast()

  const handlePersist = useCallback(
    (values: RentalCarTableItem) => {
      createCar.mutate(values, {
        onSuccess: () => {
          showSuccess('Car created successfully!', 'Success', 5000)
          onClose()
        },
        onError: (e) => {
          showError(
            e instanceof Error ? e.message : 'Failed to create car.',
            'Create failed',
            5000
          )
        },
      })
    },
    [createCar, onClose, showError, showSuccess]
  )

  return (
    <CarSliderForm
      key={formRemountKey}
      onSubmitPersist={handlePersist}
      isSubmitting={createCar.isPending}
    />
  )
}
//////////////////////////////////

/////////////////////////////////////////////////////////////
// View branch — detail query + read-only collapsible cards
/////////////////////////////////////////////////////////////

//////////////////////////////////
// ViewDrawerBody — fetches car detail, renders read-only view container
// Used in: CarDrawerManager (mode=view)
// Used for: Read-only car details with switch-to-edit affordance
//////////////////////////////////
function ViewDrawerBody({
  entityId,
  onClose,
  onSwitchToEdit,
}: {
  entityId: string
  onClose: () => void
  onSwitchToEdit: () => void
}) {
  const { data, isLoading, error } = useRentalCarDetail(entityId)

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
        Loading car…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <p className="text-sm text-foreground">
          {error instanceof Error ? error.message : 'Could not load this car.'}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50"
        >
          Close
        </button>
      </div>
    )
  }

  return <DemoClientCarViewDrawerContainer car={data} onSwitchToEdit={onSwitchToEdit} />
}
//////////////////////////////////

/////////////////////////////////////////////////////////////
// Edit branch — detail query + update mutation + form
/////////////////////////////////////////////////////////////

//////////////////////////////////
// EditDrawerBody — fetches car detail, handles PATCH, delegates delete to URL action
// Used in: CarDrawerManager (mode=edit)
// Used for: Partial edit form with undo/save and delete trigger via URL
//////////////////////////////////
function EditDrawerBody({
  entityId,
  onClose,
  onRequestDelete,
}: {
  entityId: string
  onClose: () => void
  onRequestDelete: (displayLabel: string) => void
}) {
  const { data, isLoading, error } = useRentalCarDetail(entityId)
  const updateCar = useUpdateRentalCar()
  const { showError, showSuccess } = useToast()

  const handlePersist = useCallback(
    (patch: RentalCarEditFormValues) => {
      updateCar.mutate(
        { id: entityId, patch },
        {
          onSuccess: () => {
            showSuccess('Car updated successfully!', 'Success', 5000)
            onClose()
          },
          onError: (e) => {
            showError(
              e instanceof Error ? e.message : 'Failed to update car.',
              'Update failed',
              5000
            )
          },
        }
      )
    },
    [entityId, onClose, showError, showSuccess, updateCar]
  )

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
        Loading car…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <p className="text-sm text-foreground">
          {error instanceof Error ? error.message : 'Could not load this car.'}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <EditSliderForm
      key={entityId}
      initialCar={data}
      onSubmitPersist={handlePersist}
      isSubmitting={updateCar.isPending}
      onRequestDelete={onRequestDelete}
    />
  )
}
//////////////////////////////////

/////////////////////////////////////////////////////////////
// Drawer manager — shell + mode switching
/////////////////////////////////////////////////////////////

export interface CarDrawerManagerProps {
  listQuery: RentalCarListQuery
}

//////////////////////////////////
// CarDrawerManager — reads drawer params, renders RightDrawer with the correct body
// Used in: `demo-client-index.tsx`
// Used for: Single drawer shell for car add / view / edit, no delete logic (ConfirmRoot owns that)
//////////////////////////////////
export function CarDrawerManager({ listQuery }: CarDrawerManagerProps) {
  const { isOpen, mode, id, closeDrawer, setParams } = useDrawerParams()

  // Fresh create form when entering mode=add
  const [addFormKey, setAddFormKey] = useState(0)
  const wasAddOpenRef = useRef(false)
  useEffect(() => {
    const addOpen = mode === 'add' && isOpen
    if (addOpen && !wasAddOpenRef.current) {
      setAddFormKey((k) => k + 1)
    }
    wasAddOpenRef.current = addOpen
  }, [mode, isOpen])

  // Switch view → edit: keep drawer + id, only change mode
  const switchToEdit = useCallback(() => {
    setParams({ mode: 'edit' })
  }, [setParams])

  // Delete trigger from edit header: set action=delete (ConfirmRoot picks it up)
  const requestDelete = useCallback(
    (_displayLabel: string) => {
      setParams({ action: 'delete' })
    },
    [setParams]
  )

  return (
    <RightDrawer isOpen={isOpen} onClose={closeDrawer}>
      {mode === 'add' ? (
        <AddDrawerBody
          listQuery={listQuery}
          formRemountKey={addFormKey}
          onClose={closeDrawer}
        />
      ) : null}
      {mode === 'view' && id ? (
        <ViewDrawerBody
          entityId={id}
          onClose={closeDrawer}
          onSwitchToEdit={switchToEdit}
        />
      ) : null}
      {mode === 'edit' && id ? (
        <EditDrawerBody
          entityId={id}
          onClose={closeDrawer}
          onRequestDelete={requestDelete}
        />
      ) : null}
    </RightDrawer>
  )
}
//////////////////////////////////

/////////////////////////////////////////////////////////////
// Open-trigger hooks — thin wrappers around setParams
/////////////////////////////////////////////////////////////

//////////////////////////////////
// useOpenCarAddDrawer — sets drawer=car, mode=add
// Used in: page header action buttons
// Used for: Opens the car create drawer
//////////////////////////////////
export function useOpenCarAddDrawer(): () => void {
  const { setParams } = useDrawerParams()
  return useCallback(() => {
    setParams({ drawer: 'car', mode: 'add' })
  }, [setParams])
}
//////////////////////////////////

//////////////////////////////////
// useOpenCarViewDrawer — sets drawer=car, mode=view, id
// Used in: table row click, list item click
// Used for: Opens the read-only car detail drawer
//////////////////////////////////
export function useOpenCarViewDrawer(): (id: string) => void {
  const { setParams } = useDrawerParams()
  return useCallback(
    (id: string) => {
      setParams({ drawer: 'car', mode: 'view', id })
    },
    [setParams]
  )
}
//////////////////////////////////

//////////////////////////////////
// useOpenCarEditDrawer — sets drawer=car, mode=edit, id
// Used in: view-to-edit transition, future table row actions
// Used for: Opens the car edit drawer
//////////////////////////////////
export function useOpenCarEditDrawer(): (id: string) => void {
  const { setParams } = useDrawerParams()
  return useCallback(
    (id: string) => {
      setParams({ drawer: 'car', mode: 'edit', id })
    },
    [setParams]
  )
}
//////////////////////////////////
