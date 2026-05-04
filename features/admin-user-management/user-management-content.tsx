'use client'

import React from 'react'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display/filtering-wrapper'
import { tableColumns, tableConfig, filterConfig, AdminUserTableItem } from './config/table-config'
import type { FilterUniqueValuesMap } from '@/features/filtering-wrapper-multi-display/types'

interface UserManagementContentProps {
  data: AdminUserTableItem[]
  loading: boolean
  onRowClick?: (item: AdminUserTableItem) => void
  onFilterApply?: (key: string, items: string[], type: string, columnConfig?: { filterApiParams?: { text?: string; number?: { from: string; to: string }; date?: { start: string; end: string }; isArray?: boolean; valueField?: 'id' | 'item' } }) => void
  onSortChange?: (sortSpec: string | undefined) => void
  serverPagination?: { total: number; page: number; limit: number; onPageChange: (page: number) => void }
  filterUniqueValues?: FilterUniqueValuesMap
}

const UserManagementContent = ({
  data,
  loading,
  onRowClick,
  onFilterApply,
  onSortChange,
  serverPagination,
  filterUniqueValues = {},
}: UserManagementContentProps) => {
  return (
    <div className='w-full flex flex-col gap-6 h-full p-2 lg:p-0'>
      <div className='flex-1 min-w-0 overflow-auto'>
        <FilteringWrapper
          data={data}
          columns={tableColumns}
          onRowClick={onRowClick}
          filterConfig={filterConfig}
          tableConfig={{
            ...tableConfig,
            loading: loading,
          }}
          onFilterApply={onFilterApply}
          onSortChange={onSortChange}
          serverPagination={serverPagination}
          filterUniqueValues={filterUniqueValues}
        />
      </div>
    </div>
  )
}

export default UserManagementContent
