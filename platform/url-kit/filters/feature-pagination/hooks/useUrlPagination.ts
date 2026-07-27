/**
 * URL Pagination Hook
 * 
 * Purpose: Manages pagination state in URL parameters
 * Used in: Pagination components and pages that need pagination functionality
 * Why: Provides centralized pagination logic separate from filtering and sorting
 * 
 * Function Index:
 * - useUrlPagination: Main hook that returns all pagination getters, setters, and utilities
 *   Example input: const { getPage, setPage, calculatePagination } = useUrlPagination({ defaultLimit: 20 })
 *   Example output: { getPage, getLimit, setPage, setLimit, setPagination, resetPage, goToFirst, goToLast, goToNext, goToPrevious, calculatePagination }
 * 
 * URL Format:
 * - Basic: ?page=2&limit=20
 * - Defaults: page=1, limit=20 (or config default)
 */

'use client'

import { useUrlParamsTransport } from '@/platform/url-kit/url-params'
import { useMemo, useCallback } from 'react'
import {
  parsePagination,
  calculatePagination as calcPagination,
  isShowAllUrlParam,
  SHOW_ALL_URL_PARAM,
  applyShowAllToSearchParams,
} from '../utils'
import type { PaginationConfig, PaginationState, PaginationCalculated } from '../types'

/**
 * Custom hook for managing URL-based pagination state
 * 
 * Provides a centralized API for reading, setting, and managing pagination in URL parameters.
 * Supports configurable page size and navigation helpers.
 * 
 * @param {PaginationConfig} config - Optional pagination configuration
 * @returns {Object} Object containing all pagination getters, setters, and utility functions
 * 
 * @example
 * ```typescript
 * const { getPage, setPage, calculatePagination } = useUrlPagination({ defaultPageSize: 20 })
 * const page = getPage() // 1
 * setPage(2) // Updates URL to ?page=2
 * const info = calculatePagination(2, 20, 100) // { totalPages: 5, isFirst: false, ... }
 * ```
 */
