/**
 * Timeline View Configuration
 * 
 * Purpose: Configuration for timeline view of rental cars
 * Used in: demo-rsc-content.tsx
 * Why: Displays rental cars on a timeline (using mock dates for demo)
 * 
 * Note: Rental cars don't have date fields, so this is a demo configuration
 * In a real app, you would use actual date fields from your data
 */

import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'

/**
 * Timeline configuration for rental cars
 * Uses mock dates for demonstration purposes
 */
export const timelineConfig = {
  mappingKeys: {
    startDateKey: 'rentalStartDate', // Mock field - would need to be added to data
    endDateKey: 'rentalEndDate', // Mock field - would need to be added to data
    titleKey: 'model', // Display car model on timeline
    typeKey: 'status', // Use status for type/color coding
    statusKey: 'status', // Use status for styling
    uniqueIdKey: 'id',
  },
  views: ['Year', 'Month', 'Week', 'Day'], // All timeline views available
  groupByKey: 'status', // Group by car status
  isGroupInline: false, // Use sidebar grouping
  showUnifiedEventOnCollapse: true, // Show unified event when group collapsed
  onEventClick: (eventId: string) => {
    console.log('Timeline event clicked:', eventId)
    // In real app, this would open car details
  },
  onItemDrag: (item: { id: string; start_date: string; end_date: string }) => {
    console.log('Timeline item dragged:', item)
    // In real app, this would update rental dates
  },
  onItemResize: (item: { id: string; start_date: string; end_date: string }) => {
    console.log('Timeline item resized:', item)
    // In real app, this would update rental duration
  },
}
