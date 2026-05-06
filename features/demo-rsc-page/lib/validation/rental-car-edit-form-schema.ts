/**
 * Rental car edit drawer — Zod schema (partial fields only)
 *
 * Purpose: Validate status, location, price, mileage, rental dates for `EditSliderForm` + PATCH handler
 * Used in: `EditSliderForm`, `update-rental-car-partial-server`, Route Handler PATCH
 */

import { z } from 'zod'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'

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
