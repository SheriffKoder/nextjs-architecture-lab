'use client'

import PageHeader from '@/components/layout/page-header'
import React, { useEffect, useState } from 'react'
import ActionButtons from './components/action-buttons'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display/filtering-wrapper'
import { tableColumns, tableConfig, filterConfig, DashboardTableItem } from './config/table-config'
import InstructionsModalListings from '@/components/design/InstructionsModalListings'
import { FileText } from 'lucide-react'
import { useDashboard } from '@/hooks'

const Index = () => {
  const { getSummary } = useDashboard()
  const [isLoading, setIsLoading] = useState(true)
  const [showExportPDFModal, setShowExportPDFModal] = useState(false)
  const [data, setData] = useState<DashboardTableItem[]>([])

  useEffect(() => {
    setIsLoading(true)
    getSummary().then((res) => {
      if (res?.tableRows) {
        setData(res.tableRows as DashboardTableItem[])
      }
      setIsLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleExportPDF = () => {
    setShowExportPDFModal(true)
  }

  return (
    <div className='flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative'>
      <header className='absolute top-0 left-0 w-full lg:w-[calc(100%)] flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0
      bg-background/20 backdrop-blur-sm z-[50]'>
        <PageHeader />
        <ActionButtons 
          appfolioUrl="https://appfolio.com"
          quickbooksUrl="https://quickbooks.intuit.com"
          buildertrendUrl="https://buildertrend.net"
          onExportPDF={handleExportPDF}
        />
      </header>

      <div className='flex-1 overflow-y-auto flex pb-0 min-w-0 pt-[200px] lg:pt-[120px] w-full'>
        <div className='h-full w-full pr-2 pt-2 min-w-0 p-2'>
          <FilteringWrapper
            data={data}
            columns={tableColumns}
            filterConfig={filterConfig}
            tableConfig={{
              ...tableConfig,
              loading: isLoading,
            }}
            noTableDisplay={true}
          />
        </div>
      </div>

      {showExportPDFModal && (
        <InstructionsModalListings
          height='h-screen lg:h-fit'
          showInstructionsModal={showExportPDFModal}
          setShowInstructionsModal={setShowExportPDFModal}
          headerText="Export Dashboard to PDF"
          descriptionText="Generate a PDF report of your dashboard data with current filters and settings applied."
          icon={<FileText className="w-full h-full text-foreground/10" />}
        >
          <div className="text-sm text-foreground/70 dark:text-foreground/50 mt-4">
            <p>The PDF export will include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Portfolio performance timeline</li>
            </ul>
          </div>
        </InstructionsModalListings>
      )}
    </div>
  )
}

export default Index
