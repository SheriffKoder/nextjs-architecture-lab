/**
 * Kanban Development Page
 * 
 * Purpose: Demo page for Kanban component with sample data
 * Used in: app/development/kanban route
 * Why: Demonstrates Kanban functionality with controlled state
 * 
 * Features:
 * - Sample task data with multiple statuses
 * - Controlled state management
 * - onChange handler for data updates
 * - onCardAction handler for card interactions
 * - Passes all configuration to KanbanWrapper
 * 
 * Steps:
 * 1. Generate sample data with dates
 * 2. Setup controlled state with useState
 * 3. Handle data changes from Kanban
 * 4. Handle card actions
 * 5. Pass all props to KanbanWrapper
 */

'use client'

import React, { useState } from 'react'
import KanbanWrapper from './kanban-wrapper'
import CustomCardTemplate from './components/ui/custom-card-template'
import CustomHeaderTemplate from './components/ui/custom-header-template'
import {
  getDevelopmentKanbanColumns,
  getDevelopmentKanbanStatusColumns,
  getDevelopmentSortableColumns
} from './development-config'

//////////////////////////////////
// Static Kanban Configurations
//////////////////////////////////

/**
 * Static Kanban configurations - computed once at module load
 * These don't depend on props or state, so they can be outside the component
 */
const kanbanColumns = getDevelopmentKanbanColumns()
const kanbanStatusColumns = getDevelopmentKanbanStatusColumns()
const sortableColumns = getDevelopmentSortableColumns()

const KanbanPageWrapper = () => {
  //////////////////////////////////
  // Sample data generation
  //////////////////////////////////
  
  // Calculate dates: today and ±4 days for variety
  const today = new Date()
  const fourDaysAgo = new Date(today)
  fourDaysAgo.setDate(today.getDate() - 4)
  
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(today.getDate() - 2)
  
  const twoDaysAhead = new Date(today)
  twoDaysAhead.setDate(today.getDate() + 2)
  
  const fourDaysAhead = new Date(today)
  fourDaysAhead.setDate(today.getDate() + 4)

  // Initial sample data with more items for testing
  const initialData = [
    {
      id: '1',
      status: 'todo',
      summary: 'Implement user authentication flow',
      created_at: fourDaysAgo.toISOString(),
      priority: 'high'
    },
    {
      id: '2',
      status: 'in-progress',
      summary: 'Design database schema for tasks',
      created_at: twoDaysAgo.toISOString(),
      priority: 'medium'
    },
    {
      id: '3',
      status: 'review',
      summary: 'Review API endpoint security',
      created_at: twoDaysAhead.toISOString(),
      priority: 'high'
    },
    {
      id: '4',
      status: 'done',
      summary: 'Complete project documentation',
      created_at: fourDaysAhead.toISOString(),
      priority: 'low'
    },
    {
      id: '5',
      status: 'todo',
      summary: 'Setup CI/CD pipeline',
      created_at: today.toISOString(),
      priority: 'medium'
    },
    {
      id: '6',
      status: 'in-progress',
      summary: 'Refactor Redux store structure',
      created_at: twoDaysAgo.toISOString(),
      priority: 'low'
    }
  ]

  //////////////////////////////////
  // Controlled state
  //////////////////////////////////
  
  /**
   * WHY: useState manages Kanban data in parent component
   * HOW: Kanban is controlled - parent owns data state
   * IMPACT: Parent can track changes and sync with backend/store
   */
  const [kanbanData, setKanbanData] = useState(initialData)

  //////////////////////////////////
  // Handle data updates
  //////////////////////////////////
  
  /**
   * Called when Kanban data is updated (drag/drop, add item, etc.)
   * 
   * @param updatedData - New data after operation
   */
  const handleUpdate = (updatedData: any[]) => {
    console.log('📊 Page: Data updated', updatedData)
    
    // Update local state
    setKanbanData(updatedData)
    
    // In a real app, you would sync with backend here
    // await updateKanbanData(updatedData)
  }

  //////////////////////////////////
  // Handle card actions
  //////////////////////////////////
  
  /**
   * Called when user interacts with a card
   * 
   * @param action - Action type (e.g., 'edit', 'delete', 'click')
   * @param data - Card data
   */
  const handleCardActions = (action: string, data: any) => {
    console.log(`🎴 Page: Card action - ${action}`, data)
    
    // Handle different actions
    switch (action) {
      case 'edit':
        console.log('Edit card:', data)
        // Open edit modal, navigate to edit page, etc.
        break
      case 'delete':
        console.log('Delete card:', data)
        // Show confirmation dialog, then delete
        // const newData = kanbanData.filter(item => item.id !== data.id)
        // handleUpdate(newData)
        break
      case 'click':
        console.log('Card clicked:', data)
        // Navigate to detail page, open modal, etc.
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  //////////////////////////////////
  // Render
  //////////////////////////////////

  return (
    <KanbanWrapper
      initialData={kanbanData}
      filteredData={kanbanData}
      onUpdate={handleUpdate}
      handleCardActions={handleCardActions}
      columnKey="status"
      cardKey="id"
      cardTitle="Task"
      cardContent="summary"
      dateKey="created_at"
      minCards={4}
      hideEmptyColumns={false}
      manualSorting={false}
      columns={kanbanStatusColumns}
      sortableColumns={sortableColumns}
      // Optionally pass custom templates
      // cardTemplate={CustomCardTemplate}
      // columnHeaderTemplate={CustomHeaderTemplate}
    />
  )
}

export default KanbanPageWrapper

