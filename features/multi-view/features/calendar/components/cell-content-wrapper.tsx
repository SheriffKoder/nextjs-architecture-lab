/**
 * Cell Content Wrapper Component
 * 
 * Purpose: Wrapper component for calendar cell content with day number display
 * Used in: app/development/calendar/components/cell-content-wrapper.tsx
 * Why: Reusable component for consistent cell content styling and layout
 * 
 * Function Index:
 * CellContentWrapper: Main component that wraps cell content with day number
 * 
 * Steps:
 * 1. Accept dayNumber and children props
 * 2. Display day number in red circle at top right
 * 3. Render children content in the main cell area
 * 4. Handle empty/disabled cells appropriately
 */

'use client'

interface CellContentWrapperProps {
  dayNumber: number | null
  children?: React.ReactNode
  isCurrentMonth?: boolean
  isToday?: boolean
}

const CellContentWrapper = ({ 
  dayNumber, 
  children, 
  isCurrentMonth = true, 
  isToday = false 
}: CellContentWrapperProps) => {
  return (
    <div className="w-full h-full relative">
      {/* Main Cell Content */}
      <div className="w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export default CellContentWrapper
