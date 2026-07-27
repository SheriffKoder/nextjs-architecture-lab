/**
 * @file entities/demo-hybrid-cars/schema/rental-car-edit-form-schema.ts
 * Zod partial-edit schema for drawer edit + PATCH validation.
 *
 * Purpose: Validate editable fields (status, location, price, mileage, dates)
 * Used in: drawer edit form, `server/update-rental-car.ts`, PATCH `/api/demo-hybrid-page/cars/:id`
 */

import { z } from 'zod'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'

const isoParsable = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((s) => !Number.isNaN(Date.parse(s)), { message: `Invalid ${label}` })

export const rentalCarEditFormSchema = z.object({
  status: z.string().trim().min(1, 'Status is required'),
  location: z.string().trim().min(1, 'Location is required'),
  mileage: z.number().finite().min(0, 'Mileage cannot be negative'),
  pricePerDay: z.number().finite().min(0, 'Price per day cannot be negative'),
  rentalStartDate: isoParsable('Rental start'),
  rentalEndDate: isoParsable('Rental end'),
})

export type RentalCarEditFormValues = z.infer<typeof rentalCarEditFormSchema>

export function tableItemToEditFormValues(row: RentalCarTableItem): RentalCarEditFormValues {
  return {
    status: row.status,
    location: row.location,
    mileage: row.mileage,
    pricePerDay: row.pricePerDay,
    rentalStartDate: row.rentalStartDate,
    rentalEndDate: row.rentalEndDate,
  }
}
