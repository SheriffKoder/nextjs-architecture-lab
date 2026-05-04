/**
 * EditSliderForm
 *
 * Purpose: Partial edit drawer UI — header with Undo (disabled until dirty) + Save; RHF fields for status, location, price, mileage, rental dates (`rentalCarEditFormSchema`).
 * Used in: `car-drawer-manager.tsx` → `EditDrawerBody` after `useRentalCarDetail` succeeds.
 * Used for: PATCH via `useUpdateRentalCar`; optional delete trigger — confirm UI + DELETE live in `DemoClientCreateCarDrawerManager`.
 *
 * Function Index:
 * - toDateInputValue: ISO string → `YYYY-MM-DD` for date inputs.
 * - formatNum: Number → string for controlled numeric inputs.
 * - fromDateInputToIso: HTML date → noon UTC ISO for schema.
 * - toSingle: Single `DropdownItem` → array for `DropdownSelect`.
 * - formatFieldErrors: RHF errors → toast string.
 * - EditSliderForm (default): Baseline ref + form + undo/save + field render.
 *
 * Steps (EditSliderForm component flow):
 * 1. Keep `editBaselineRef` in sync with server row whenever `initialCar` changes; `reset` form to that snapshot.
 * 2. Register `useForm` + resolver; track `formState.isDirty` for Undo enabled state.
 * 3. `onUndo` restores baseline via `reset` (clears dirty without extra network).
 * 4. Watch status/location; derive selected mock dropdown rows; memoize shared `dropdownProps`.
 * 5. `onSave` validates partial schema and calls `onSubmitPersist` with patch object.
 * 6. Optional delete: trash calls `onRequestDelete(displayLabel)` (drawer manager opens modal + runs DELETE).
 * 7. Render header (Undo + delete + Save) and scrollable partial-field column.
 */

'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Controller, useForm, useWatch, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RotateCcw, Save, Trash2, Calendar, DollarSign, Gauge, MapPin, Tag } from 'lucide-react'
import { useToast } from '@/components/design/toast-success/use-toast'
import GlassInput from '@/components/design/glass-input'
import DropdownSelect from '@/components/design/multi-select-2/dropdown-select'
import type { DropdownItem } from '@/components/design/multi-select-2/utils/types'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import {
  rentalCarEditFormSchema,
  tableItemToEditFormValues,
  type RentalCarEditFormValues,
} from '../../validation/rental-car-edit-form-schema'
import {
  MOCK_CAR_LOCATION_ITEMS,
  MOCK_CAR_STATUS_ITEMS,
} from '../../config/car-slider-dropdown-mocks'

