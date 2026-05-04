/**
 * Demo Client Page — TanStack barrel
 *
 * Purpose: Single import surface for query keys, fetchers, hooks, and provider
 * Used in: Client page / content components under `features/demo-client-page`
 */

export { rentalCarKeys } from './key-factory'
export type { RentalCarListQuery, RentalCarNumberRange } from './key-factory'

export {
  buildRentalCarSearchParams,
  fetchRentalCars,
  fetchRentalCarById,
  fetchRentalCarFilterOptions,
  createRentalCar,
  updateRentalCarPartial,
  deleteRentalCar,
} from './handler'
export type { RentalCarsPageResponse, CreateRentalCarInput } from './handler'

export { useRentalCars } from './use-rental-cars'
export { useRentalCarFilterOptions } from './use-rental-car-filter-options'
export { useCreateRentalCar } from './use-create-rental-car'
export type { CreateRentalCarVariables } from './use-create-rental-car'

export { useRentalCarDetail } from './use-rental-car-detail'
export { useUpdateRentalCar } from './use-update-rental-car'
export type { UpdateRentalCarVariables } from './use-update-rental-car'

export { useDeleteRentalCar } from './use-delete-rental-car'

export { QueryProvider } from './query-provider'
