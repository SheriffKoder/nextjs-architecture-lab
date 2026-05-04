import React from 'react'
import { InvestorTableItem } from '../../config/table-config'
import type { InvestorJourneyItem } from '../../types'
import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import { ChevronDownIcon, MapPin } from 'lucide-react'
import { InvestorJourneyRow } from './investor-journey-row'
import PrimaryButton from '@/components/design/primary-button'

interface InvestorJourneyProps {
  selectedInvestor: InvestorTableItem | null
  investorJourneyData: InvestorJourneyItem[]
  setIsJourneyPanelOpen: (isOpen: boolean) => void
  isJourneyPanelOpen: boolean
}

const InvestorJourney = ({ selectedInvestor, investorJourneyData, setIsJourneyPanelOpen, isJourneyPanelOpen }: InvestorJourneyProps) => {
  if (!selectedInvestor || !investorJourneyData || investorJourneyData.length === 0) {
    return null
  }


  const handleViewAll = () => {
    setIsJourneyPanelOpen(!isJourneyPanelOpen)
  }

  return (
    <CollapsibleCard 
      headerText="Investor Journey"
      leftIcon={MapPin}
      rightIcon={ChevronDownIcon}
      defaultOpen={true}
      variant="sm"
    >

      <PrimaryButton title="View All" onClick={handleViewAll} size="sm" 
      className={`hidden lg:block border border-foreground/10 w-fit mx-auto mt-1 rounded-md 
      hover:bg-tertiary/30 group transition-all duration-500 ${isJourneyPanelOpen ? 'mb-2' : ''}`}>
        <span className={`${isJourneyPanelOpen ? 'text-tertiary' : 'text-foreground'} group-hover:text-tertiary transition-all duration-500`}>{isJourneyPanelOpen ? 'Minimize view' : 'Expand view'}</span>
      </PrimaryButton>
            
      <div className={`p-3 space-y-0 ${isJourneyPanelOpen ? 'hidden' : 'block'}`}>
        {investorJourneyData.map((item, index) => (
          <InvestorJourneyRow key={index} item={item} variant="sm" />
        ))}
      </div>
    
    </CollapsibleCard>
  )
}

export default InvestorJourney
