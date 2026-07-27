/**
 * @file views/demo-rsc-page/ui/drawer/forms/create-form.tsx
 * Client create-car form (RHF + Zod) calling `createRentalCarAction` inside `startTransition`.
 *
 * Used in: `modes/create/create-content.tsx`
 */

'use client'

import { useCallback, useEffect, useMemo, type TransitionStartFunction } from 'react'
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
  type UseFormSetError,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Car, Calendar, DollarSign, Gauge, Hash, MapPin, Tag } from 'lucide-react'

import { useToast } from '@/shared/ui/toast/use-toast'
import GlassInput from '@/shared/ui/inputs/glass-input'
import DropdownSelect from '@/shared/ui/multi-select'
import type { DropdownItem } from '@/shared/ui/multi-select'

import { useDrawerActions } from '@/platform/url-kit/url-drawer'

import {
  MOCK_CAR_LOCATION_ITEMS,
  MOCK_CAR_MAKE_ITEMS,
  MOCK_CAR_STATUS_ITEMS,
} from '@/views/demo-rsc-page/config/mocks/form-option-mocks'
import {
  defaultRentalCarFormValues,
  rentalCarFormSchema,
  type RentalCarFormValues,
} from '@/entities/cars-rsc/validation/rental-car-create-form-schema'
import { createRentalCarAction } from '@/entities/cars-rsc/actions/create-rental-car-action'

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

//////////////////////////////////
// Projects server `flatten().fieldErrors` into RHF field messages for inline display.
// Used in: post `createRentalCarAction` when result carries structured errors
//////////////////////////////////
function applyServerFieldErrors(
  setError: UseFormSetError<RentalCarFormValues>,
  fieldErrors: Partial<Record<string, string[] | undefined>> | undefined
) {
  if (!fieldErrors) return
  for (const [key, msgs] of Object.entries(fieldErrors)) {
    const first = msgs?.[0]
    if (first) {
      setError(key as keyof RentalCarFormValues, { message: first })
    }
  }
}
//////////////////////////////////

/////////////////////////////////////////////////////////////
// Component props + implementation
/////////////////////////////////////////////////////////////

export interface RscCarCreateFormClientProps {
  formId: string
  startTransition: TransitionStartFunction
  /** Lets the sticky header call RHF `reset` (native `type="reset"` does not sync controlled fields). */
  onRegisterActions?: (actions: { resetForm: () => void }) => void
}

//////////////////////////////////
// Main client form — wires RHF to Server Action outcomes (toast + drawer close + errors).
// Used in: `rsc-car-drawer-create-content.tsx`
//////////////////////////////////
export function RscCarCreateFormClient({
  formId,
  startTransition,
  onRegisterActions,
}: RscCarCreateFormClientProps) {
  const { showError, showSuccess } = useToast()
  const { close } = useDrawerActions()

  // 1. Client resolver mirrors server schema — UX validation only; server re-validates.
  const { control, handleSubmit, reset, setError } = useForm<RentalCarFormValues>({
    resolver: zodResolver(rentalCarFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: defaultRentalCarFormValues(),
  })

  // 2. Parent header Reset must call RHF reset — native HTML reset skips controlled Controller state.
  useEffect(() => {
    onRegisterActions?.({
      resetForm: () => reset(defaultRentalCarFormValues()),
    })
  }, [onRegisterActions, reset])

  // 3. Watched keys drive dropdown labels without duplicating React state (derived selections below).
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

  // 4. Stable prop bag — DropdownSelect is sensitive to referential identity on parent re-renders.
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

  // 5. Async work runs inside `startTransition` so parent `useTransition` pending matches this submission.
  const runSubmit = useCallback(
    (values: RentalCarFormValues) => {
      startTransition(() => {
        void (async () => {
          const res = await createRentalCarAction(values)

          if (res.success === true) {
            // Toast carries server-returned slice for confirmation without dumping entire payload.
            showSuccess(
              `${res.year} ${res.make} ${res.model} · ${res.color}\nID: ${res.id}`,
              'Car created (demo)',
              8000
            )
            close()
            return
          }

          if ('formError' in res) {
            // Hard failure path — no per-field map (e.g. thrown infra / demo simulated fault).
            showError(res.formError, 'Could not create car', 12000)
            return
          }

          if ('error' in res) {
            applyServerFieldErrors(setError, res.error.fieldErrors)
            const rootMsgs = res.error.formErrors?.filter(Boolean) ?? []
            // Surface root Zod/form messages even when some fields also received errors.
            if (rootMsgs.length > 0) {
              showError(rootMsgs.join('\n'), 'Could not create car', 12000)
            }
          }
        })()
      })
    },
    [close, setError, showError, showSuccess, startTransition]
  )

  const onValid = useCallback(
    (values: RentalCarFormValues) => {
      runSubmit(values)
    },
    [runSubmit]
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
          Creates run through a Server Action (validated on the server). Listing refresh will apply once persistence is wired.
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

