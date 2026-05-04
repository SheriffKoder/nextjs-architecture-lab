'use client'

import PageHeader from '@/components/layout/page-header'
import React, { useEffect, useState, useRef } from 'react'
import InvestorsContent from './investors-content'
import ActionButtons from './components/action-buttons'
import { User } from '@/lib/types';
import { ScoreData } from './types';
import RightSlider from '@/components/design/right-slider'
import { InvestorTableItem } from './config/table-config'
import InvestorSliderDetailsContainer from './components/investor-slider-details-container'
import InvestorSliderEditContainer from './components/investor-slider-edit-container'
import InvestorSliderAddContainer from './components/investor-slider-add-container'
import AllocationEditSlider from './components/allocation-edit-slider'
import { Edit, Minimize2, Trash2, Undo, FileSpreadsheet } from 'lucide-react'
import { InvestorJourneyRow } from './components/details-slider/investor-journey-row'
import { useOrgs, useAllocations, useTransactions } from '@/hooks'
import type { Allocation } from '@/lib/types'
import type { Transaction } from '@/lib/types'
import { formatCurrency, formatDate } from '@/utils/formatters'

import type { InvestorJourneyItem } from './types'
import InstructionsModalListings from '@/components/design/InstructionsModalListings'

function buildInvestorJourney(
  selectedOrg: { created_at?: string; members?: Array<{ user?: { created_at?: string } }> } | null,
  allocations: Allocation[],
  transactions: Transaction[]
): InvestorJourneyItem[] {
  type JourneyRow = InvestorJourneyItem & { sortKey: string }
  const rows: JourneyRow[] = []

  const toYmd = (s: string | null | undefined) => {
    if (!s) return ''
    const d = new Date(s)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
  }

  const adminCreatedAt = selectedOrg?.members?.[0]?.user?.created_at ?? selectedOrg?.created_at
  if (adminCreatedAt) {
    rows.push({
      title: 'Account Created',
      description: 'Investor account was created and profile completed.',
      date: formatDate(adminCreatedAt) || toYmd(adminCreatedAt),
      sortKey: toYmd(adminCreatedAt),
      color: 'blue',
    })
  }

  allocations.forEach((a) => {
    const projectLabel = a.project?.address ?? `project`
    rows.push({
      title: 'Investment',
      description: `Investment of ${formatCurrency(a.allocation_amount)} in ${projectLabel}.`,
      date: formatDate(a.created_at) || toYmd(a.created_at),
      sortKey: toYmd(a.created_at),
      color: 'green',
    })
  })

  transactions.forEach((t) => {
    const fromLabel = t.from_company?.name ?? 'Company'
    rows.push({
      title: 'Distribution Received',
      description: `Distribution of ${formatCurrency(t.amount)} from ${fromLabel}.`,
      date: formatDate(t.created_at) || toYmd(t.created_at),
      sortKey: toYmd(t.created_at),
      color: 'green',
    })
  })

  rows.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  return rows.map(({ sortKey, ...rest }) => rest)
}

