'use client'

import PageHeader from '@/components/layout/page-header'
import React, { useEffect, useState, useRef } from 'react'
import NewsletterTrackerContent from './newsletter-tracker-content'
import ActionButtons from './components/action-buttons'
import RightSlider from '@/components/design/right-slider'
import { NewsletterTrackerTableItem } from './config/table-config'
import { useAllocations } from '@/hooks'
import InstructionsModalListings from '@/components/design/InstructionsModalListings'
import { FileSpreadsheet } from 'lucide-react'

const Index = () => {
  const allocationsHook = useAllocations()
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterTrackerTableItem | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportCSVModal, setShowExportCSVModal] = useState(false);

  const [data, setData] = useState<NewsletterTrackerTableItem[]>([]);

  // Load allocations and transform to newsletter tracker format
  useEffect(() => {
    let isMounted = true;

    const loadSubscribers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await allocationsHook.getAll({ limit: 1000 })
        
        if (!isMounted) return;

        if (response) {
          // Transform allocations to NewsletterTrackerTableItem format
          // Get unique investor-company-property combinations
          const subscriberMap = new Map<string, NewsletterTrackerTableItem>()
          
          response.data.forEach((allocation) => {
            const key = `${allocation.investor_org_id}-${allocation.project?.company_id || ''}-${allocation.project_id}`
            
            // Only add if not already in map (to avoid duplicates)
            if (!subscriberMap.has(key)) {
              subscriberMap.set(key, {
                id: allocation.id,
                company: allocation.project?.company?.name || 'N/A',
                investor: allocation.investor_org?.name || 'N/A',
                property: allocation.project?.address || 'N/A',
                email: allocation.created_by?.email || allocation.investor_org?.name || 'N/A',
              })
            }
          })
          
          // Set data first, then set loading to false to ensure state updates in correct order
          setData(Array.from(subscriberMap.values()))
        }
        setIsLoading(false)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load subscribers')
          console.error('Error loading subscribers:', err)
          setIsLoading(false)
        }
      }
    }

    loadSubscribers()

    return () => {
      isMounted = false;
    }
  }, [])

  // Empty callback functions for action buttons
  const handleExportCSV = () => {
    setShowExportCSVModal(true)
  }

  const handleRowClick = (subscriber: NewsletterTrackerTableItem) => {
    setSelectedSubscriber(subscriber)
    setIsPanelOpen(true)
  }


  return (
    <div className='flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative'>
         {/* Header */}
         <header className='absolute top-0 left-0 w-full lg:w-[calc(100%)] flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0
         bg-background/20 backdrop-blur-sm z-[50]'>
            <PageHeader />
            <ActionButtons onExportCSV={handleExportCSV} />
        </header>

        
        <div className='flex-1 overflow-y-auto flex pb-2 min-w-0 pt-[170px] lg:pt-[100px] w-full'>
        {/* Main content */}
            <div className='h-full w-full pr-2 pt-2 min-w-0'>
              <NewsletterTrackerContent 
              data={data} 
              loading={isLoading} 
              onRowClick={handleRowClick}/>
            </div>
        </div>

        {/* <RightSlider
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        header="Subscriber Details"
        subHeader={selectedSubscriber ? `${selectedSubscriber.investor} - ${selectedSubscriber.property}` : undefined}
        >
          <div>Your content here</div>
      </RightSlider> */}

      {/* Export CSV Instructions Modal */}
      {showExportCSVModal && (
      <InstructionsModalListings
        height='h-screen lg:h-fit'
        showInstructionsModal={showExportCSVModal}
        setShowInstructionsModal={setShowExportCSVModal}
        headerText="Export Newsletter Subscribers to CSV"
        descriptionText="Generate a CSV file containing all subscriber data"
        icon={<FileSpreadsheet className="w-full h-full text-foreground/10" />}
      >
        <div className="text-sm text-foreground/70 dark:text-foreground/50 mt-4">
          <p>The CSV export will include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>All subscriber details</li>
          </ul>
          </div>
        </InstructionsModalListings>
      )}
    </div>
  )
}

export default Index
