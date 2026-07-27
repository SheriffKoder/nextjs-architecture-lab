/**
 * @file entities/demo-hybrid-cars/client/index.ts
 * Public barrel for browser-side API fetch helpers (no React hooks).
 */

export { fetchRentalCars, type RentalCarsPageResponse } from './fetch-rental-cars'
export { fetchRentalCarById } from './fetch-rental-car-by-id'
export { fetchRentalCarFilterOptions } from './fetch-filter-options'
export { buildRentalCarApiUrl } from './build-rental-car-api-url'
export {
  createRentalCar,
  updateRentalCarPartial,
  patchRentalCarRowStatus,
  deleteRentalCar,
  type CreateRentalCarInput,
} from './mutate-rental-cars'
