'use client'

import React from 'react'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display/filtering-wrapper'
import { tableColumns, tableConfig, filterConfig, NewsletterTrackerTableItem } from './config/table-config'

interface NewsletterTrackerContentProps {
  data: NewsletterTrackerTableItem[]
  loading: boolean
  onRowClick?: (item: NewsletterTrackerTableItem) => void
}

const NewsletterTrackerContent = ({ data, loading, onRowClick }: NewsletterTrackerContentProps) => {
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
        />
      </div>
    </div>
  )
}

export default NewsletterTrackerContent
