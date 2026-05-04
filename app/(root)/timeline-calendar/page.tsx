'use client'

import React, { useMemo } from 'react'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display/filtering-wrapper'
import type { TableColumn, FilterConfig, TableConfig } from '@/features/filtering-wrapper-multi-display/types'
import PageHeader from '@/components/layout/page-header'
import { GroupConfig } from '@/features/filtering-wrapper-multi-display/features/virtualized-list/utils/grouping-utils'

/**
 * Timeline & Calendar Demo Page
 * 
 * Purpose: Demonstrates FilteringWrapper with timeline and calendar views
 * Features:
 * - Mock data with dates relative to today
 * - Timeline view with Year/Month/Week/Day scales
 * - Calendar view for date-based visualization
 * - Table view as fallback
 */

//////////////////////////////////
// Type Definitions
//////////////////////////////////

interface ProjectItem {
  id: string
  title: string
  type: string
  status: 'To Do' | 'In Progress' | 'Done'
  created_at: string
  due_date: string
  project_id: string
  description?: string
}

//////////////////////////////////
// Mock Data Generator
//////////////////////////////////

/**
 * Generate mock data with dates relative to today
 */
function generateMockData(): ProjectItem[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize to start of day
  
  const projects: ProjectItem[] = []
  
  // Helper to format date as ISO string
  const formatDate = (date: Date): string => {
    return date.toISOString()
  }
  
  // Helper to add days
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
  
  // Helper to add months
  const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }
  
  // Project 1: Started 2 weeks ago, due in 2 weeks (current sprint)
  const project1Start = addDays(today, -14)
  const project1End = addDays(today, 14)
  projects.push({
    id: 'project-1',
    title: 'Current Sprint - Feature Development',
    type: 'Development',
    status: 'In Progress',
    created_at: formatDate(project1Start),
    due_date: formatDate(project1End),
    project_id: 'sprint-current',
    description: 'Active development sprint focusing on core features'
  })
  
  // Project 2: Started yesterday, due in 5 days (short-term task)
  const project2Start = addDays(today, -1)
  const project2End = addDays(today, 5)
  projects.push({
    id: 'project-2',
    title: 'Quick Fix - Bug Resolution',
    type: 'Maintenance',
    status: 'In Progress',
    created_at: formatDate(project2Start),
    due_date: formatDate(project2End),
    project_id: 'task-quick-fix',
    description: 'Urgent bug fix for production issue'
  })
  
  // Project 3: Starts in 3 days, due in 2 weeks (upcoming)
  const project3Start = addDays(today, 3)
  const project3End = addDays(today, 17)
  projects.push({
    id: 'project-3',
    title: 'Upcoming Feature - User Dashboard',
    type: 'Development',
    status: 'To Do',
    created_at: formatDate(project3Start),
    due_date: formatDate(project3End),
    project_id: 'feature-dashboard',
    description: 'New user dashboard with analytics'
  })
  
  // Project 4: Started 1 month ago, due in 1 month (long-term)
  const project4Start = addMonths(today, -1)
  const project4End = addMonths(today, 1)
  projects.push({
    id: 'project-4',
    title: 'Long-term Project - Platform Migration',
    type: 'Infrastructure',
    status: 'In Progress',
    created_at: formatDate(project4Start),
    due_date: formatDate(project4End),
    project_id: 'migration-platform',
    description: 'Multi-month platform migration project'
  })
  
  // Project 5: Completed last week (past project)
  const project5Start = addDays(today, -21)
  const project5End = addDays(today, -7)
  projects.push({
    id: 'project-5',
    title: 'Completed - API Integration',
    type: 'Development',
    status: 'Done',
    created_at: formatDate(project5Start),
    due_date: formatDate(project5End),
    project_id: 'api-integration',
    description: 'Third-party API integration completed'
  })
  
  // Project 6: Starts in 1 month, due in 2 months (future)
  const project6Start = addMonths(today, 1)
  const project6End = addMonths(today, 2)
  projects.push({
    id: 'project-6',
    title: 'Future Project - Mobile App',
    type: 'Development',
    status: 'To Do',
    created_at: formatDate(project6Start),
    due_date: formatDate(project6End),
    project_id: 'mobile-app',
    description: 'New mobile application development'
  })
  
  // Project 7: Today's task (starts and ends today)
  const project7Start = new Date(today)
  project7Start.setHours(9, 0, 0, 0) // 9 AM
  const project7End = new Date(today)
  project7End.setHours(17, 0, 0, 0) // 5 PM
  projects.push({
    id: 'project-7',
    title: "Today's Meeting - Team Sync",
    type: 'Meeting',
    status: 'In Progress',
    created_at: formatDate(project7Start),
    due_date: formatDate(project7End),
    project_id: 'meeting-sync',
    description: 'Daily team synchronization meeting'
  })
  
  // Project 8: Multi-day event spanning this week
  const project8Start = addDays(today, -2)
  const project8End = addDays(today, 5)
  projects.push({
    id: 'project-8',
    title: 'Week-long Workshop - Training Session',
    type: 'Training',
    status: 'In Progress',
    created_at: formatDate(project8Start),
    due_date: formatDate(project8End),
    project_id: 'workshop-training',
    description: 'Team training workshop spanning multiple days'
  })
  
  return projects
}

