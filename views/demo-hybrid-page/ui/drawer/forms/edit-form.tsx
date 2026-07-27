/**
 * @file views/demo-hybrid-page/ui/drawer/forms/edit-form.tsx
 * Partial edit form — RHF + Zod; parent chrome owns Reset/Save via `formId`.
 *
 * Purpose: Validated edit patch → TanStack `useUpdateRentalCar` via `onSubmitPersist`
 * Used in: `modes/edit/edit-content.tsx`
 */

'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Controller, useForm, useWatch, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, DollarSign, Gauge, MapPin, Tag } from 'lucide-react'
import { useToast } from '@/shared/ui/toast/use-toast'
import GlassInput from '@/shared/ui/inputs/glass-input'
import DropdownSelect from '@/shared/ui/multi-select'
import type { DropdownItem } from '@/shared/ui/multi-select'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import {
  rentalCarEditFormSchema,
  tableItemToEditFormValues,
  type RentalCarEditFormValues,
} from '@/entities/demo-hybrid-cars/schema/rental-car-edit-form-schema'
import {
  MOCK_CAR_LOCATION_ITEMS,
  MOCK_CAR_STATUS_ITEMS,
} from '@/views/demo-hybrid-page/config/mocks/form-option-mocks'

export interface HybridCarEditFormProps {
  formId: string
  initialCar: RentalCarTableItem
  onSubmitPersist: (patch: RentalCarEditFormValues) => void
  isSubmitting?: boolean
  onRegisterActions?: (actions: { resetForm: () => void }) => void
}

/////////////////////////////////////////////////////////////
// Helpers: date/number formatting and validation error text
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Normalizes stored ISO strings for HTML `type="date"` inputs.
// Used in: EditSliderForm rental date `Controller`s.
// Used for: Same contract as create form — stable `YYYY-MM-DD` for controlled date fields.
//
// Steps:
// 1. Return blank when value missing.
// 2. Parse; reject invalid dates.
// 3. Slice ISO to date portion for the input.
//////////////////////////////////
function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
//////////////////////////////////

//////////////////////////////////
// Coerces numeric form values to display strings for controlled inputs.
// Used in: EditSliderForm price + mileage `GlassInput` values.
// Used for: Avoids showing `undefined` / `NaN` while keeping fields controlled.
//////////////////////////////////
function formatNum(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}
//////////////////////////////////

//////////////////////////////////
// Converts HTML date input to ISO string expected by Zod `isoParsable` fields.
// Used in: EditSliderForm rental start/end `onChange`.
// Used for: Aligns with create form — noon UTC anchor for consistency with server comparisons.
//////////////////////////////////
function fromDateInputToIso(dateInput: string): string {
  if (!dateInput.trim()) return new Date().toISOString()
  return `${dateInput}T12:00:00.000Z`
}
//////////////////////////////////

//////////////////////////////////
// Wraps a nullable dropdown selection as a single-element array for `DropdownSelect`.
// Used in: EditSliderForm status + location selects.
// Used for: Matches multi-select component contract while enforcing single-choice UX.
//////////////////////////////////
const toSingle = (item: DropdownItem | null) => (item ? [item] : [])
//////////////////////////////////

//////////////////////////////////
// Builds a human-readable validation message for invalid submit attempts.
// Used in: EditSliderForm `handleSubmit` invalid callback.
// Used for: Surfaces field-level Zod messages in a toast without custom field UI.
//
// Steps:
// 1. Walk `errors` key/value pairs.
// 2. Append lines with `message` when present.
// 3. Join or return fallback copy.
//////////////////////////////////
function formatFieldErrors(errors: FieldErrors<RentalCarEditFormValues>): string {
  const lines: string[] = []
  for (const [key, val] of Object.entries(errors)) {
    const err = val as { message?: string }
    if (err?.message) lines.push(`${key}: ${err.message}`)
  }
  return lines.join('\n') || 'Please fix the issues below.'
}
//////////////////////////////////

/////////////////////////////////////////////////////////////
// Main component: partial edit form UI (chrome owned by parent header)
/////////////////////////////////////////////////////////////

