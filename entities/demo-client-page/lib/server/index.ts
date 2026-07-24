/**
 * Demo Client Page — lib/server barrel
 *
 * Name: index (server simulation public API)
 * Purpose: Single import surface for Next.js Route Handlers that serve this demo
 * Used in: `app/api/demo-client-page/page-client/route.ts` (GET + POST), `app/api/demo-client-page/options/route.ts`
 * Used for: Avoid deep relative imports from route files into individual server modules
 *
 * Function Index:
 * - Re-exports getRentalCarsData, getFilterOptionsServer, createRentalCarServer, parseCreateRentalCarPayload, filterRentalCars, filterRentalCarsExcludingColumn
 *
 * File map:
 * - `index.ts` (this file):
 *   - What it does: Barrel — re-exports the public server API for this feature folder.
 *   - Where it is used: `app/api/demo-client-page/page-client/route.ts`, `app/api/demo-client-page/options/route.ts`.
 * - `get-rental-cars-data.ts`:
 *   - What it does: Runs filter → sort → paginate on mock `rentalCars`; returns `{ cars, pagination }`.
 *   - Where it is used: `app/api/demo-client-page/page-client/route.ts`; tests may import it directly.
 * - `get-filter-options-server.ts`:
 *   - What it does: Builds enriched `FilterConfig[]` with `options` and facet counts from URL params + mock data.
 *   - Where it is used: `app/api/demo-client-page/options/route.ts`.
 * - `create-rental-car-server.ts`:
 *   - What it does: Validates create payload, assigns server `id`, returns `RentalCarTableItem` without mutating mock data.
 *   - Where it is used: `app/api/demo-client-page/page-client/route.ts` (POST).
 * - `backend-simulate/filter-rental-cars.ts`:
 *   - What it does: Applies URL-shaped params to the car array; `filterRentalCarsExcludingColumn` skips one filter key for facet math.
 *   - Where it is used: `get-rental-cars-data.ts`, `get-filter-options-server.ts`.
 * - `backend-simulate/filter-by-search.ts`:
 *   - What it does: Case-insensitive substring search across a fixed list of row fields (`q` param).
 *   - Where it is used: `filter-rental-cars.ts` only.
 * - `backend-simulate/get-filter-options.ts`:
 *   - What it does: Derives unique values + `totalCount` / `initialCount` per field for select / quick-select configs.
 *   - Where it is used: `get-filter-options-server.ts` only.
 *
 * Steps (this file):
 * 1. Re-export row pipeline entry (getRentalCarsData).
 * 2. Re-export facet pipeline entry (getFilterOptionsServer).
 * 3. Re-export create entry (createRentalCarServer, parseCreateRentalCarPayload, validation error).
 * 4. Re-export low-level filters for tests or custom routes if needed.
 */

export { getRentalCarsData } from './get-rental-cars-data'
export { getFilterOptionsServer } from './get-filter-options-server'
export {
  createRentalCarServer,
  parseCreateRentalCarPayload,
  CreateRentalCarValidationError,
} from './create-rental-car-server'
export type { CreateRentalCarInput } from './create-rental-car-server'
export { filterRentalCars, filterRentalCarsExcludingColumn } from './backend-simulate/filter-rental-cars'
export {
  parseRentalCarEditPatch,
  updateRentalCarInMockStoreById,
  UpdateRentalCarValidationError,
  RentalCarNotFoundError,
} from './update-rental-car-partial-server'
export { deleteRentalCarFromMockStore } from './delete-rental-car-server'
