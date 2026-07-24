/**
 * Dropdown Filter Component
 * 
 * Purpose: Main orchestrator component for dropdown filter system
 * Used in: Pages that need dropdown-style filtering
 * Why: Provides complete dropdown filter functionality with exact styling from StandardFilterDropdown
 * 
 * Features:
 * - Dropdown with header, active filters, range filters, search, options list, footer
 * - Support for multi-select, single-select, date-range, number-range filters
 * - Virtualized options list for performance
 * - URL-based state management
 * - Auto-apply or manual apply modes
 * - FilterBoxButton or icon button trigger
 */

'use client'

import * as React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { ListFilter, X } from "lucide-react"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import {
  decodeUrlParamListWithKnownMultiSelect,
  encodeUrlParamList,
} from '@/platform/url-kit/filters/feature-filtering/utils/url-param-list-codec'
import type { DropdownFilterProps, DropdownFilterOption } from "./types"
import type { FilterConfig } from "../filter-types"
import { DropdownHeader } from "./components/dropdown-header"
import { ActiveFiltersSection } from "./components/active-filters-section"
import { RangeFilterSection } from "./components/range-filter-section"
import { SearchInput } from "./components/search-input"
import { FilterOptionsList } from "./components/filter-options-list"
import { DropdownFooter } from "./components/dropdown-footer"
import { FilterBoxButton } from "./components/filter-box-button"
import { DateRangeFilterDropdown } from "./range-filters/date-range-filter-dropdown"
import { NumberRangeFilterDropdown } from "./range-filters/number-range-filter-dropdown"
import { RangeQuickSelectList } from "./components/range-quick-select-list"
import { QuickSelectCollapsibleSection } from "./components/quick-select-collapsible-section"

//////////////////////////////////
// Component Implementation
//////////////////////////////////

/**
 * DropdownFilter component - main orchestrator
 * WHY: Provides complete dropdown filter functionality
 * HOW: Manages state, coordinates sub-components, handles URL integration
 * @param {DropdownFilterProps} props - Component props
 * @returns {React.ReactElement} Complete dropdown filter
 */
