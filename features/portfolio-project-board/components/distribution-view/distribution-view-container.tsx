import React, { useMemo } from 'react'
import { ProjectBoardTableItem } from '../../config/table-config'
import { Allocation } from '@/lib/types'
import AllocationStatusHeader from './allocation-status-header'
import DistributionSummaryGrid from './distribution-summary-grid'
import DistributionTable from './distribution-table'

interface DistributionViewContainerProps {
  selectedProject: ProjectBoardTableItem
  preFetchedProjectAllocations: Allocation[]
  onDistributionViewClose: () => void
  onRowClick?: (allocation: Allocation) => void
}

const DistributionViewContainer = ({ selectedProject, preFetchedProjectAllocations, onDistributionViewClose, onRowClick }: DistributionViewContainerProps) => {
  // Calculate totals from allocations
  const summaryData = useMemo(() => {
    const totalCapitalInvested = preFetchedProjectAllocations.reduce(
      (sum, alloc) => sum + (alloc.allocation_amount || 0),
      0
    )

    const totalInterestAccrued = preFetchedProjectAllocations.reduce(
      (sum, alloc) => sum + (alloc.accrued_interest || 0),
      0
    )

    // Total Amount to Allocate = Total Capital Invested + Total Interest Accrued
    const totalAmountToAllocate = totalCapitalInvested + totalInterestAccrued

    // Get allocation status (use first allocation's status, or 'active' as default)
    const allocationStatus = preFetchedProjectAllocations.length > 0
      ? preFetchedProjectAllocations[0].status || 'active'
      : 'active'

    // Sale date - using project's updated_at or a placeholder (you may need to add sale_date field)
    const saleDate = selectedProject.updated_at || null

    return {
      totalCapitalInvested,
      totalInterestAccrued,
      totalAmountToAllocate,
      allocationStatus,
      saleDate
    }
  }, [preFetchedProjectAllocations, selectedProject])

  return (
    <div className='overflow-y-auto p-4 space-y-6 w-[80vw]'>
      {/* Row 1: Allocation Status */}
      <AllocationStatusHeader status={summaryData.allocationStatus} />

      {/* Row 2: Summary Grid */}
      <DistributionSummaryGrid
        saleDate={summaryData.saleDate}
        totalCapitalInvested={summaryData.totalCapitalInvested}
        totalInterestAccrued={summaryData.totalInterestAccrued}
        totalAmountToAllocate={summaryData.totalAmountToAllocate}
      />

      <div className='w-full h-2'></div>

      {/* Row 3: Distribution Table */}
      <div className='overflow-x-auto'>
        <DistributionTable allocations={preFetchedProjectAllocations} onRowClick={onRowClick} />
      </div>
    </div>
  )
}

export default DistributionViewContainer
