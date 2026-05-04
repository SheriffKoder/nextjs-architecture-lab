'use client'

import { User, Allocation } from '@/lib/types'
import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { ScoreData } from './types'
import ScoreCards from '../../components/design/score-cards/score-cards'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display/filtering-wrapper'
import { tableColumns, tableConfig, filterConfig, InvestorTableItem } from './config/table-config'
import RightSlider from '@/components/design/right-slider'

// Extended User type with allocations for data processing
interface UserWithAllocations extends User {
  allocations?: Allocation[];
}

const InvestorsContent = ({ 
  data, 
  scoreData, 
  loading, 
  handleRowClick,
  onFilterApply
}: { 
  data: UserWithAllocations[]
  scoreData: ScoreData[]
  loading: boolean
  handleRowClick: (investor: InvestorTableItem) => void
  onFilterApply?: (key: string, items: string[], type: string) => void
}) => {
  const pathname = usePathname()
  
  // useMemo is beneficial when doing actual computation/transformation
  // Map User data to InvestorTableItem format
  // Note: totalInvested and projectsCount are already calculated by the API
  const tableData = useMemo<InvestorTableItem[]>(() => {
    return data.map((user) => {
      return {
        ...user,
      };
    });
  }, [data])


  return (
    <div className='w-full flex flex-col gap-6 h-full p-2 lg:p-0'>
      <ScoreCards scoreCardsConfig={scoreData} />

      <div className='flex-1 min-w-0 overflow-auto'>
        <FilteringWrapper
          key={pathname}
          data={tableData}
          columns={tableColumns}
          onRowClick={handleRowClick}
          filterConfig={filterConfig}
          tableConfig={{
            ...tableConfig,
            loading: loading,
          }}
          onFilterApply={onFilterApply}
        />
      </div>
    </div>
  )
}

export default InvestorsContent
