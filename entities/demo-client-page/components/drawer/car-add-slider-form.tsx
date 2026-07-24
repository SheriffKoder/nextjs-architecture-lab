/**
 * CarSliderForm
 *
 * Purpose: Create-rental-car drawer UI — header toolbar plus react-hook-form fields validated with Zod (`rentalCarFormSchema`).
 * Used in: `car-drawer-manager.tsx` → `AddDrawerBody` → inside `RightDrawer`.
 * Used for: Add flow only; maps valid form values to `RentalCarTableItem` and calls `onSubmitPersist` (TanStack create mutation).
 *
 * Function Index:
 * - toDateInputValue: ISO string → `YYYY-MM-DD` for date inputs.
 * - formatNum: Number → string for controlled numeric inputs (empty when unset).
 * - fromDateInputToIso: HTML date string → noon UTC ISO for schema storage.
 * - toSingle: `DropdownItem | null` → array shape expected by `DropdownSelect`.
 * - formatFieldErrors: RHF `FieldErrors` → newline string for toast body.
 * - CarSliderForm (default): Registers form, derives dropdown selection, runs submit + render.
 *
 * Steps (CarSliderForm component flow):
 * 1. Initialize `useForm` with `zodResolver` and `defaultRentalCarFormValues()`.
 * 2. `useWatch` make/status/location; `useMemo` maps values to mock dropdown items and stable `dropdownProps`.
 * 3. `onCreate` runs `handleSubmit`: on valid data → `rentalCarFormValuesToTableItem` → parent; on invalid → toast.
 * 4. Render sticky header (title + create icon) and scrollable field column (`Controller` + `GlassInput` / `DropdownSelect`).
 */

'use client'

import { useCallback, useMemo } from 'react'

// React Hook Form
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
} from 'react-hook-form'

// Zod
import { zodResolver } from '@hookform/resolvers/zod'

// Lucide Icons
import { Save, Car, Calendar, DollarSign, Gauge, Hash, MapPin, Tag } from 'lucide-react'

// Components
import { useToast } from '@/shared/ui/toast/use-toast'
import GlassInput from '@/shared/ui/inputs/glass-input'
import DropdownSelect from '@/shared/ui/multi-select'
import type { DropdownItem } from '@/shared/ui/multi-select'

// Types
import type { RentalCarTableItem } from '../../types/rental-car-table-item'

// Validation
import {
  defaultRentalCarFormValues,
  rentalCarFormSchema,
  rentalCarFormValuesToTableItem,
  type RentalCarFormValues,
} from '../../validation/rental-car-form-schema'

// Config
import {
  MOCK_CAR_LOCATION_ITEMS,
  MOCK_CAR_MAKE_ITEMS,
  MOCK_CAR_STATUS_ITEMS,
} from '../../config/car-slider-dropdown-mocks'

// Interfaces
export interface CarSliderFormProps {
  onSubmitPersist: (values: RentalCarTableItem) => void
  isSubmitting?: boolean
}

/////////////////////////////////////////////////////////////
// Helpers: date/number formatting and validation error text
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Normalizes stored ISO strings for HTML `type="date"` inputs.
// Used in: CarSliderForm rental date `Controller`s.
// Used for: Avoids invalid `value` on `GlassInput` when the row holds full ISO timestamps.
//
// Steps:
// 1. Treat empty / missing as blank string (clear input).
// 2. Parse to `Date`; reject NaN.
// 3. Return `YYYY-MM-DD` slice for the DOM date control.
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
// Used in: CarSliderForm year / price / mileage `GlassInput` values.
// Used for: Keeps inputs controlled without showing `undefined` or `NaN` as text.
//
// Steps:
// 1. Map `null` / `undefined` to empty string so the user sees a blank field.
// 2. Otherwise stringify the finite number for the input `value`.
//////////////////////////////////
function formatNum(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}
//////////////////////////////////

//////////////////////////////////
// Converts HTML date input (`YYYY-MM-DD`) back to an ISO string the Zod schema accepts.
// Used in: CarSliderForm rental start/end `onChange` handlers.
// Used for: Stores a stable midday UTC ISO instead of relying on implicit local midnight parsing downstream.
//
// Steps:
// 1. If the user cleared the field, fall back to "now" ISO (schema requires a value).
// 2. Otherwise append noon UTC and return ISO string.
//////////////////////////////////
function fromDateInputToIso(dateInput: string): string {
  if (!dateInput.trim()) return new Date().toISOString()
  return `${dateInput}T12:00:00.000Z`
}
//////////////////////////////////