export function HybridCarEditForm({
  formId,
  initialCar,
  onSubmitPersist,
  isSubmitting = false,
  onRegisterActions,
}: HybridCarEditFormProps) {
  const { showError } = useToast()
  const isBusy = isSubmitting

  const editBaselineRef = useRef<RentalCarEditFormValues>(tableItemToEditFormValues(initialCar))

  const { control, handleSubmit, reset } = useForm<RentalCarEditFormValues>({
    resolver: zodResolver(rentalCarEditFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: tableItemToEditFormValues(initialCar),
  })

  useEffect(() => {
    const next = tableItemToEditFormValues(initialCar)
    editBaselineRef.current = next
    reset(next)
  }, [initialCar, reset])

  useEffect(() => {
    onRegisterActions?.({
      resetForm: () => reset(editBaselineRef.current),
    })
  }, [onRegisterActions, reset])

  const watchStatus = useWatch({ control, name: 'status' })
  const watchLocation = useWatch({ control, name: 'location' })

  const selectedStatus = useMemo(
    () => MOCK_CAR_STATUS_ITEMS.find((i) => i.value === watchStatus) ?? null,
    [watchStatus]
  )
  const selectedLocation = useMemo(
    () => MOCK_CAR_LOCATION_ITEMS.find((i) => i.value === watchLocation) ?? null,
    [watchLocation]
  )

  const dropdownProps = useMemo(
    () =>
      ({
        searchable: false,
        width: '100%' as const,
        maxHeight: '400px',
        showSelectedItems: true,
        showItemCount: false,
        showCheckboxes: false,
        singleChoice: true,
        hideTopButtons: true,
        className: 'w-full',
      }) as const,
    []
  )

  const onValid = useCallback(
    (data: RentalCarEditFormValues) => {
      if (isBusy) return
      onSubmitPersist(data)
    },
    [isBusy, onSubmitPersist]
  )

  const onInvalid = useCallback(
    (errors: FieldErrors<RentalCarEditFormValues>) => {
      showError(formatFieldErrors(errors), 'Validation', 12000)
    },
    [showError]
  )

  return (
    <form
      id={formId}
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit(onValid, onInvalid)}
      noValidate
    >
      {/* ///// Body: editable subset only (status → rental end). ///// */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">
          Only status, location, price, mileage, and rental dates can be changed in this demo.
        </p>

        {isSubmitting ? (
          <p className="text-sm text-foreground/80" aria-live="polite">
            Saving…
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <label className="block text-sm text-foreground/70">Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <DropdownSelect
                icon={Tag}
                buttonText={selectedStatus ? selectedStatus.label : 'Select status'}
                items={MOCK_CAR_STATUS_ITEMS}
                selectedItems={toSingle(selectedStatus)}
                onSelectionChange={(items: DropdownItem[]) => {
                  if (items.length > 0) field.onChange(String(items[0].value))
                }}
                searchPlaceholder="Search status..."
                {...dropdownProps}
                searchable={false}
                selectedText="status"
                disabled={isBusy}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-sm text-foreground/70">Location</label>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <DropdownSelect
                icon={MapPin}
                buttonText={selectedLocation ? selectedLocation.label : 'Select location'}
                items={MOCK_CAR_LOCATION_ITEMS}
                selectedItems={toSingle(selectedLocation)}
                onSelectionChange={(items: DropdownItem[]) => {
                  if (items.length > 0) field.onChange(String(items[0].value))
                }}
                searchPlaceholder="Search location..."
                {...dropdownProps}
                selectedText="location"
                searchable={false}
                disabled={isBusy}
              />
            )}
          />
        </div>

        <Controller
          name="pricePerDay"
          control={control}
          render={({ field }) => (
            <GlassInput
              value={formatNum(field.value)}
              onChange={(e) => {
                const raw = e.target.value
                field.onChange(raw === '' ? 0 : Number(raw))
              }}
              placeholder="Enter price per day"
              label="Price / day"
              type="number"
              theme="dark"
              size="sm"
              labelPosition="top"
              leftIcon={DollarSign}
              required={false}
              disabled={isBusy}
            />
          )}
        />

        <Controller
          name="mileage"
          control={control}
          render={({ field }) => (
            <GlassInput
              value={formatNum(field.value)}
              onChange={(e) => {
                const raw = e.target.value
                field.onChange(raw === '' ? 0 : Number(raw))
              }}
              placeholder="Enter mileage"
              label="Mileage"
              type="number"
              theme="dark"
              size="sm"
              labelPosition="top"
              leftIcon={Gauge}
              required={false}
              disabled={isBusy}
            />
          )}
        />

        <Controller
          name="rentalStartDate"
          control={control}
          render={({ field }) => (
            <GlassInput
              value={toDateInputValue(field.value)}
              onChange={(e) => field.onChange(fromDateInputToIso(e.target.value))}
              placeholder="YYYY-MM-DD"
              label="Rental start"
              type="date"
              theme="dark"
              size="sm"
              labelPosition="top"
              leftIcon={Calendar}
              required={false}
              disabled={isBusy}
            />
          )}
        />

        <Controller
          name="rentalEndDate"
          control={control}
          render={({ field }) => (
            <GlassInput
              value={toDateInputValue(field.value)}
              onChange={(e) => field.onChange(fromDateInputToIso(e.target.value))}
              placeholder="YYYY-MM-DD"
              label="Rental end"
              type="date"
              theme="dark"
              size="sm"
              labelPosition="top"
              leftIcon={Calendar}
              required={false}
              disabled={isBusy}
            />
          )}
        />
      </div>
    </form>
  )
}

export default HybridCarEditForm
//////////////////////////////////
