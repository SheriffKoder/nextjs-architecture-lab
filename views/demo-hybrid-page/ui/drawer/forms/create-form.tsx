/**
 * @file views/demo-hybrid-page/ui/drawer/forms/create-form.tsx
 * Create-car form — RHF + Zod; parent chrome owns Reset/Save via `formId`.
 *
 * Purpose: Validated create payload → TanStack `useCreateRentalCar` via `onSubmitPersist`
 * Used in: `modes/create/create-content.tsx`
 */

'use client'

import { useCallback, useEffect, useMemo } from 'react'
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Car, Calendar, DollarSign, Gauge, Hash, MapPin, Tag } from 'lucide-react'

import { useToast } from '@/shared/ui/toast/use-toast'
import GlassInput from '@/shared/ui/inputs/glass-input'
import DropdownSelect from '@/shared/ui/multi-select'
import type { DropdownItem } from '@/shared/ui/multi-select'

import {
  MOCK_CAR_LOCATION_ITEMS,
  MOCK_CAR_MAKE_ITEMS,
  MOCK_CAR_STATUS_ITEMS,
} from '@/views/demo-hybrid-page/config/mocks/form-option-mocks'
import {
  defaultRentalCarFormValues,
  rentalCarFormSchema,
  rentalCarFormValuesToTableItem,
  type RentalCarFormValues,
} from '@/entities/demo-hybrid-cars/schema/rental-car-form-schema'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'

/////////////////////////////////////////////////////////////
// Pure helpers — date/number formatting + error text (no React hooks)
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Normalizes ISO timestamps for HTML date inputs.
// Used in: rental date Controllers
// Used for: Avoids invalid controlled values when schema stores full ISO strings.
//////////////////////////////////
function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
//////////////////////////////////

//////////////////////////////////
// Stringifies numeric fields for GlassInput `value` without showing NaN/undefined text.
// Used in: year / price / mileage Controllers
//////////////////////////////////
function formatNum(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}
//////////////////////////////////

//////////////////////////////////
// Converts browser date string back to ISO the Zod schema accepts (midday UTC).
// Used in: rental start/end `onChange`
//////////////////////////////////
function fromDateInputToIso(dateInput: string): string {
  if (!dateInput.trim()) return new Date().toISOString()
  return `${dateInput}T12:00:00.000Z`
}
//////////////////////////////////

//////////////////////////////////
// Wraps single-select dropdown value as the array API `DropdownSelect` expects.
// Used in: make / status / location Controllers
//////////////////////////////////
const toSingle = (item: DropdownItem | null) => (item ? [item] : [])
//////////////////////////////////

//////////////////////////////////
// Flattens RHF `FieldErrors` into toast body lines (first message per field).
// Used in: client-side submit invalid callback
//////////////////////////////////
function formatFieldErrors(errors: FieldErrors<RentalCarFormValues>): string {
  const lines: string[] = []
  for (const [key, val] of Object.entries(errors)) {
    const err = val as { message?: string }
    if (err?.message) lines.push(`${key}: ${err.message}`)
  }
  return lines.join('\n') || 'Please fix the issues below.'
}
//////////////////////////////////

/////////////////////////////////////////////////////////////
// Component props + implementation
/////////////////////////////////////////////////////////////

export interface HybridCarCreateFormProps {
  formId: string
  onSubmitPersist: (values: RentalCarTableItem) => void
  isSubmitting?: boolean
  /** Lets the sticky header call RHF `reset` (native `type="reset"` does not sync controlled fields). */
  onRegisterActions?: (actions: { resetForm: () => void }) => void
}

//////////////////////////////////
// Main client form — validates with Zod, hands row to parent TanStack mutation.
//////////////////////////////////
export function HybridCarCreateForm({
  formId,
  onSubmitPersist,
  isSubmitting = false,
  onRegisterActions,
}: HybridCarCreateFormProps) {
  const { showError } = useToast()

  const { control, handleSubmit, reset } = useForm<RentalCarFormValues>({
    resolver: zodResolver(rentalCarFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: defaultRentalCarFormValues(),
  })

  useEffect(() => {
    onRegisterActions?.({
      resetForm: () => reset(defaultRentalCarFormValues()),
    })
  }, [onRegisterActions, reset])

  const watchMake = useWatch({ control, name: 'make' })
  const watchStatus = useWatch({ control, name: 'status' })
  const watchLocation = useWatch({ control, name: 'location' })

  const selectedMake = useMemo(
    () => MOCK_CAR_MAKE_ITEMS.find((i) => i.value === watchMake) ?? null,
    [watchMake]
  )
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
    (values: RentalCarFormValues) => {
      if (isSubmitting) return
      onSubmitPersist(rentalCarFormValuesToTableItem(values))
    },
    [isSubmitting, onSubmitPersist]
  )

  const onInvalid = useCallback(
    (errors: FieldErrors<RentalCarFormValues>) => {
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
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">
          Creates go through TanStack mutation + mock store (list cache updates; no route refresh).
        </p>

        {/* ///// Text + selects (model, make, status, location) ///// */}
        <Controller
          name="model"
          control={control}
          render={({ field }) => (
            <GlassInput
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder="Enter model"
              label="Model"
              type="text"
              theme="dark"
              size="sm"
              labelPosition="top"
              leftIcon={Car}
              required={false}
            />
          )}
        />

        <div className="flex flex-col gap-2">
          <label className="block text-sm text-foreground/70">Make</label>
          <Controller
            name="make"
            control={control}
            render={({ field }) => (
              <DropdownSelect
                icon={Car}
                buttonText={selectedMake ? selectedMake.label : 'Select make'}
                items={MOCK_CAR_MAKE_ITEMS}
                selectedItems={toSingle(selectedMake)}
                onSelectionChange={(items: DropdownItem[]) => {
                  if (items.length > 0) field.onChange(String(items[0].value))
                }}
                searchPlaceholder="Search make..."
                {...dropdownProps}
                selectedText="make"
              />
            )}
          />
        </div>

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
              />
            )}
          />
        </div>

        {/* ///// Numeric + text detail fields ///// */}
        <Controller
          name="year"
          control={control}
          render={({ field }) => (
            <GlassInput
              value={formatNum(field.value)}
              onChange={(e) => {
                const raw = e.target.value
                field.onChange(raw === '' ? new Date().getFullYear() : Number(raw))
              }}
              placeholder="Enter year"
              label="Year"
              type="number"
              theme="dark"
              size="sm"
              labelPosition="top"
              leftIcon={Hash}
              required={false}
            />
          )}
        />

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
            />
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <GlassInput
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder="Enter color"
              label="Color"
              type="text"
              theme="dark"
              size="sm"
              labelPosition="top"
              required={false}
            />
          )}
        />

        <Controller
          name="licensePlate"
          control={control}
          render={({ field }) => (
            <GlassInput
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder="Enter license plate"
              label="License plate"
              type="text"
              theme="dark"
              size="sm"
              labelPosition="top"
              leftIcon={Hash}
              required={false}
            />
          )}
        />

        {/* ///// Rental window (ISO-backed, rendered as date inputs) ///// */}
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
            />
          )}
        />
      </div>

    </form>
  )
}
//////////////////////////////////

export default HybridCarCreateForm

