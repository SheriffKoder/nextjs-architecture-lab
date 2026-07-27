/**
 * @file entities/demo-hybrid-cars/schema/rental-car-form-schema.ts
 * Zod create-car schema shared by drawer forms and POST validation.
 *
 * Purpose: Single validation contract for create flow (RHF + API)
 * Used in: drawer create form, `server/create-rental-car.ts`, POST `/api/demo-hybrid-page/cars`
 */

import { z } from 'zod'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'

const isoParsable = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((s) => !Number.isNaN(Date.parse(s)), { message: `Invalid ${label}` })

export const rentalCarFormSchema = z.object({
  id: z.string(),
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  year: z
    .number()
    .int()
    .min(1900, 'Year must be at least 1900')
    .max(2100, 'Year must be at most 2100'),
  status: z.string().trim().min(1, 'Status is required'),
  location: z.string().trim().min(1, 'Location is required'),
  mileage: z.number().finite().min(0, 'Mileage cannot be negative'),
  pricePerDay: z.number().finite().min(0, 'Price per day cannot be negative'),
  color: z.string(),
  licensePlate: z.string(),
  rentalStartDate: isoParsable('Rental start'),
  rentalEndDate: isoParsable('Rental end'),
  manual_sorting: z.number().finite().optional(),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
})

export type RentalCarFormValues = z.infer<typeof rentalCarFormSchema>

export function defaultRentalCarFormValues(): RentalCarFormValues {
  const now = new Date().toISOString()
  return {
    id: '',
    model: '',
    make: '',
    year: new Date().getFullYear(),
    status: 'available',
    location: 'New York, NY',
    mileage: 0,
    pricePerDay: 0,
    color: '',
    licensePlate: '',
    rentalStartDate: now,
    rentalEndDate: now,
  }
}

export function tableItemToFormValues(row: RentalCarTableItem): RentalCarFormValues {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    status: row.status,
    location: row.location,
    mileage: row.mileage,
    pricePerDay: row.pricePerDay,
    color: row.color,
    licensePlate: row.licensePlate,
    rentalStartDate: row.rentalStartDate,
    rentalEndDate: row.rentalEndDate,
    ...(row.manual_sorting !== undefined
      ? { manual_sorting: row.manual_sorting }
      : {}),
    ...(row.latitude !== undefined ? { latitude: row.latitude } : {}),
    ...(row.longitude !== undefined ? { longitude: row.longitude } : {}),
  }
}

export function rentalCarFormValuesToTableItem(v: RentalCarFormValues): RentalCarTableItem {
  const row: RentalCarTableItem = {
    id: v.id,
    make: v.make,
    model: v.model,
    year: v.year,
    status: v.status,
    location: v.location,
    mileage: v.mileage,
    pricePerDay: v.pricePerDay,
    color: v.color,
    licensePlate: v.licensePlate,
    rentalStartDate: v.rentalStartDate,
    rentalEndDate: v.rentalEndDate,
  }
  if (v.manual_sorting !== undefined) row.manual_sorting = v.manual_sorting
  if (v.latitude !== undefined) row.latitude = v.latitude
  if (v.longitude !== undefined) row.longitude = v.longitude
  return row
}
