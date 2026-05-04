/**
 * Dashboard Content Component
 * 
 * Purpose: Main content display for dashboard page
 * Used in: FilteringWrapper when noTableDisplay is true and route is /dashboard
 * Why: Provides custom dashboard content that receives filtered data
 * 
 * Self-contained: fetches a pre-aggregated summary from GET /api/dashboard
 * and derives all health cards, charts, and timeline from it.
 */

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { TableColumn } from '@/features/filtering-wrapper-multi-display/types'
import { FilterValue } from '@/features/filtering-wrapper-multi-display/types/filter-types'
import { getActiveColumns } from './utils/get-active-columns'
import { getAllActiveValues, type ActiveValue } from './utils/get-active-values'
import ScoreCardsContainer from './components/score-cards-container'
import NotificationItemsContainer from './components/notification-items-container'
import { HealthCardConfig } from './components/health-card'
import { NotificationCardConfig, RiskLevel } from './components/notification-card'
import RightSlider from '@/components/design/right-slider'
import PieChartContainer from './components/piechart/PieChartContainer'
import Timeline from './components/timeline/Timeline'
import BarChartContainer from './components/barchart/BarChartContainer-v1'
import { ChartData } from 'chart.js'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

import { useDashboard, type DashboardSummary } from '@/hooks'
import { capitalizeAllFirstLetters } from '@/lib/utils'

interface DashboardContentProps<T extends Record<string, any> = Record<string, any>> {
  data: T[]
  filteredData: T[]
  activeFilters: Record<string, FilterValue>
  columns: TableColumn<T>[]
}