//////////////////////////////////
// Table Columns Configuration
//////////////////////////////////

const tableColumns: TableColumn<ProjectItem>[] = [
  {
    key: 'title',
    name: 'Title',
    sortable: true,
    isSearchable: true,
  },
  {
    key: 'type',
    name: 'Type',
    sortable: true,
    filterable: true,
  },
  {
    key: 'status',
    name: 'Status',
    sortable: true,
    filterable: true,
  },
  {
    key: 'created_at',
    name: 'Start Date',
    sortable: true,
    filterable: true,
    isDateField: true,
    formatter: (value: string) => {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  },
  {
    key: 'due_date',
    name: 'End Date',
    sortable: true,
    filterable: true,
    isDateField: true,
    formatter: (value: string) => {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  },
]

//////////////////////////////////
// Filter Configuration
//////////////////////////////////

const filterConfig: FilterConfig<ProjectItem> = {
  showPill: true,
  showIndependentDateFilter: false,
  autoApplyDropdown: true,
  showBadgesDropdown: true,
  searchPlaceholder: "Search by title, type, status...",
  hideTopLevelSearch: true,
}

//////////////////////////////////
// Table Configuration
//////////////////////////////////

const tableConfig: TableConfig<ProjectItem> = {
  actionMode: 'inline',
  groupBy: 'status',
  subGroupBy: 'type',
  // groupKeyFormatter: (value) => value ? `Status: ${value}` : 'No Status',
  // subGroupKeyFormatter: (value) => value ? `Type: ${value}` : 'No Type',
  groupSpacing: 30, // 16px spacing between groups
}

//////////////////////////////////
// Main Page Component
//////////////////////////////////

export default function TimelineCalendarPage() {
  // Generate mock data with dates relative to today
  const mockData = useMemo(() => generateMockData(), [])
  
  // Timeline configuration
  const timelineConfig = useMemo(() => ({
    mappingKeys: {
      startDateKey: 'created_at',
      endDateKey: 'due_date',
      titleKey: 'title',
      typeKey: 'type',
      statusKey: 'status',
      uniqueIdKey: 'id'
    },
    views: ['Year', 'Month', 'Week', 'Day'],
    groupByKey: 'status', // NEW: Group by project
    isGroupInline: false, // NEW: Use sidebar grouping (set to true for inline headers)
    onEventClick: (eventId: string) => {
      console.log('Timeline event clicked:', eventId)
      const project = mockData.find(p => p.id === eventId)
      if (project) {
        alert(`Project: ${project.title}\nStatus: ${project.status}\nType: ${project.type}`)
      }
    },
    onItemDrag: (item: { id: string; start_date: string; end_date: string }) => {
      console.log('Timeline item dragged:', item)
      // In a real app, you would update the project dates here
    },
    onItemResize: (item: { id: string; start_date: string; end_date: string }) => {
      console.log('Timeline item resized:', item)
      // In a real app, you would update the project duration here
    }
  }), [mockData])
  
  // Calendar configuration
  const calendarConfig = useMemo(() => ({
    startDateKey: 'created_at',
    endDateKey: 'due_date',
    nameKey: 'title',
    onProjectClick: (project: ProjectItem) => {
      console.log('Calendar project clicked:', project)
      alert(`Project: ${project.title}\nStatus: ${project.status}\nType: ${project.type}`)
    },
    // Optional: Limit calendar date range
    // limitStartDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    // limitEndDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
  }), [])

    /**
   * List view configuration for grouped table view
   * Groups projects by category, then by status
   */
    const listViewConfig: GroupConfig = useMemo(() => ({
      groupBy: 'status',
      // subGroupBy: 'type',
      // groupKeyFormatter: (value) => value ? `Status: ${value}` : 'No Status',
      // subGroupKeyFormatter: (value) => value ? `Status: ${value}` : 'No Status',
      groupSpacing: 30, // 16px spacing between groups
    }), [])
  
  return (
    <div className="w-full h-full flex flex-col">
      <PageHeader 
        subTitle="View projects in timeline or calendar format with dates relative to today"
      />
      
      <div className="flex-1 min-w-0 overflow-hidden p-4">
        <FilteringWrapper
          data={mockData}
          columns={tableColumns}
          availableViews={['table', 'timeline', 'calendar', 'list', 'subheadings']}
          timelineConfig={timelineConfig}
          calendarConfig={calendarConfig}
          listViewConfig={listViewConfig}
          filterConfig={filterConfig}
          tableConfig={tableConfig}
          onRowClick={(row) => {
            console.log('Row clicked:', row)
          }}
          minimalControlsConfig={
            {
              availableColumns: ['title', 'type', 'status', 'created_at', 'due_date']
            }
          }

        />
      </div>
    </div>
  )
}
