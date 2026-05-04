'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display/filtering-wrapper'
import { tableColumns, tableConfig, filterConfig, MonthlyDistributionTableItem } from './config/table-config'

interface MonthlyDistributionsContentProps {
  data: MonthlyDistributionTableItem[]
  loading: boolean
  onRowClick?: (item: MonthlyDistributionTableItem) => void
  onCellValueChange?: (rowIndex: number, columnKey: string, newValue: any) => void
}

const MonthlyDistributionsContent = ({ data, loading, onRowClick, onCellValueChange }: MonthlyDistributionsContentProps) => {
  const pathname = usePathname();
  
  return (
    <div className='w-full flex flex-col gap-6 h-full p-2 lg:p-0'>
      <div className='flex-1 min-w-0 overflow-auto'>
        <FilteringWrapper
          key={pathname}
          data={data}
          columns={tableColumns}
          onRowClick={onRowClick}
          onCellValueChange={onCellValueChange}
          filterConfig={filterConfig}
          tableConfig={{
            ...tableConfig,
            loading: loading,
          }}
        />
      </div>
    </div>
  )
}

export default MonthlyDistributionsContent
