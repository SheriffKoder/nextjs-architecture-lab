/**
 * Get Rental Cars Data Server Function
 * 
 * Purpose: Server function that returns filtered, sorted, and paginated rental car data
 * Used in: RSC pages that need to display rental car data
 * Why: Provides server-side data fetching with filtering, sorting, and pagination
 * 
 * Function Index:
 * - getRentalCarsData: Server function that returns filtered, sorted, and paginated rental cars
 *   Example input: getRentalCarsData({ status: "available,rented", make: "Toyota", page: "1", limit: "10" })
 *   Example output: { cars: RentalCarTableItem[], pagination: { totalItems, page, limit } }
 */

import { rentalCars } from './data-source'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import { filterRentalCars } from './backend-simulate/filter-rental-cars'
import { parseSorts, applySorts } from '../../../ui/filters/feature-sorting/utils'
import { parsePagination } from '../../../ui/filters/feature-pagination/utils'
import { rentalCarPaginationConfig } from '../../config/header-filters-config'
import { decodeFilters } from '../../../ui/filters/feature-query-builder-filter/utils'
/**
 * Get mock rental cars data with optional filtering, sorting, and pagination
 * WHY: Provides mock data for development with URL parameter filtering, sorting, and pagination
 * HOW: Processes searchParams through multiple steps: filter → sort → paginate
 * @param {Object} searchParams - URL search parameters for filtering, sorting, and pagination
 * @returns {Promise<{cars: RentalCarTableItem[], pagination: {totalItems: number, page: number, limit: number}}>} Filtered, sorted, and paginated cars with pagination metadata
 */
export async function getRentalCarsData(
  searchParams: { [key: string]: string | string[] | undefined } = {}
): Promise<{
  cars: RentalCarTableItem[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}> {
  //////////////////////////////////
  // STEP 1: Filter cars based on URL parameters
  //////////////////////////////////
  const filtered = filterRentalCars(rentalCars, searchParams)
  
    //////////////////////////////////////////
    // QUERY FILTER PARSING (for debugging)
    //////////////////////////////////////////
    const filterParam = typeof searchParams.filter === 'string' ? searchParams.filter : null
    console.log('//////////////////////////////////////////')
    console.log('QUERY FILTER - Raw param:', filterParam)
    const decodedFilter = decodeFilters(filterParam)
    console.log('QUERY FILTER - Decoded JSON:')
    console.log(JSON.stringify(decodedFilter, null, 2))
    console.log('//////////////////////////////////////////')
    //////////////////////////////////////////
    

  //////////////////////////////////
  // STEP 2: Apply sorting to filtered results
  //////////////////////////////////
  const sortString = typeof searchParams.sort === 'string' ? searchParams.sort : ''
  const sorts = parseSorts(sortString)
  const filteredAndSorted = sorts.length > 0 ? applySorts(filtered, sorts) : filtered
  
  //////////////////////////////////
  // STEP 3: Parse pagination parameters from URL
  //////////////////////////////////
  const params = new URLSearchParams(
    Object.entries(searchParams)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] : v as string])
  )
  
  const { page, limit } = parsePagination(params, rentalCarPaginationConfig.defaultPageSize || 20)
  
  //////////////////////////////////
  // STEP 4: Apply pagination slice to sorted results
  //////////////////////////////////
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedCars = filteredAndSorted.slice(startIndex, endIndex)
  
  //////////////////////////////////
  // STEP 5: Return results with pagination metadata
  //////////////////////////////////
  return {
    cars: paginatedCars,
    pagination: {
      totalItems: filteredAndSorted.length,
      page,
      limit
    }
  }
}