//////////////////////////////////
// Adapts a single selected dropdown item to the array shape `DropdownSelect` expects.
// Used in: CarSliderForm make/status/location `DropdownSelect` `selectedItems` prop.
// Used for: API parity with multi-select component while this form is single-choice only.
//////////////////////////////////
const toSingle = (item: DropdownItem | null) => (item ? [item] : [])
//////////////////////////////////

//////////////////////////////////
// Flattens RHF field errors into a single string for toast notifications.
// Used in: CarSliderForm `handleSubmit` invalid callback.
// Used for: Surfaces all first error messages without importing RHF UI helpers.
//
// Steps:
// 1. Iterate `errors` entries.
// 2. Collect `field: message` lines when `message` exists.
// 3. Join with newlines or fall back to a generic instruction string.
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
// Main component: create-rental-car form UI
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Add-car drawer form: header + full create fields (RHF + Zod).
// Used in: `AddDrawerBody` inside `DemoClientCreateCarDrawerManager`.
// Used for: Validates full `RentalCarFormValues`, converts to `RentalCarTableItem`, hands off to parent mutation.
//
// Steps:
// 1. `useToast` for validation failures.
// 2. `useForm` + `zodResolver` + default values from schema helper.
// 3. Watch key dropdown fields; derive selected `DropdownItem` rows from mock lists.
// 4. Memoize shared `dropdownProps` to keep referential stability for child selects.
// 5. `onCreate` guards double-submit, runs `handleSubmit` success/invalid branches.
// 6. Render layout: sticky header (title + save), scrollable body with hint + Controllers.
//////////////////////////////////
export default function CarSliderForm({
  onSubmitPersist,
  isSubmitting = false,
}: CarSliderFormProps) {
  // 1. Toast API for validation errors (success toast lives in the drawer manager after mutation).
  const { showError } = useToast()

  // 2. Register form: resolver enforces schema; defaults match empty/new row template.
  const { control, handleSubmit } = useForm<RentalCarFormValues>({
    resolver: zodResolver(rentalCarFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: defaultRentalCarFormValues(),
  })

  // 3. Watch dropdown-backed fields so labels stay in sync with mock option lists.
  const watchMake = useWatch({ control, name: 'make' })
  const watchStatus = useWatch({ control, name: 'status' })
  const watchLocation = useWatch({ control, name: 'location' })

  // 4. Derive selected items from current watched string values (no duplicate state in React).
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

  // 5. Shared props for all `DropdownSelect` instances — memoized to avoid needless child updates.
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

  // 6. Primary submit handler from header icon: validates then forwards table row to parent.
  const onCreate = useCallback(() => {
    if (isSubmitting) return
    handleSubmit(
      (data) => {
        onSubmitPersist(rentalCarFormValuesToTableItem(data))
      },
      (errors) => {
        showError(formatFieldErrors(errors), 'Validation', 12000)
      }
    )()
  }, [handleSubmit, isSubmitting, onSubmitPersist, showError])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ///// Header: matches RightSlider-style chrome; save triggers validated submit. ///// */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-border bg-primary pr-10 px-4 py-3">
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-background/70 backdrop-blur-sm"
          aria-hidden
        />
        <div className="relative z-[2] flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 text-sm text-foreground">Add Car</h2>
            <p className="truncate text-lg font-semibold text-foreground">New rental car</p>
          </div>
        </div>
        <div className="relative z-[1] mr-2 flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCreate}
            disabled={isSubmitting}
            className="rounded-md bg-foreground/5 p-2 text-foreground transition-colors duration-200 hover:bg-foreground/5 disabled:opacity-50 dark:bg-transparent dark:text-tertiary dark:hover:bg-tertiary/10"
            aria-label="Create car"
            title="Create"
          >
            <Save size={18} />
          </button>
        </div>
      </header>

      {/* ///// Body: scrollable field stack (model → dates). ///// */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">
          Creates go through the demo API (cache updates; refresh resets until DB).
        </p>

        {isSubmitting ? (
          <p className="text-sm text-foreground/80" aria-live="polite">
            Saving…
          </p>
        ) : null}

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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            )}
          />
        </div>

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          )}
        />
      </div>
    </div>
  )
}
//////////////////////////////////