export function DropdownFilter({
  filter,
  isOpen: controlledIsOpen,
  onOpenChange,
  dataSource = [],
  formatDisplayValue,
  autoApply = false,
  showBadges = true,
  isLastColumn = false,
  allActiveFilterColumns = {},
  useFilterIcon = true,
  useFilterIconText,
  useFilterIconWidth = "200px",
  filterIcon,
  defaultRangeExpanded = false,
  showInitialCount = false,
  iconConfig
}: DropdownFilterProps) {
  //////////////////////////////////
  // State Management
  //////////////////////////////////

  const resolvedDefaultRangeExpanded =
    filter.defaultRangeExpanded ?? defaultRangeExpanded
  
  // Internal open state (if not controlled)
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen
  
  // Default onOpenChange if not provided (for uncontrolled mode)
  const defaultOnOpenChange = useCallback((open: boolean) => {}, [])
  const handleOpenChange = onOpenChange || defaultOnOpenChange
  
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingSelections, setPendingSelections] = useState<string[]>([])
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isOptionsLoaded, setIsOptionsLoaded] = useState(false)
  const [isDateRangeExpanded, setIsDateRangeExpanded] = useState(
    resolvedDefaultRangeExpanded,
  )
  const [isNumberRangeExpanded, setIsNumberRangeExpanded] = useState(
    resolvedDefaultRangeExpanded,
  )
  /** false on filter => start collapsed behind “Quick select options”; true/omit => list visible */
  const [isQuickSelectExpanded, setIsQuickSelectExpanded] = useState(
    filter.quickSelectOptionsExpanded !== false,
  )
  const [rangeSelectedValues, setRangeSelectedValues] = useState<string[]>([])
  const [pendingRangeSelectedValues, setPendingRangeSelectedValues] = useState<string[]>([])
  
  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // URL filters hook
  const { getRange, getNumberRange, setList, setRange, setNumberRange, remove } = useUrlFilters()
  const searchParams = useSearchParams()

  const selectKnownValues = useMemo(
    () =>
      filter.type === 'multi-select' || filter.type === 'single-select'
        ? new Set((filter.options ?? []).map((o) => o.value))
        : undefined,
    [filter.type, filter.options],
  )
  
  //////////////////////////////////
  // URL State Reading
  //////////////////////////////////
  
  // Get active filters from URL
  const activeFilters = useMemo(() => {
    if (filter.type === "date-range") {
      const range = getRange(filter.key)
      if (!range) return []
      // If start and end are the same, return only one value
      if (range.start && range.end && range.start === range.end) {
        return [range.start]
      }
      return [range.start, range.end].filter(Boolean)
    } else if (filter.type === "number-range") {
      const range = getNumberRange(filter.key)
      if (!range || (range.min === undefined && range.max === undefined)) return []
      // If min and max are the same, return only one value
      if (range.min !== undefined && range.max !== undefined && range.min === range.max) {
        return [String(range.min)]
      }
      // Return both min and max if they're different
      const values: string[] = []
      if (range.min !== undefined) values.push(String(range.min))
      if (range.max !== undefined && range.max !== range.min) values.push(String(range.max))
      return values.length > 0 ? values : ['range']
    } else {
      const raw = searchParams.get(filter.key)
      return decodeUrlParamListWithKnownMultiSelect(raw ?? '', selectKnownValues)
    }
  }, [
    filter.key,
    filter.type,
    getRange,
    getNumberRange,
    searchParams,
    selectKnownValues,
  ])
  
  const isFilterActive = activeFilters.length > 0
  const filterCount = activeFilters.length
  
  //////////////////////////////////
  // Options Calculation
  //////////////////////////////////
  
  // Fetch options from API if not provided
  const [apiOptions, setApiOptions] = useState<DropdownFilterOption[]>([])
  const isFetchingRef = useRef(false)
  const lastFetchParamsRef = useRef<string>('')
  
  // Create a stable string representation of filter params for dependency tracking
  const filterParamsString = useMemo(() => {
    const params = new URLSearchParams()
    Object.entries(allActiveFilterColumns || {}).forEach(([key, value]) => {
      if (key !== filter.key && value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, encodeUrlParamList(value))
        } else {
          params.append(key, String(value))
        }
      }
    })
    return params.toString()
  }, [allActiveFilterColumns, filter.key])
  
  useEffect(() => {
    // If options not provided and dropdown is open, fetch from API
    if (isOpen && (!filter.options || filter.options.length === 0)) {
      // Only fetch if params changed or we haven't fetched yet
      if (isFetchingRef.current || filterParamsString === lastFetchParamsRef.current) {
        return
      }
      
      isFetchingRef.current = true
      lastFetchParamsRef.current = filterParamsString
      
      fetch(`/api/filters/options?${filterParamsString}`)
        .then(res => res.json())
        .then((configs: FilterConfig[]) => {
          const foundConfig = configs.find(c => c.key === filter.key)
          if (foundConfig?.options) {
            const options = foundConfig.options.map(opt => ({
              label: opt.label,
              value: opt.value,
              rawValue: opt.value,
              totalCount: opt.count ?? 0,
              initialCount: opt.initialCount ?? opt.count ?? 0
            }))
            setApiOptions(options)
          }
          isFetchingRef.current = false
        })
        .catch(() => {
          isFetchingRef.current = false
        })
    } else if (!isOpen) {
      // Reset API options when dropdown closes
      setApiOptions([])
      isFetchingRef.current = false
      lastFetchParamsRef.current = ''
    }
  }, [isOpen, filter.key, filter.options, filterParamsString])
  
  // Calculate filter options from dataSource or use provided options
  const filterOptions = useMemo((): DropdownFilterOption[] => {
    // If options are provided in FilterConfig, use them
    if (filter.options && filter.options.length > 0) {
      return filter.options.map(opt => ({
        label: opt.label,
        value: opt.value,
        rawValue: opt.value, // Default rawValue to value if not provided
        totalCount: opt.count ?? 0,
        initialCount: opt.initialCount ?? opt.count ?? 0
      }))
    }
    
    // If API options are available, use them
    if (apiOptions.length > 0) {
      return apiOptions
    }
    
    // Otherwise, calculate from dataSource
    if (!dataSource || dataSource.length === 0) {
      return []
    }
    
    // Extract unique values for this filter key
    const optionMap = new Map<string, {
      rawValue: any
      totalCount: number
      initialCount: number
    }>()
    
    // Helper to extract display value
    const extractDisplayValue = (value: any): string => {
      if (formatDisplayValue) {
        return formatDisplayValue(value)
      }
      if (typeof value === 'object' && value !== null) {
        if (value.name) return value.name
        if (value.email) return value.email
        if (value.id) return String(value.id)
        return JSON.stringify(value)
      }
      return String(value)
    }
    
    // First pass: collect unique values from full data
    for (const item of dataSource) {
      const rawValue = item[filter.key]
      if (rawValue === undefined || rawValue === null) continue
      
      let valuesToProcess: any[] = []
      if (Array.isArray(rawValue)) {
        valuesToProcess = rawValue.filter(val => val !== null && val !== undefined)
      } else {
        valuesToProcess = [rawValue]
      }
      
      for (const value of valuesToProcess) {
        const stringValue = extractDisplayValue(value)
        
        if (!optionMap.has(stringValue)) {
          optionMap.set(stringValue, {
            rawValue: value,
            totalCount: 1,
            initialCount: 1 // For now, assume same as total (will be updated if filtered data provided)
          })
        } else {
          const option = optionMap.get(stringValue)!
          option.totalCount++
          option.initialCount++
        }
      }
    }
    
    // Include active filters in options
    for (const filterValue of activeFilters) {
      const stringValue = String(filterValue)
      if (!optionMap.has(stringValue)) {
        optionMap.set(stringValue, {
          rawValue: filterValue,
          totalCount: 0,
          initialCount: 0
        })
      }
    }
    
    return Array.from(optionMap.entries())
      .map(([stringValue, info]) => ({
        label: stringValue.charAt(0).toUpperCase() + stringValue.slice(1),
        value: stringValue,
        rawValue: info.rawValue,
        totalCount: info.totalCount,
        initialCount: info.initialCount
      }))
  }, [filter.options, filter.key, dataSource, formatDisplayValue, activeFilters, apiOptions])
  
  // Filter and sort options
  const filteredOptions = useMemo(() => {
    if (!filterOptions.length) return []
    
    // Filter by search term (in-dropdown search only when enabled for this filter)
    let options = filterOptions
    if (searchTerm && filter.showOptionSearch !== false) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      options = options.filter(option =>
        option.value.toLowerCase().includes(lowerSearchTerm)
      )
    }
    
    // Sort options
    const isNumberField = filter.type === "number-range"
    const isDateField = filter.type === "date-range"
    
    let sortedOptions = options.sort((a, b) => {
      // First priority: selected items come first
      const aSelected = pendingSelections.includes(a.value)
      const bSelected = pendingSelections.includes(b.value)
      
      if (aSelected && !bSelected) return -1
      if (!aSelected && bSelected) return 1
      
      // Second priority: sort by availability if other filters active
      const hasOtherFilters = Object.entries(allActiveFilterColumns || {})
        .some(([key, values]) => {
          if (key === filter.key) return false
          if (values === null || values === undefined) return false
          if (Array.isArray(values)) return values.length > 0
          if (typeof values === 'object') return true
          return false
        })
      
      if (hasOtherFilters) {
        const aAvailable = (a.initialCount ?? 0) > 0
        const bAvailable = (b.initialCount ?? 0) > 0
        
        if (aAvailable && !bAvailable) return -1
        if (!aAvailable && bAvailable) return 1
      }
      
      // Third priority: sort by value type
      if (isNumberField) {
        const aValue = parseFloat(a.value)
        const bValue = parseFloat(b.value)
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return aValue - bValue
        }
      } else if (isDateField) {
        // Handle date sorting if needed
        return a.value.localeCompare(b.value)
      }
      
      // Default: alphabetical
      return a.value.toLowerCase().localeCompare(b.value.toLowerCase())
    })
    
    // Apply sort direction
    if (sortDirection === 'desc') {
      const selectedItems = sortedOptions.filter(opt => pendingSelections.includes(opt.value))
      const unselectedItems = sortedOptions.filter(opt => !pendingSelections.includes(opt.value))
      return [...selectedItems, ...unselectedItems.reverse()]
    }
    
    return sortedOptions
  }, [filterOptions, searchTerm, pendingSelections, sortDirection, filter.type, filter.key, filter.showOptionSearch, allActiveFilterColumns])
  
  // Check if other columns have active filters
  const hasOtherColumnFilters = useMemo(() => {
    return Object.entries(allActiveFilterColumns || {})
      .some(([key, values]) => {
        if (key === filter.key) return false
        if (values === null || values === undefined) return false
        if (Array.isArray(values)) return values.length > 0
        if (typeof values === 'object') return true
        return false
      })
  }, [allActiveFilterColumns, filter.key])
  
  // Calculate item counts
  const itemCounts = useMemo(() => {
    const selectedCount = pendingSelections.length
    const availableCount = filteredOptions.length
    return { selectedCount, availableCount }
  }, [pendingSelections.length, filteredOptions.length])
  
  //////////////////////////////////
  // Effects
  //////////////////////////////////
  
  // Get current active filters for dependency tracking using searchParams directly
  const currentActiveFiltersString = useMemo(() => {
    if (filter.type === "multi-select" || filter.type === "single-select") {
      const value = searchParams.get(filter.key)
      const filters = value
        ? decodeUrlParamListWithKnownMultiSelect(value, selectKnownValues).sort()
        : []
      return JSON.stringify(filters)
    }
    return ''
  }, [filter.key, filter.type, searchParams, selectKnownValues])
  
  // Track previous values with refs
  const prevIsOpenRef = useRef(isOpen)
  const prevFiltersStringRef = useRef<string>('')
  
  // Initialize pending selections from URL when dropdown opens
  useEffect(() => {
    // Only update when dropdown state changes or active filters change
    const isOpening = isOpen && !prevIsOpenRef.current
    const filtersChanged = isOpen && currentActiveFiltersString !== prevFiltersStringRef.current
    
    if (isOpening || filtersChanged) {
      if (filter.type === "multi-select" || filter.type === "single-select") {
        const value = searchParams.get(filter.key)
        const filters = value
          ? decodeUrlParamListWithKnownMultiSelect(value, selectKnownValues)
          : []
        setPendingSelections(filters)
      } else {
        setPendingSelections([])
      }
      prevFiltersStringRef.current = currentActiveFiltersString
    }
    
    // Options source can arrive after open (e.g. TanStack finishes after first paint) — sync whenever open
    if (isOpen) {
      setIsOptionsLoaded(
        (filter.options && filter.options.length > 0) ||
          apiOptions.length > 0 ||
          (dataSource && dataSource.length > 0)
      )
    }
    
    // Initialize pending range selections when dropdown opens (if not auto-apply)
    if (isOpening && !autoApply && (filter.type === "date-range" || filter.type === "number-range")) {
      // pendingRangeSelectedValues will be synced in the rangeSelectedValues effect
      // This ensures they're initialized from URL state
    }
    
    if (!isOpen && prevIsOpenRef.current) {
      // Reset search and options when closed
      setSearchTerm('')
      setIsOptionsLoaded(false)
      prevFiltersStringRef.current = ''
      // Reset pending range selections when closed (if not auto-apply)
      if (!autoApply && (filter.type === "date-range" || filter.type === "number-range")) {
        setPendingRangeSelectedValues([])
      }
    }
    
    prevIsOpenRef.current = isOpen
  }, [isOpen, filter.key, filter.type, currentActiveFiltersString, filter.options?.length, apiOptions.length, dataSource?.length, autoApply])
  
  // Auto-apply effect
  useEffect(() => {
    if (autoApply && pendingSelections.length >= 0) {
      if (filter.type === "multi-select" || filter.type === "single-select") {
        setList(filter.key, pendingSelections)
      }
    }
  }, [pendingSelections, autoApply, filter.key, filter.type, setList])
  
  // Auto-focus search input when dropdown opens (only if option search is shown)
  useEffect(() => {
    if (isOpen && filter.showOptionSearch !== false && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, filter.showOptionSearch])
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  //////////////////////////////////
  // Event Handlers
  //////////////////////////////////
  
  const handleToggle = () => {
    const newOpen = !isOpen
    if (!isControlled) {
      setInternalIsOpen(newOpen)
    }
    handleOpenChange(newOpen)
  }
  
  const handleClose = useCallback(() => {
    // Reset pending selections to current URL state when closing/canceling (if not auto-apply)
    if (!autoApply && (filter.type === "date-range" || filter.type === "number-range")) {
      // Reset to current URL state
      setPendingRangeSelectedValues(rangeSelectedValues)
    }
    
    if (!isControlled) {
      setInternalIsOpen(false)
    }
    handleOpenChange(false)
  }, [isControlled, handleOpenChange, autoApply, filter.type, rangeSelectedValues])
  
  const toggleOption = useCallback((value: string) => {
    setPendingSelections(prev => {
      const newSelections = prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
      
      // Auto-apply if enabled
      if (autoApply) {
        if (filter.type === "multi-select") {
          setList(filter.key, newSelections)
        } else if (filter.type === "single-select") {
          setList(filter.key, [value])
        }
      }
      
      return newSelections
    })
  }, [autoApply, filter.key, filter.type, setList])
  
  const applyFilters = useCallback(() => {
    if (filter.type === "multi-select" || filter.type === "single-select") {
      setList(filter.key, pendingSelections)
    } else if (filter.type === "date-range") {
      // Apply pending range selections
      if (pendingRangeSelectedValues.length === 0) {
        remove(filter.key)
      } else {
        const sortedDates = pendingRangeSelectedValues.sort()
        const minDate = sortedDates[0]
        const maxDate = sortedDates[sortedDates.length - 1]
        setRange(filter.key, minDate, maxDate)
      }
    } else if (filter.type === "number-range") {
      // Apply pending range selections
      if (pendingRangeSelectedValues.length === 0) {
        remove(filter.key)
      } else {
        const numbers = pendingRangeSelectedValues.map(v => Number(v)).filter(n => !isNaN(n))
        if (numbers.length > 0) {
          const min = Math.min(...numbers)
          const max = Math.max(...numbers)
          setNumberRange(filter.key, min, max)
        }
      }
    }
  }, [pendingSelections, pendingRangeSelectedValues, filter.key, filter.type, setList, setRange, setNumberRange, remove])
  
  const clearFilters = useCallback(() => {
    setPendingSelections([])
    setPendingRangeSelectedValues([])
    remove(filter.key)
  }, [filter.key, remove])
  
  const removeFilter = useCallback((filterValue: string) => {
    if (filter.type === "multi-select" || filter.type === "single-select") {
      const newFilters = activeFilters.filter(f => f !== filterValue)
      setList(filter.key, newFilters)
      setPendingSelections(newFilters)
    } else {
      remove(filter.key)
    }
  }, [activeFilters, filter.key, filter.type, setList, remove])
  
  const toggleSort = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  }, [])
  
  //////////////////////////////////
  // Range Quick-Select Logic
  //////////////////////////////////
  
  // Handle toggle for range quick-select list
  const handleRangeToggle = useCallback((value: string) => {
    if (filter.type === "date-range") {
      let newSelected: string[]
      if (pendingRangeSelectedValues.includes(value)) {
        newSelected = pendingRangeSelectedValues.filter(v => v !== value)
      } else {
        newSelected = [...pendingRangeSelectedValues, value].sort()
      }
      setPendingRangeSelectedValues(newSelected)
      
      // Auto-apply if enabled
      if (autoApply) {
        if (newSelected.length === 0) {
          remove(filter.key)
        } else {
          const sortedDates = newSelected.sort()
          const minDate = sortedDates[0]
          const maxDate = sortedDates[sortedDates.length - 1]
          setRange(filter.key, minDate, maxDate)
        }
      }
    } else if (filter.type === "number-range") {
      let newSelected: string[]
      if (pendingRangeSelectedValues.includes(value)) {
        newSelected = pendingRangeSelectedValues.filter(v => v !== value)
      } else {
        newSelected = [...pendingRangeSelectedValues, value]
      }
      setPendingRangeSelectedValues(newSelected)
      
      // Auto-apply if enabled
      if (autoApply) {
        if (newSelected.length === 0) {
          remove(filter.key)
        } else {
          const numbers = newSelected.map(v => Number(v)).filter(n => !isNaN(n))
          if (numbers.length > 0) {
            const min = Math.min(...numbers)
            const max = Math.max(...numbers)
            setNumberRange(filter.key, min, max)
          }
        }
      }
    }
  }, [filter.type, filter.key, pendingRangeSelectedValues, autoApply, setRange, setNumberRange, remove])
  
  // Create stable string representation of range for dependency tracking
  const rangeString = useMemo(() => {
    if (filter.type === "date-range") {
      return searchParams.get(filter.key) || ''
    } else if (filter.type === "number-range") {
      return searchParams.get(filter.key) || ''
    }
    return ''
  }, [filter.type, filter.key, searchParams])
  
  // Sync rangeSelectedValues with URL (for display)
  useEffect(() => {
    if (filter.type === "date-range") {
      const value = searchParams.get(filter.key)
      if (value) {
        const [start, end] = value.split('_')
        if (start && end && filter.options) {
          const selected: string[] = []
          const startDate = new Date(start)
          const endDate = new Date(end)
          filter.options.forEach((option) => {
            const optionDate = new Date(option.value)
            if (optionDate >= startDate && optionDate <= endDate) {
              selected.push(option.value)
            }
          })
          setRangeSelectedValues(selected)
          // Sync pending selections with URL state when dropdown opens or URL changes externally
          if (!isOpen || autoApply) {
            setPendingRangeSelectedValues(selected)
          }
        } else {
          setRangeSelectedValues([])
          if (!isOpen || autoApply) {
            setPendingRangeSelectedValues([])
          }
        }
      } else {
        setRangeSelectedValues([])
        if (!isOpen || autoApply) {
          setPendingRangeSelectedValues([])
        }
      }
    } else if (filter.type === "number-range") {
      const value = searchParams.get(filter.key)
      if (value) {
        const [minStr, maxStr] = value.split('_')
        const min = minStr ? parseFloat(minStr) : undefined
        const max = maxStr ? parseFloat(maxStr) : undefined
        if ((min !== undefined || max !== undefined) && filter.options) {
          const selected: string[] = []
          const minVal = min ?? -Infinity
          const maxVal = max ?? Infinity
          filter.options.forEach((option) => {
            const optionNum = Number(option.value)
            if (!isNaN(optionNum) && optionNum >= minVal && optionNum <= maxVal) {
              selected.push(option.value)
            }
          })
          setRangeSelectedValues(selected)
          // Sync pending selections with URL state when dropdown opens or URL changes externally
          if (!isOpen || autoApply) {
            setPendingRangeSelectedValues(selected)
          }
        } else {
          setRangeSelectedValues([])
          if (!isOpen || autoApply) {
            setPendingRangeSelectedValues([])
          }
        }
      } else {
        setRangeSelectedValues([])
        if (!isOpen || autoApply) {
          setPendingRangeSelectedValues([])
        }
      }
    }
  }, [filter.type, filter.key, filter.options, rangeString, isOpen, autoApply])
  
  //////////////////////////////////
  // Range Filter Content
  //////////////////////////////////
  
  const renderRangeFilterContent = () => {
    if (filter.type === "date-range") {
      return (
        <DateRangeFilterDropdown
          filter={filter}
        />
      )
    } else if (filter.type === "number-range") {
      return (
        <NumberRangeFilterDropdown
          filter={filter}
        />
      )
    }
    return null
  }
  
  const isRangeFilter = filter.type === "date-range" || filter.type === "number-range"
  const rangeExpanded = filter.type === "date-range" ? isDateRangeExpanded : isNumberRangeExpanded
  
  // Stable callback for range expand/collapse
  const handleRangeExpandedChange = useCallback((expanded: boolean) => {
    if (filter.type === "date-range") {
      setIsDateRangeExpanded(expanded)
    } else if (filter.type === "number-range") {
      setIsNumberRangeExpanded(expanded)
    }
  }, [filter.type])
  
  //////////////////////////////////
  // Render
  //////////////////////////////////
  
  return (
    <div className="relative inline-block w-full lg:w-auto">
      {/* Trigger Button */}
      {!isOpen && (
        !useFilterIcon ? (
          <FilterBoxButton
            buttonText={useFilterIconText || `Filter ${filter.label}`}
            isActive={isFilterActive}
            isOpen={false}
            width={useFilterIconWidth}
            icon={filterIcon || (iconConfig && iconConfig[filter.key])}
            onClick={handleToggle}
          />
        ) : (
          <button
            onClick={handleToggle}
            className={`relative p-1 rounded-md hover:bg-foreground/10 focus:outline-none ${
              isFilterActive ? 'text-tertiary' : 'text-tertiary'
            }`}
            title={`Filter ${filter.label}`}
          >
            <ListFilter 
              strokeWidth={isFilterActive ? 2.5 : 2} 
              size={14} 
              className={isFilterActive ? 'fill-tertiary/20 text-tertiary' : 'text-tertiary'} 
            />
            {filterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-tertiary text-background text-[8px] font-medium rounded-full h-3 w-3 flex items-center justify-center">
                {filterCount > 9 ? '9+' : filterCount}
              </span>
            )}
          </button>
        )
      )}
      
      {/* Close Button */}
      {isOpen && (
        !useFilterIcon ? (
          <FilterBoxButton
            buttonText="Close Filter"
            isActive={isFilterActive}
            isOpen={true}
            width={useFilterIconWidth}
            icon={filterIcon || (iconConfig && iconConfig[filter.key])}
            onClick={handleClose}
          />
        ) : (
          <button
            onClick={handleClose}
            className={`cursor-pointer p-1 rounded-md hover:bg-tertiary/10 focus:outline-none ${
              isFilterActive ? 'text-blue-600' : 'text-gray-500'
            }`}
            title={`Filter ${filter.label}`}
          >
            <X size={14} className={isFilterActive ? 'fill-tertiary/20 text-tertiary' : 'text-tertiary'} />
          </button>
        )
      )}
      
      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-30 mt-1 flex max-h-[min(70vh,28rem)] min-h-0 w-64 flex-col overflow-hidden rounded border border-border bg-background/90 shadow-lg backdrop-blur-sm dark:border-border/50 dark:bg-background/70 ${
            isLastColumn ? 'right-0' : 'left-0'
          }`}
        >
          <div className="shrink-0">
            <DropdownHeader
              filterLabel={filter.label}
              selectedCount={itemCounts.selectedCount}
              availableCount={itemCounts.availableCount}
              sortDirection={sortDirection}
              onToggleSort={toggleSort}
            />
          </div>
          
          {isFilterActive && (
            <div className="shrink-0">
              <ActiveFiltersSection
                activeFilters={activeFilters}
                filteredOptions={filteredOptions}
                formatDisplayValue={formatDisplayValue}
                onRemoveFilter={removeFilter}
                onClearFilters={clearFilters}
                showBadges={showBadges}
              />
            </div>
          )}
          
          {isRangeFilter && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {/* Single scroll region: range inputs + quick select; footer stays pinned (see app/development/dropdown-filter) */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
                <RangeFilterSection
                  rangeFilterContent={renderRangeFilterContent()}
                  isExpanded={rangeExpanded}
                  onExpandedChange={handleRangeExpandedChange}
                />
                {filter.showQuickSelect ? (
                  filter.quickSelectOptionsExpanded === false ? (
                    <QuickSelectCollapsibleSection
                      isExpanded={isQuickSelectExpanded}
                      onExpandedChange={setIsQuickSelectExpanded}
                    >
                      <RangeQuickSelectList
                        filter={filter}
                        selectedValues={
                          autoApply ? rangeSelectedValues : pendingRangeSelectedValues
                        }
                        onToggle={handleRangeToggle}
                        sortDirection={sortDirection}
                        showInitialCount={showInitialCount}
                        showSectionHeading={false}
                      />
                    </QuickSelectCollapsibleSection>
                  ) : (
                    <RangeQuickSelectList
                      filter={filter}
                      selectedValues={
                        autoApply ? rangeSelectedValues : pendingRangeSelectedValues
                      }
                      onToggle={handleRangeToggle}
                      sortDirection={sortDirection}
                      showInitialCount={showInitialCount}
                    />
                  )
                ) : null}
              </div>
              <DropdownFooter
                pendingSelections={pendingRangeSelectedValues}
                isFilterActive={isFilterActive}
                autoApply={autoApply}
                onClearFilters={clearFilters}
                onCancel={handleClose}
                onApplyFilters={applyFilters}
              />
            </div>
          )}
          
          {(filter.type === "multi-select" || filter.type === "single-select") && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {filter.showOptionSearch !== false ? (
                <div className="shrink-0">
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    inputRef={searchInputRef}
                  />
                </div>
              ) : null}
              <div
                className={
                  filter.showOptionSearch === false
                    ? "min-h-0 flex-1 overflow-hidden"
                    : "min-h-0 flex-1 overflow-hidden"
                }
              >
                <FilterOptionsList
                  options={filteredOptions}
                  pendingSelections={pendingSelections}
                  onToggleOption={toggleOption}
                  formatDisplayValue={formatDisplayValue}
                  hasOtherColumnFilters={hasOtherColumnFilters}
                  isOptionsLoaded={isOptionsLoaded}
                  showInitialCount={showInitialCount}
                />
              </div>
              <DropdownFooter
                pendingSelections={pendingSelections}
                isFilterActive={isFilterActive}
                autoApply={autoApply}
                onClearFilters={clearFilters}
                onCancel={handleClose}
                onApplyFilters={applyFilters}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
