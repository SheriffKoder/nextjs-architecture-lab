'use client'

import React, { useMemo } from 'react'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display/filtering-wrapper'
import { tableColumns, tableConfig, filterConfig, NoteExpirationTableItem } from './config/table-config'
const ExpirationsContent = ({ 
  data, 
  loading, 
  handleRowClick
}: { 
  data: NoteExpirationTableItem[], 
  loading: boolean, 
  handleRowClick: (item: NoteExpirationTableItem) => void
}) => {

  // useMemo is beneficial when doing actual computation/transformation
  // Transform expiration data for both table and calendar display
  // Calendar expects: startDate, endDate, and name
  // Table can use the original fields, but we add calendar fields for calendar view
  const tableData = useMemo(() => {
    return data.map(item => ({
      ...item,
      // Add calendar-specific fields while preserving all original fields
      startDate: `${item.expirationDate}T00:00:00.000Z`, // Convert to ISO format
      endDate: `${item.expirationDate}T00:00:00.000Z`, // Same date for start and end (single day event)
      name: `${item.investor} - ${item.property}` // Display name combining investor and property
    }))
  }, [data])

  const limitStartDate = new Date()
  const limitEndDate = new Date()
  limitEndDate.setMonth(limitEndDate.getMonth() + 2) // 2 months from today

  // Calendar configuration
  const calendarConfig = {
    startDateKey: "startDate",
    endDateKey: "endDate",
    nameKey: "name",
    onProjectClick: (project: any) => {
      // Find the original expiration item from the data
      const expirationItem = data.find(item => item.id === project.id)
      if (expirationItem) {
        handleRowClick(expirationItem)
      }
    },
    limitStartDate: limitStartDate,
    limitEndDate: limitEndDate
  }

  return (
    <div className='w-full flex flex-col gap-6 h-full p-2 lg:p-0'>
      <div className='flex-1 min-w-0 overflow-auto'>
        <FilteringWrapper
          data={tableData}
          columns={tableColumns}
          onRowClick={handleRowClick}
          filterConfig={filterConfig}
          tableConfig={{
            ...tableConfig,
            loading: loading,
          }}
          availableViews={['table', 'calendar']}
          calendarConfig={calendarConfig}
        />
      </div>
    </div>
  )
}

export default ExpirationsContent
