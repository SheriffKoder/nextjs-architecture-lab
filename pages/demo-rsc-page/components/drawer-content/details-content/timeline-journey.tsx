import CollapsibleCard from '@/features/ui-kit/layout/CollapsibleCard-sm'
import { ChevronDownIcon, MapPin } from 'lucide-react'
import { TimelineJourneyRow } from './timeline-journey-row'
import PrimaryButton from '@/features/ui-kit/buttons/primary-button'

export interface TimelineJourneyItem {
  title: string
  description: string
  date: string
  color: 'blue' | 'green' | 'red'
}


interface TimelineJourneyProps {
  selectedItem: any | null
  data: TimelineJourneyItem[]
  setIsJourneyPanelOpen: (isOpen: boolean) => void
  isJourneyPanelOpen: boolean
  headerText?: string
}

const TimelineJourney = ({ selectedItem, data, setIsJourneyPanelOpen, isJourneyPanelOpen, headerText }: TimelineJourneyProps) => {
  if (!selectedItem || !data || data.length === 0) {
    return null
  }


  const handleViewAll = () => {
    setIsJourneyPanelOpen(!isJourneyPanelOpen)
  }

  return (
    <CollapsibleCard 
      headerText={headerText || 'Item Journey'}
      leftIcon={MapPin}
      rightIcon={ChevronDownIcon}
      defaultOpen={true}
      variant="sm"
      isExpandedView={!isJourneyPanelOpen}
    >

      <PrimaryButton title="View All" onClick={handleViewAll} size="sm" 
      className={`hidden lg:block border border-foreground/10 w-fit mx-auto mt-1 rounded-md
      hover:bg-tertiary/30 group transition-all duration-500 ${isJourneyPanelOpen ? 'mb-2' : ''}`}>
        <span className={`${isJourneyPanelOpen ? 'text-tertiary' : 'text-foreground'} group-hover:text-tertiary transition-all duration-500`}>{isJourneyPanelOpen ? 'Minimize view' : 'Expand view'}</span>
      </PrimaryButton>
            
      <div className={`p-3 space-y-0 ${isJourneyPanelOpen ? 'block' : 'block'}`}>
        {data.map((item: TimelineJourneyItem, index: number) => (
          <TimelineJourneyRow key={index} item={item} variant="sm" />
        ))}
      </div>
    
    </CollapsibleCard>
  )
}

export default TimelineJourney