export interface EditSliderFormProps {
  initialCar: RentalCarTableItem
  onSubmitPersist: (patch: RentalCarEditFormValues) => void
  isSubmitting?: boolean
  /** When set, header shows delete; pass make/model label for the confirm copy (manager owns modal). */
  onRequestDelete?: (displayLabel: string) => void
  /** Disables toolbar and fields while delete mutation runs (parent passes `deleteCar.isPending`). */
  isDeleting?: boolean
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
// Main component: partial edit form UI
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Edit drawer form: baseline snapshot + Undo/Save + partial fields.
// Used in: `EditDrawerBody` after TanStack detail query resolves.
// Used for: Lets user revert local edits; persists only allowed columns via parent PATCH mutation.
//
// Steps:
// 1. Seed `editBaselineRef` from `initialCar` for Undo target.
// 2. `useForm` + resolver; subscribe to `formState` for dirty tracking.
// 3. `useEffect` on `initialCar`: refresh baseline + `reset` so remote updates re-hydrate the form.
// 4. `onUndo`: `reset` to last captured baseline (no network).
// 5. Derive dropdown selection from watched fields + memoized `dropdownProps`.
// 6. `onSave`: validate with RHF + Zod, forward patch to parent.
// 7. Optional trash: `onRequestDelete(label)` — modal + mutation in drawer manager (outside edit branch).
// 8. Render header + scrollable body.
//////////////////////////////////
export default function EditSliderForm({
  initialCar,
  onSubmitPersist,
  isSubmitting = false,
  onRequestDelete,
  isDeleting = false,
}: EditSliderFormProps) {
  // 1. Toast for client-side validation failures (server errors handled in drawer manager).
  const { showError } = useToast()

  // 1b. Any in-flight server action disables the form to avoid races between PATCH and DELETE.
  const isBusy = isSubmitting || isDeleting

  // 2. Baseline snapshot: updated whenever `initialCar` identity/data changes (see `useEffect` below).
  const editBaselineRef = useRef<RentalCarEditFormValues>(tableItemToEditFormValues(initialCar))

  // 3. Form instance: `formState` drives Undo disabled state alongside `isSubmitting`.
  const { control, handleSubmit, reset, formState } = useForm<RentalCarEditFormValues>({
    resolver: zodResolver(rentalCarEditFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: tableItemToEditFormValues(initialCar),
  })

  // 4. Sync remote row into form + baseline whenever the detail query returns a new object.
  useEffect(() => {
    const next = tableItemToEditFormValues(initialCar)
    editBaselineRef.current = next
    reset(next)
  }, [initialCar, reset])

  // 5. Undo restores last known-good snapshot from ref (keeps UX predictable after failed edits).
  const onUndo = useCallback(() => {
    reset(editBaselineRef.current)
  }, [reset])

  // 6. Watch dropdown-backed fields for label + selection display.
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

  // 7. Memoized select props — identical pattern to create form for fewer re-renders on unrelated state.
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

  // 8. Save: block while mutation in flight; toast invalid; valid patch bubbles to parent.
  const onSave = useCallback(() => {
    if (isBusy) return
    handleSubmit(
      (data) => {
        onSubmitPersist(data)
      },
      (errors) => {
        showError(formatFieldErrors(errors), 'Validation', 12000)
      }
    )()
  }, [handleSubmit, isBusy, onSubmitPersist, showError])

  // 9. Subtitle uses immutable identity fields from the row (not part of editable patch).
  const subTitle = `${initialCar.make} ${initialCar.model}`.trim()

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ///// Header: Undo, optional delete (parent confirm), Save. ///// */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-border bg-primary pr-10 px-4 py-3">
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-background/70 backdrop-blur-sm"
          aria-hidden
        />
        <div className="relative z-[2] flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 text-sm text-foreground">Edit Car</h2>
            <p className="truncate text-lg font-semibold text-foreground">{subTitle}</p>
          </div>
        </div>
        <div className="relative z-[1] mr-2 flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={isBusy || !formState.isDirty}
            className="rounded-md bg-foreground/5 p-2 text-foreground transition-colors duration-200 hover:bg-foreground/5 disabled:opacity-50 dark:bg-transparent dark:text-tertiary dark:hover:bg-tertiary/10"
            aria-label="Undo changes"
            title={formState.isDirty ? 'Undo' : 'Nothing to undo'}
          >
            <RotateCcw size={18} />
          </button>
          {onRequestDelete ? (
            <button
              type="button"
              onClick={() => onRequestDelete(subTitle)}
              disabled={isBusy}
              className="rounded-md bg-foreground/5 p-2 text-destructive transition-colors duration-200 hover:bg-destructive/10 disabled:opacity-50 dark:bg-transparent dark:hover:bg-destructive/15"
              aria-label="Delete car"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSave}
            disabled={isBusy}
            className="rounded-md bg-foreground/5 p-2 text-foreground transition-colors duration-200 hover:bg-foreground/5 disabled:opacity-50 dark:bg-transparent dark:text-tertiary dark:hover:bg-tertiary/10"
            aria-label="Save changes"
            title="Save"
          >
            <Save size={18} />
          </button>
        </div>
      </header>

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
        {isDeleting ? (
          <p className="text-sm text-foreground/80" aria-live="polite">
            Deleting…
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
    </div>
  )
}
//////////////////////////////////