const Index = () => {
  const orgsHook = useOrgs()
  const allocationsHook = useAllocations()
  const transactionsHook = useTransactions()
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorTableItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isJourneyPanelOpen, setIsJourneyPanelOpen] = useState(false);


  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExportCSVModal, setShowExportCSVModal] = useState(false);

  const [data, setData] = useState<InvestorTableItem[]>([]);
  const [investorOrgs, setInvestorOrgs] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [isAllocationEditOpen, setIsAllocationEditOpen] = useState(false);

  // Load investor orgs with calculated fields
  useEffect(() => {
    let isMounted = true;

    const loadInvestors = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Get all investor orgs with admin members, totalInvested, and projectsCount included
        const orgsResponse = await orgsHook.getAll({ 
          org_type: 'investor', 
          includeAdmins: true,
          totalInvested: true,
          projectsCount: true,
          limit: 1000 
        })

        if (!isMounted) return;

        if (orgsResponse) {
          const orgs = orgsResponse.data
          setInvestorOrgs(orgs)

          const transformedData: InvestorTableItem[] = orgs.map((org: any) => {
            const adminUsers = (org.members || [])
              .map((member: any) => member.user)
              .filter(Boolean)
            const representativeUser = adminUsers[0] || {
              id: '',
              email: null,
              name: org.name,
              created_at: org.created_at,
              updated_at: org.updated_at,
            }
            return {
              ...representativeUser,
              org_id: org.id,
              totalInvested: org.totalInvested || 0,
              projectsCount: org.projectsCount || 0,
            }
          })

          setData(transformedData)
        }
        setIsLoading(false)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load investors')
          console.error('Error loading investors:', err)
          setIsLoading(false)
        }
      }
    }

    loadInvestors()

    return () => {
      isMounted = false;
    }
  }, [])

  const investorJourneyData = React.useMemo(
    () => buildInvestorJourney(selectedOrg, allocations, transactions),
    [selectedOrg, allocations, transactions]
  )

  const scoreData: ScoreData[] = [
    {
      title: 'Total Investors',
      description: 'Total number of active investors',
      value: data.length,
      prefix: null,
    },
    {
      title: 'Total Invested',
      description: 'Total amount invested across all investors',
      value: data.reduce((sum, investor) => sum + (investor.totalInvested || 0), 0),
      prefix: '$',
    },
    {
      title: 'Total Projects',
      description: 'Total number of projects across all investors',
      value: data.reduce((sum, investor) => sum + (investor.projectsCount || 0), 0),
      prefix: null,
    },
  ]

  const handleExportCSV = () => {
    setShowExportCSVModal(true)
  }

  const handleAddInvestor = () => {
    setSelectedInvestor(null)
    setIsEditMode(false)
    setIsCreateMode(true)
    setIsPanelOpen(true)
  }

  const handleRowClick = (investor: InvestorTableItem) => {
    setSelectedInvestor(investor)
    setIsCreateMode(false)
    const org = investor.org_id
      ? investorOrgs.find((o: any) => o.id === investor.org_id) ?? null
      : null
    setSelectedOrg(org)
    setAllocations([])
    setTransactions([])
    setIsPanelOpen(true)
  }

  useEffect(() => {
    if (!selectedOrg?.id) return
    setAllocationsLoading(true)
    Promise.all([
      allocationsHook.getAll({ investorOrgIds: [selectedOrg.id], limit: 1000 }),
      transactionsHook.getAll({ to_org_id: selectedOrg.id, limit: 100 }),
    ]).then(([allocRes, txRes]) => {
      setAllocations(allocRes?.data ?? [])
      setTransactions(txRes?.data ?? [])
    }).finally(() => setAllocationsLoading(false))
  }, [selectedOrg?.id])

  const handleAllocationClick = (allocation: Allocation) => {
    setSelectedAllocation(allocation)
    setIsAllocationEditOpen(true)
  }

  const handleFilterApply = (key: string, items: string[], type: string) => {
    console.log('Filter Apply - Key:', key)
    console.log('Filter Apply - Items:', items)
    console.log('Filter Apply - Type:', type)
  }



  return (
    <div className='flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative'>
         {/* Header */}
         <header className='absolute top-0 left-0 w-full lg:w-[calc(100%)] flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0
         bg-background/20 backdrop-blur-sm z-[50]'>
            <PageHeader />
            <ActionButtons onExportCSV={handleExportCSV} onAddInvestor={handleAddInvestor} />
        </header>

        
        <div className='flex-1 overflow-y-auto flex pb-2 min-w-0 pt-[100px] lg:pt-[100px] w-full'>
        {/* Main content */}
            <div className='h-full w-full pr-2 pt-2 min-w-0'>
              <InvestorsContent 
              data={data} 
              scoreData={scoreData} 
              loading={isLoading} 
              handleRowClick={handleRowClick}
              onFilterApply={handleFilterApply}
              />
            </div>
        </div>

        <RightSlider
        isOpen={isPanelOpen}
        onClose={() => { setIsPanelOpen(false); setIsJourneyPanelOpen(false); setIsEditMode(false); setIsCreateMode(false); setIsDeleteMode(false); setSelectedOrg(null); setIsAllocationEditOpen(false); setSelectedAllocation(null); }}
        header={isCreateMode ? "Add Investor" : isEditMode ? "Edit Investor" : "Investor Details"}
        subHeader={isCreateMode ? "New Investor" : selectedInvestor ? selectedInvestor.name : "Sub Header"}
        expandToFullScreen={isJourneyPanelOpen}
        headerActions={isCreateMode ? undefined : selectedInvestor ? [
          // if panel open show collapse icon
          ...(isJourneyPanelOpen ? [{
            icon: Minimize2,
            onClick: () => {
              setIsJourneyPanelOpen(false)
            },
            ariaLabel: 'Collapse journey view'
          }] : []),
          // Show Edit icon when not in edit mode, Undo icon when in edit mode
          ...(isEditMode ? [{
            icon: Undo,
            onClick: () => {
              setIsEditMode(false)
              console.log('Cancel edit mode')
            },
            ariaLabel: 'Cancel edit',
            title: 'Cancel edit'
          }] : [{
            icon: Edit,
            onClick: () => {
              setIsEditMode(true)
              console.log('Edit investor:', selectedInvestor.id)
            },
            ariaLabel: 'Edit investor',
            title: 'Edit investor'
          }]),
          {
            icon: Trash2,
            onClick: () => {
              setIsDeleteMode(true)
              console.log('Delete investor:', selectedInvestor.id)
            },
            ariaLabel: 'Delete investor',
            title: 'Delete investor'
          }
        ] : undefined}
        >
          {isCreateMode ? (
            <InvestorSliderAddContainer
              onSuccess={() => {
                setIsPanelOpen(false)
                setIsCreateMode(false)
                // Reload investors data
                orgsHook.getAll({ org_type: 'investor', includeAdmins: true, totalInvested: true, projectsCount: true, limit: 1000 }).then((res) => {
                  if (res) {
                    setInvestorOrgs(res.data)
                    const transformedData: InvestorTableItem[] = res.data.map((org: any) => {
                      const adminUsers = (org.members || []).map((m: any) => m.user).filter(Boolean)
                      const representativeUser = adminUsers[0] || { id: '', email: null, name: org.name, created_at: org.created_at, updated_at: org.updated_at }
                      return { ...representativeUser, org_id: org.id, totalInvested: org.totalInvested || 0, projectsCount: org.projectsCount || 0 }
                    })
                    setData(transformedData)
                  }
                })
              }}
              onCancel={() => { setIsPanelOpen(false); setIsCreateMode(false) }}
            />
          ) : isEditMode ? (
            <InvestorSliderEditContainer
              selectedInvestor={selectedInvestor}
              selectedOrg={selectedOrg}
              onSuccess={() => {
                setIsPanelOpen(false)
                setIsEditMode(false)
                orgsHook.getAll({ org_type: 'investor', includeAdmins: true, totalInvested: true, projectsCount: true, limit: 1000 }).then((res) => {
                  if (res) {
                    setInvestorOrgs(res.data)
                    const transformedData: InvestorTableItem[] = res.data.map((org: any) => {
                      const adminUsers = (org.members || []).map((m: any) => m.user).filter(Boolean)
                      const representativeUser = adminUsers[0] || { id: '', email: null, name: org.name, created_at: org.created_at, updated_at: org.updated_at }
                      return { ...representativeUser, org_id: org.id, totalInvested: org.totalInvested || 0, projectsCount: org.projectsCount || 0 }
                    })
                    setData(transformedData)
                  }
                })
              }}
            />
          ) : (
            <div className={`w-full flex flex-row ${isJourneyPanelOpen ? 'h-[calc(100vh-110px)] w-full' : 'h-full'}`}>
              <div className={`${isJourneyPanelOpen ? 'max-w-[400px] w-full h-[calc(100vh-110px)] overflow-y-auto sticky top-0 pr-2' : 'w-full'}`}>
                <InvestorSliderDetailsContainer 
                  selectedInvestor={selectedInvestor} 
                  selectedOrg={selectedOrg}
                  allocations={allocations}
                  allocationsLoading={allocationsLoading}
                  investorJourneyData={investorJourneyData}
                  isJourneyPanelOpen={isJourneyPanelOpen}
                  setIsJourneyPanelOpen={setIsJourneyPanelOpen}
                  onAllocationClick={handleAllocationClick}
                />
              </div>
              {isJourneyPanelOpen && investorJourneyData.length > 0 && (
                <div className="p-3 space-y-0 h-[calc(100vh-110px)] overflow-y-auto hidden lg:block w-full">
                  {investorJourneyData.map((item, index) => (
                    <InvestorJourneyRow key={index} item={item} variant="md" />
                  ))}
                </div>
              )}
            </div>
            
          )}
      </RightSlider>

      {/* Allocation Edit Slider - overlays on top of the main slider */}
      <RightSlider
        isOpen={isAllocationEditOpen}
        onClose={() => { setIsAllocationEditOpen(false); setSelectedAllocation(null); }}
        header="Edit Allocation"
        subHeader={selectedAllocation?.project?.address ?? 'Allocation'}
        width="w-[400px]"
        zIndex={110}
      >
        {selectedAllocation && (
          <AllocationEditSlider
            allocation={selectedAllocation}
            onSuccess={() => {
              setIsAllocationEditOpen(false)
              setSelectedAllocation(null)
              if (selectedOrg?.id) {
                allocationsHook.getAll({ investorOrgIds: [selectedOrg.id], limit: 1000 }).then((res) => {
                  setAllocations(res?.data ?? [])
                })
              }
            }}
            onCancel={() => { setIsAllocationEditOpen(false); setSelectedAllocation(null); }}
          />
        )}
      </RightSlider>

      {/* Export CSV Instructions Modal */}
      {showExportCSVModal && (
      <InstructionsModalListings
        height='h-screen lg:h-fit'
        showInstructionsModal={showExportCSVModal}
        setShowInstructionsModal={setShowExportCSVModal}
        headerText="Export Investors to CSV"
        descriptionText="Generate a CSV file containing all investor data"
        icon={<FileSpreadsheet className="w-full h-full text-foreground/10" />}
      >
        <div className="text-sm text-foreground/70 dark:text-foreground/50 mt-4">
          <p>The CSV export will include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>All investor details</li>
          </ul>
          </div>
        </InstructionsModalListings>
      )}
    </div>
  )
}

export default Index
