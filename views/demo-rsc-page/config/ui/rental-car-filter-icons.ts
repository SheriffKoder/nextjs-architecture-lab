/**
 * Lucide icons for filter chrome (FilterBoxButton / related UI).
 *
 * Presentation only — filter keys must stay aligned with `data/rental-car-base-filters.ts`.
 */

import {
  Car,
  MapPin,
  Calendar,
  DollarSign,
  Gauge,
  Calendar as CalendarIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const rentalCarFilterIcons: Record<string, LucideIcon> = {
  status: Car,
  make: Car,
  location: MapPin,
  year: Calendar,
  pricePerDay: DollarSign,
  mileage: Gauge,
  rentalStartDate: CalendarIcon,
}
