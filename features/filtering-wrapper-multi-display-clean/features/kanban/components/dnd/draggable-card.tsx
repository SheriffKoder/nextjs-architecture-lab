/**
 * Draggable Card Component
 * 
 * Purpose: Wraps card content and makes it draggable
 * Used in: components/kanban-grid.tsx
 * Why: Handles drag functionality and visual feedback for cards
 * 
 * Function Index:
 * - DraggableCard: Wraps card with draggable functionality
 * 
 * Visual States:
 * - Normal: Regular card appearance
 * - Dragging: Shows dashed border ghost at original position
 * - Ghost: Full card-sized empty space with dashed border
 * 
 * Steps:
 * 1. Accept card data and template
 * 2. Setup useDraggable hook
 * 3. Render card with drag handlers
 * 4. Show ghost effect when dragging
 */

'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import DefaultCard from '../ui/default-card'

//////////////////////////////////
// Component Props
//////////////////////////////////

interface DraggableCardProps {
  data: any
  cardKey: string
  cardTitle?: string
  cardContent?: string
  dateKey?: string
  isDragging?: boolean
  isGhost?: boolean
  isCardLoading?: boolean
  cardTemplate?: React.ComponentType<{ data: any; onAction?: (action: string) => void }>
  onCardAction?: (action: string, data: any) => void
  onClick?: () => void
}

//////////////////////////////////
// Draggable Card Component
//////////////////////////////////

/**
 * Makes a card draggable with visual feedback
 * Shows ghost (dashed border) when dragging
 * 
 * @param data - Card data object
 * @param cardKey - Property name for unique ID
 * @param cardTitle - Label for card header
 * @param cardContent - Property name for main content
 * @param dateKey - Property name for date field
 * @param isDragging - Whether this card is currently being dragged
 * @param isGhost - Whether to show as ghost (dashed border placeholder)
 * @param cardTemplate - Custom card template component
 * @param onCardAction - Action handler callback
 * @param onClick - Click handler for debugging
 */
const DraggableCard: React.FC<DraggableCardProps> = ({
  data,
  cardKey,
  cardTitle,
  cardContent,
  dateKey,
  isDragging = false,
  isGhost = false,
  isCardLoading = false,
  cardTemplate: CardTemplate,
  onCardAction,
  onClick
}) => {
  //////////////////////////////////
  // Get unique ID for dragging
  //////////////////////////////////
  
  const itemId = String(data[cardKey])
  
  //////////////////////////////////
  // Setup draggable functionality
  //////////////////////////////////
  
  /**
   * WHY: useDraggable makes the card draggable
   * HOW: Provides drag handlers, ref, and transform data
   * IMPACT: Enables smooth drag and drop interaction
   */
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingFromHook
  } = useDraggable({
    id: itemId,
    data: {
      type: 'card',
      cardData: data,
      cardKey
    }
  })
  
  // Use prop or hook value for dragging state
  const isCurrentlyDragging = isDragging || isDraggingFromHook
  
  //////////////////////////////////
  // Handle card click for debugging
  //////////////////////////////////
  
  const handleClick = () => {
    console.log('🎴 CARD CLICKED:', itemId, data)
    onClick?.()
  }
  
  //////////////////////////////////
  // Handle card action
  //////////////////////////////////
  
  const handleAction = (action: string) => {
    onCardAction?.(action, data)
  }
  
  //////////////////////////////////
  // Apply transform style (during drag)
  //////////////////////////////////
  
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined
  
  //////////////////////////////////
  // Render ghost (dashed border placeholder)
  //////////////////////////////////
  
  if (isGhost || isCurrentlyDragging) {
    return (
      <div
        ref={setNodeRef}
        className='w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50'
        style={{
          minHeight: '100px',
          opacity: 0.5
        }}
        onClick={handleClick}
      >
        {/* Empty ghost placeholder */}
      </div>
    )
  }
  
  //////////////////////////////////
  // Render draggable card
  //////////////////////////////////
  
  return (
    <div
      ref={setNodeRef}
      className={`w-full cursor-grab active:cursor-grabbing relative ${
        isCurrentlyDragging ? 'opacity-50' : ''
      }`}
      style={style}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      {/* Render custom template or default card */}
      {CardTemplate ? (
        <CardTemplate data={data} onAction={handleAction} />
      ) : (
        <DefaultCard
          data={data}
          cardKey={cardKey}
          cardTitle={cardTitle}
          cardContent={cardContent}
          dateKey={dateKey}
          onAction={handleAction}
        />
      )}
      {/* Loading overlay when card is updating (e.g. status change) */}
      {isCardLoading && (
        <div
          className="absolute inset-0 rounded-lg bg-background/80 flex items-center justify-center z-10"
          aria-busy="true"
        >
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}

export default DraggableCard

