/**
 * Rental Cars Content Component
 * 
 * Purpose: Pure presentation component for rental cars table/views
 * Used in: features/rental-cars/index.tsx
 * Why: Separates table rendering logic, uses FilteringWrapper with subheadings and map views
 */

'use client'

import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display/filtering-wrapper'
import { tableColumns, tableConfig, filterConfig, RentalCarTableItem } from './config/table-config'
import { useMemo } from 'react'

////////////////////////////////////
// Type Definitions: Component props
////////////////////////////////////

interface RentalCarsContentProps {
  cars: RentalCarTableItem[]
  onRowClick?: (car: RentalCarTableItem) => void
  onSubheadingsDragEnd?: (updatedData: RentalCarTableItem[]) => void
}

////////////////////////////////////
// Component Implementation: Table display
////////////////////////////////////

/**
 * Rental cars content component with FilteringWrapper
 * 
 * Why: Displays rental cars in subheadings (location/status) and map views
 * How: Configures FilteringWrapper with nested grouping and map support
 */
export default function RentalCarsContent({ 
  cars, 
  onRowClick,
  onSubheadingsDragEnd,
}: RentalCarsContentProps) {
  
  // Generate nested groups for location (primary) and status (secondary)
  const nestedGroups = useMemo(() => {
    // Get unique locations
    const uniqueLocations = Array.from(
      new Set(cars.map(car => car.location).filter(Boolean))
    ).sort()
    
    // Status options
    const statusOptions = ['available', 'rented', 'maintenance', 'reserved']
    
    const groups: Array<{ 
      key: string
      label: string
      primaryValue: string
      secondaryValue: string
    }> = []
    
    // Create composite groups: location|status
    uniqueLocations.forEach(location => {
      statusOptions.forEach(status => {
        const compositeKey = `${location}|${status}`
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)
        groups.push({
          key: compositeKey,
          label: `${location} - ${statusLabel}`,
          primaryValue: location,
          secondaryValue: status,
        })
      })
    })
    
    return groups
  }, [cars])

  // SubHeadings configuration with nested grouping (location/status)
  const subheadingsConfig = useMemo(() => ({
    columnKey: 'location', // Primary grouping field (kept for backward compatibility)
    groups: nestedGroups.map(g => ({ 
      key: g.key, 
      label: g.label 
    })),
    subheadingsDragEnd: onSubheadingsDragEnd || (() => {}),
    nestedGrouping: {
      enabled: true,
      primaryKey: 'location',    // Primary grouping: location
      secondaryKey: 'status',    // Secondary grouping: status
      separator: '|'              // Separator for composite keys
    }
  }), [nestedGroups, onSubheadingsDragEnd])

  return (
    <div className="h-full w-full flex flex-col">
      {/* FilteringWrapper with subheadings and map views */}
      <div className="flex-1 min-h-0">
        <FilteringWrapper
          data={cars}
          columns={tableColumns}
          filterConfig={filterConfig}
          tableConfig={tableConfig}
          onRowClick={onRowClick}
          availableViews={['subheadings', 'map']}
          subheadingsConfig={subheadingsConfig}
        />
      </div>
    </div>
  )
}
