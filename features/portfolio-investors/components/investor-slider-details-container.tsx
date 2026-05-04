import React from 'react'
import { InvestorTableItem } from '../config/table-config'
import type { Allocation } from '@/lib/types'
import type { InvestorJourneyItem } from '../types'
import InvestorDetails from './details-slider/investor-details'
import InvestorProjects from './details-slider/investor-projects'
import InvestorJourney from './details-slider/investor-journey'

/** Org from GET /api/orgs with members, totalInvested, projectsCount */
interface InvestorOrg {
  id: string
  name: string
  org_types: string[]
  members?: Array<{
    user?: { id: string; name: string | null; email: string | null; phone?: string | null };
    role?: { key: string };
  }>
  totalInvested?: number
  projectsCount?: number
}

interface InvestorSliderDetailsContainerProps {
  selectedInvestor: InvestorTableItem | null
  selectedOrg: InvestorOrg | null
  allocations: Allocation[]
  allocationsLoading?: boolean
  investorJourneyData: InvestorJourneyItem[]
  setIsJourneyPanelOpen: (isOpen: boolean) => void
  isJourneyPanelOpen: boolean
  onAllocationClick?: (allocation: Allocation) => void
}

const InvestorSliderDetailsContainer = ({ selectedInvestor, selectedOrg, allocations, allocationsLoading, investorJourneyData, setIsJourneyPanelOpen, isJourneyPanelOpen, onAllocationClick }: InvestorSliderDetailsContainerProps) => {
  if (!selectedInvestor) {
    return null
  }

  return (
    <div className='space-y-4 w-full'>
      {/* Investor Details */}
      <InvestorDetails selectedInvestor={selectedInvestor} selectedOrg={selectedOrg} />

      {/* Investor Projects: allocations passed from parent */}
      <InvestorProjects allocations={allocations} allocationsLoading={allocationsLoading} onAllocationClick={onAllocationClick} />

      {/* Investor Journey: built from allocations + transactions + org */}
      {investorJourneyData.length > 0 && (
        <InvestorJourney selectedInvestor={selectedInvestor} investorJourneyData={investorJourneyData} setIsJourneyPanelOpen={setIsJourneyPanelOpen} isJourneyPanelOpen={isJourneyPanelOpen} />
      )}
    </div>
  )
}

export default InvestorSliderDetailsContainer