export default function DashboardContent<T extends Record<string, any> = Record<string, any>>({ 
  data, 
  filteredData,
  activeFilters,
  columns
}: DashboardContentProps<T>) {

  //////////////////////////////////////////////////////////////////////////
  // Fetch pre-aggregated dashboard summary
  //////////////////////////////////////////////////////////////////////////
  const { getSummary } = useDashboard()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    getSummary().then((res) => {
      if (res) setSummary(res)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  //////////////////////////////////////////////////////////////////////////
  // Selected Filters Generate for drill-down display
  //////////////////////////////////////////////////////////////////////////
  const activeColumns = getActiveColumns({
    columns,
    activeFilters,
    hiddenColumns: ['date']
  })

  const activeValues = getAllActiveValues(
    activeColumns.map(col => ({ key: col.key, column: col.column })),
    activeFilters
  )

  //////////////////////////////////////////////////////////////////////////
  // Health Cards from summary
  //////////////////////////////////////////////////////////////////////////
  const healthCards = useMemo<HealthCardConfig[]>(() => {
    if (!summary) {
      // Return 12 loading cards when data is not ready
      return Array.from({ length: 12 }, () => ({
        title: '...',
        value: null,
      }))
    }
    return [
      { title: 'live projects', value: summary.liveProjects },
      { title: 'total portfolio arv', value: summary.totalPortfolioArv, prefix: '$' },
      { title: 'total mortgages', value: summary.totalMortgages, prefix: '$' },
      { title: 'total private investment', value: summary.totalPrivateInvestment, prefix: '$' },
      {
        title: 'total investment current value',
        value: summary.totalCurrentInvestment,
        prefix: '$',
        subtitle: 'Allocation amounts + accrued interest',
      },
      { title: 'total accrued interest', value: summary.totalAccruedInterest, prefix: '$' },
      {
        title: 'net equity position',
        value: summary.netEquity,
        prefix: '$',
        subtitle: 'Portfolio ARV - Mortgages - Current Investment Value',
      },
      { title: 'weighted average leverage %', value: summary.weightedLeverage, prefix: '%' },
      { title: 'total distributed to date', value: summary.totalDistributed, prefix: '$' },
      { title: 'note maturity velocity', value: summary.expiringIn90Days, subtitle: 'Notes maturing within 90 days' },
    ]
  }, [summary])

  //////////////////////////////////////////////////////////////////////////
  // Risk Notifications from summary
  //////////////////////////////////////////////////////////////////////////
  const riskNotifications = useMemo<NotificationCardConfig[]>(() => {
    if (!summary) {
      // Return 3 loading notification cards when data is not ready
      return Array.from({ length: 3 }, () => ({
        title: '',
        subtitle: '',
      }))
    }
    const notes: NotificationCardConfig[] = []

    if (summary.leverageExceedsThreshold) {
      notes.push({
        title: 'Over Leverage Warning',
        subtitle: `Portfolio leverage is ${summary.weightedLeverage}% — exceeds 70% threshold`,
        risk: 'high',
      })
    }
    if (summary.expiringIn90Days > 0) {
      notes.push({
        title: 'Expiration Reminder',
        subtitle: `${summary.expiringIn90Days} note${summary.expiringIn90Days > 1 ? 's' : ''} expiring within 90 days`,
        risk: summary.expiringIn90Days >= 3 ? 'medium' : 'low',
      })
    }
    return notes
  }, [summary])

  //////////////////////////////////////////////////////////////////////////
  // Expiration Notes for Timeline (from summary)
  //////////////////////////////////////////////////////////////////////////
  const expirations = useMemo(() => {
    if (!summary) return []
    return summary.timelineExpirations
  }, [summary])

  //////////////////////////////////////////////////////////////////////////
  // Pie Chart: Projects by Status (lifecycle phase)
  //////////////////////////////////////////////////////////////////////////
  const lifecyclePhaseData = useMemo<ChartData<'pie'>>(() => {
    if (!summary) return { labels: [], datasets: [{ data: [] }] }
    const labels = Object.keys(summary.projectsByStatus).map(capitalizeAllFirstLetters)
    const values = Object.values(summary.projectsByStatus)
    return {
      labels,
      datasets: [{
        label: 'Projects by Status',
        data: values,
        backgroundColor: [
          'rgba(150, 166, 207, 0.8)',
          'rgba(159, 165, 177, 0.8)',
          'rgba(37, 69, 71, 0.8)',
          'rgba(120, 102, 79, 1)',
          'rgba(93, 72, 107, 0.8)',
          'rgba(110, 125, 150, 0.8)',
        ].slice(0, labels.length),
        borderColor: [
          'rgba(37, 99, 235, 0.1)',
          'rgba(107, 114, 128, 0.1)',
          'rgba(80, 120, 200, 0.1)',
          'rgba(130, 150, 180, 0.1)',
          'rgba(100, 130, 170, 0.1)',
          'rgba(70, 100, 150, 0.1)',
        ].slice(0, labels.length),
        borderWidth: 1,
      }],
    }
  }, [summary])

  //////////////////////////////////////////////////////////////////////////
  // Pie Chart: Projects by Company
  //////////////////////////////////////////////////////////////////////////
  const companyData = useMemo<ChartData<'pie'>>(() => {
    if (!summary) return { labels: [], datasets: [{ data: [] }] }
    const labels = Object.keys(summary.projectsByCompany)
    const values = Object.values(summary.projectsByCompany)
    return {
      labels,
      datasets: [{
        label: 'Projects by Company',
        data: values,
        backgroundColor: [
          'rgba(150, 166, 207, 0.8)',
          'rgba(159, 165, 177, 0.8)',
          'rgba(37, 69, 71, 0.8)',
          'rgba(99, 102, 79, 0.8)',
          'rgba(93, 72, 107, 0.8)',
          'rgba(110, 125, 150, 0.8)',
        ].slice(0, labels.length),
        borderColor: [
          'rgba(37, 99, 235, 0.1)',
          'rgba(107, 114, 128, 0.1)',
          'rgba(80, 120, 200, 0.1)',
          'rgba(130, 150, 180, 0.1)',
          'rgba(100, 130, 170, 0.1)',
          'rgba(70, 100, 150, 0.1)',
        ].slice(0, labels.length),
        borderWidth: 1,
      }],
    }
  }, [summary])

  //////////////////////////////////////////////////////////////////////////
  // Bar Chart: Leverage vs Equity per project
  //////////////////////////////////////////////////////////////////////////
  const leverageEquityData = useMemo<ChartData<'bar'>>(() => {
    if (!summary) return { labels: [], datasets: [] }
    const items = summary.leverageEquity
    const labels = items.map((p) => {
      const addr = p.address || ''
      return addr.length > 25 ? addr.slice(0, 22) + '...' : addr
    })

    return {
      labels,
      datasets: [
        {
          label: 'Leverage',
          data: items.map((p) => p.leverage),
          backgroundColor: 'rgba(150, 166, 207, 0.8)',
          borderColor: 'rgba(37, 99, 235, 1)',
          hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
          hoverBorderColor: 'rgba(37, 99, 235, 1)',
        },
        {
          label: 'Equity',
          data: items.map((p) => p.equity),
          backgroundColor: 'rgba(159, 165, 177, 0.8)',
          borderColor: 'rgba(107, 114, 128, 1)',
          hoverBackgroundColor: 'rgba(107, 114, 128, 1)',
          hoverBorderColor: 'rgba(107, 114, 128, 1)',
        },
      ],
    }
  }, [summary])

  //////////////////////////////////////////////////////////////////////////
  // State for selected risk notification
  //////////////////////////////////////////////////////////////////////////
  const [selectedRisk, setSelectedRisk] = useState<NotificationCardConfig | null>(null)
  const [isSliderOpen, setIsSliderOpen] = useState(false)

  const handleNotificationClick = (config: NotificationCardConfig) => {
    setSelectedRisk(config)
    setIsSliderOpen(true)
  }

  // Risk Icon Configuration
  const riskIconConfig: Record<RiskLevel, { icon: React.ComponentType<{ size?: number; className?: string }>; className: string; size?: number }> = {
    high: { icon: AlertTriangle, className: 'text-red-600 dark:text-red-500', size: 18 },
    medium: { icon: AlertCircle, className: 'text-amber-600 dark:text-amber-500', size: 18 },
    low: { icon: Info, className: 'text-blue-500', size: 18 },
  }

  const getRiskHeaderClassName = (risk: NotificationCardConfig['risk'] | undefined): string => {
    if (!risk) return 'backdrop-blur-sm'
    switch (risk) {
      case 'high': return 'bg-red-700/100 dark:bg-red-900/50 backdrop-blur-sm'
      case 'medium': return 'bg-amber-500/40 dark:bg-amber-500/40 backdrop-blur-sm'
      case 'low': return 'bg-blue-900/100 dark:bg-blue-700/50 backdrop-blur-sm'
      default: return 'backdrop-blur-sm'
    }
  }

  const getRiskHeaderIcon = (risk: NotificationCardConfig['risk'] | undefined) => {
    if (!risk) return undefined
    return riskIconConfig[risk]
  }

  return (
    <div className="w-full border border-transparent min-h-full flex flex-col gap-8">
      {/* Row 1 */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 w-full">
        <div className="max-h-[600px] flex flex-col items-start justify-center col-span-1 md:col-span-2 xl:col-span-2 border border-transparent">
          Health
          <ScoreCardsContainer config={{ cards: healthCards }} />
        </div>

        <div className='relative flex flex-col items-start justify-start gap-1 lg:gap-2'>
          Risk Notifications
          <div className="h-full max-h-[600px] xl:max-h-[350px] w-full overflow-y-auto flex flex-col items-start justify-start col-span-1 md:col-span-1 xl:col-span-1 border border-transparent relative">
            <NotificationItemsContainer
              config={riskNotifications}
              onCardClick={handleNotificationClick}
              isLoading={!summary}
            />
          </div>

          {riskNotifications.length > 6 && (
            <>
              <div className='absolute lg:dark:hidden rounded-b-xl bottom-0 left-0 w-full h-[50px] bg-gradient-to-t md:from-[#f0f3fc] from-[#f2f2f3] dark:from-[#111416ce] lg:dark:via-[#0f1113] to-transparent'/>
              <div className='hidden lg:dark:block absolute rounded-b-xl -bottom-6 left-0 w-full h-[50px] bg-gradient-to-t from-transparent via-[#0f1113] to-transparent'/>
            </>
          )}
        </div>
      </div>

      {/* Row 2 */}
      <div className='flex flex-col items-start justify-start'>
        Portfolio Composition
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 w-full gap-1 md:gap-8">
          <div className="flex flex-row items-center justify-center col-span-2 md:col-span-1 xl:col-span-2">
            <div className='w-1/2 flex items-center justify-center h-[420px] md:h-[400px] 2xl:h-[400px]'>
              <PieChartContainer title="By Status" data={lifecyclePhaseData} />
            </div>
            <div className='w-1/2 flex items-center justify-center h-[400px] md:h-[400px] 2xl:h-[400px]'>
              <PieChartContainer title="By Company" data={companyData} />
            </div>
          </div>

          <div className="h-[300px] md:h-[400px] 2xl:h-[400px] flex items-center justify-center col-span-2 md:col-span-1 xl:col-span-2
          bg-[rgba(0,0,0,0.02)] border-[rgba(0,0,0,0.03)] rounded-lg
          dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.05)] mr-2">
            <BarChartContainer title="Leverage & Equity Heatmap" data={leverageEquityData} />
          </div>
        </div>
      </div>

      <div className='flex flex-col items-start justify-start'>
        Portfolio Performance
        <span className='text-sm text-muted-foreground'>Upcoming expirations and total capital due at each "spike"</span>
        <div className='overflow-x-auto w-full h-[300px] md:h-[400px] 2xl:h-[500px] flex items-center justify-start'>
          <Timeline className="" expirations={expirations} />
        </div>
      </div>

      {/* Right Slider for Risk Notification Details */}
      <RightSlider
        isOpen={isSliderOpen}
        onClose={() => { setIsSliderOpen(false); setSelectedRisk(null) }}
        header={selectedRisk?.title || 'Risk Notification'}
        subHeader={selectedRisk?.subtitle}
        headerClassName={getRiskHeaderClassName(selectedRisk?.risk)}
        headerIcon={getRiskHeaderIcon(selectedRisk?.risk)}
        closeOnOverlayClick={true}
      >
        <div className="p-4">
          {selectedRisk && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground/80 mb-2">Risk Level</h3>
                <p className="text-base font-medium text-foreground capitalize">{selectedRisk.risk}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground/80 mb-2">Description</h3>
                <p className="text-sm text-foreground/70">{selectedRisk.subtitle}</p>
              </div>
            </div>
          )}
        </div>
      </RightSlider>
    </div>
  )
}