export function useUrlPagination(config: PaginationConfig = {}) {
  const {
    effectiveParams,
    buildParams,
    commit,
    committedSnapshot,
  } = useUrlParamsTransport()

  const defaultLimit = config.defaultPageSize || 20

  //////////////////////////////////
  // Helper Functions: Build and update URL parameters
  //////////////////////////////////

  const buildParamsFromEffective = useCallback(() => {
    return buildParams()
  }, [buildParams])

  const updateUrl = useCallback(
    (params: URLSearchParams) => {
      const next = params.toString()
      if (next === committedSnapshot) return
      commit(next)
    },
    [commit, committedSnapshot],
  )

  //////////////////////////////////
  // GETTERS: Read pagination from URL
  //////////////////////////////////

  /**
   * Get current pagination state from URL
   * WHY: Parse page and limit from URL parameters
   * HOW: Use parsePagination utility with current searchParams
   * @returns {PaginationState} Current page and limit
   */
  const getPagination = useCallback((): PaginationState => {
    return parsePagination(effectiveParams, defaultLimit)
  }, [effectiveParams, defaultLimit])

  /**
   * Get current page number
   * WHY: Simple getter for current page
   * HOW: Parse pagination and return page
   * @returns {number} Current page number (1-indexed)
   */
  const getPage = useCallback((): number => {
    return getPagination().page
  }, [getPagination])

  /**
   * Get current page size (limit)
   * WHY: Simple getter for current limit
   * HOW: Parse pagination and return limit
   * @returns {number} Current items per page
   */
  const getLimit = useCallback((): number => {
    return getPagination().limit
  }, [getPagination])

  // Memoize current pagination state
  // WHY: Avoid re-parsing on every render
  // HOW: Use useMemo with getPagination dependency
  const currentPagination = useMemo(() => getPagination(), [getPagination])

  /**
   * Check if show all is enabled
   * WHY: Simple getter for show all
   * HOW: Use isShowAllUrlParam utility with current searchParams
   * @returns {boolean} True if show all is enabled
   */
  const isShowAll = useMemo(
    () => isShowAllUrlParam(effectiveParams),
    [effectiveParams],
  )

  //////////////////////////////////
  // SETTERS: Update pagination in URL
  //////////////////////////////////

  /**
   * Set page number in URL
   * WHY: Update current page when user navigates
   * HOW: Build new params, set page param, update URL
   * @param {number} page - Page number to set (must be >= 1)
   */
  const setPage = useCallback((page: number) => {
    const params = buildParamsFromEffective()
    params.delete(SHOW_ALL_URL_PARAM)
    const validPage = Math.max(1, page)
    params.set('page', validPage.toString())
    updateUrl(params)
  }, [buildParamsFromEffective, updateUrl])

  /**
   * Set page size (limit) in URL
   * WHY: Update items per page when user changes it
   * HOW: Build new params, set limit param, reset to page 1
   * @param {number} limit - Items per page (must be >= 1)
   */
  const setLimit = useCallback((limit: number) => {
    const params = buildParamsFromEffective()
    params.delete(SHOW_ALL_URL_PARAM)
    const validLimit = Math.max(1, limit)
    params.set('limit', validLimit.toString())
    params.set('page', '1')
    updateUrl(params)
  }, [buildParamsFromEffective, updateUrl])

  const setShowAll = useCallback(() => {
    const params = buildParamsFromEffective()
    applyShowAllToSearchParams(params)
    updateUrl(params)
  }, [buildParamsFromEffective, updateUrl])

  /**
   * Set both page and limit at once
   * WHY: Update both values in single URL update
   * HOW: Build new params, set both, update URL
   * @param {number} page - Page number to set
   * @param {number} limit - Items per page to set
   */
  const setPagination = useCallback((page: number, limit: number) => {
    const params = buildParamsFromEffective()
    params.delete(SHOW_ALL_URL_PARAM)
    const validPage = Math.max(1, page)
    const validLimit = Math.max(1, limit)
    params.set('page', validPage.toString())
    params.set('limit', validLimit.toString())
    updateUrl(params)
  }, [buildParamsFromEffective, updateUrl])

  /**
   * Reset to first page
   * WHY: Quick navigation to page 1
   * HOW: Set page to 1
   */
  const resetPage = useCallback(() => {
    setPage(1)
  }, [setPage])

  //////////////////////////////////
  // NAVIGATION: Helper functions for page navigation
  //////////////////////////////////

  /**
   * Navigate to first page
   * WHY: Quick navigation to first page
   * HOW: Set page to 1
   */
  const goToFirst = useCallback(() => {
    setPage(1)
  }, [setPage])

  /**
   * Navigate to last page
   * WHY: Quick navigation to last page
   * HOW: Calculate total pages from current limit and totalItems, then set page
   * NOTE: Requires totalItems parameter
   * @param {number} totalItems - Total number of items
   */
  const goToLast = useCallback((totalItems: number) => {
    const limit = getLimit()
    const totalPages = Math.ceil(totalItems / limit)
    setPage(Math.max(1, totalPages))
  }, [getLimit, setPage])

  /**
   * Navigate to next page
   * WHY: Increment page number
   * HOW: Get current page, increment, set new page
   */
  const goToNext = useCallback(() => {
    const page = getPage()
    setPage(page + 1)
  }, [getPage, setPage])

  /**
   * Navigate to previous page
   * WHY: Decrement page number
   * HOW: Get current page, decrement (min 1), set new page
   */
  const goToPrevious = useCallback(() => {
    const page = getPage()
    setPage(Math.max(1, page - 1))
  }, [getPage, setPage])

  //////////////////////////////////
  // CALCULATIONS: Derived pagination values
  //////////////////////////////////

  /**
   * Calculate all derived pagination values
   * WHY: Get complete pagination info for display and navigation
   * HOW: Use calculatePagination utility with current state and totalItems
   * @param {number} totalItems - Total number of items
   * @returns {PaginationCalculated} All calculated pagination values
   */
  const calculatePagination = useCallback((totalItems: number): PaginationCalculated => {
    if (isShowAll) {
      const endItem = totalItems
      return {
        totalPages: totalItems > 0 ? 1 : 0,
        isFirst: true,
        isLast: true,
        hasNext: false,
        hasPrevious: false,
        startItem: totalItems > 0 ? 1 : 0,
        endItem,
      }
    }
    const { page, limit } = currentPagination
    return calcPagination(page, limit, totalItems)
  }, [currentPagination, isShowAll])

  // Return all functions and current state
  // WHY: Provide complete API for pagination management
  // HOW: Return object with all getters, setters, navigation, and calculation functions
  return {
    // Current state
    page: currentPagination.page,
    limit: currentPagination.limit,
    isShowAll,

    // Getters
    getPage,
    getLimit,
    getPagination,
    
    // Setters
    setPage,
    setLimit,
    setShowAll,
    setPagination,
    resetPage,
    
    // Navigation
    goToFirst,
    goToLast,
    goToNext,
    goToPrevious,
    
    // Calculations
    calculatePagination
  }
}
