/**
 * Calendar View Configuration
 * 
 * Purpose: Configuration for calendar view of rental cars
 * Used in: demo-rsc-content.tsx
 * Why: Displays rental cars on a calendar (using mock dates for demo)
 * 
 * Note: Rental cars don't have date fields, so this is a demo configuration
 * In a real app, you would use actual date fields from your data
 */

import type { RentalCarTableItem } from '../../types/rental-car-table-item'

/**
 * Calendar configuration for rental cars
 * Uses mock dates for demonstration purposes
 */
export const calendarConfig = {
  startDateKey: 'rentalStartDate', // Mock field - would need to be added to data
  endDateKey: 'rentalEndDate', // Mock field - would need to be added to data
  nameKey: 'model', // Display car model on calendar
  onProjectClick: (car: RentalCarTableItem) => {
    console.log('Calendar car clicked:', car)
    // In real app, this would open car details
  },
  limitStartDate: undefined, // No date limits for demo
  limitEndDate: undefined,
}
