/**
 * Map View Configuration
 * 
 * Purpose: Configuration for map view of rental cars
 * Used in: demo-rsc-content.tsx
 * Why: Displays rental cars on a map (using mock coordinates for demo)
 * 
 * Note: Rental cars have location but not coordinates, so this uses mock data
 * In a real app, you would use actual latitude/longitude from your data
 */

import type { RentalCarTableItem } from '@/entities/cars-rsc/types/rental-car-table-item'

/**
 * Map configuration for rental cars
 * Uses mock coordinates for demonstration purposes
 */
export const mapConfig = {
  onItemClick: (car: RentalCarTableItem) => {
    console.log('Map car clicked:', car)
    // In real app, this would open car details
  },
  center: { lat: 40.7128, lng: -74.0060 }, // New York City (default center)
  containerStyle: { width: '100%', height: '100%' },
  zoom: 10,
  // Field mappings - using coordinates from data if available, otherwise fallback
  fieldMappings: {
    id: 'id',
    title: (item: RentalCarTableItem) => `${item.make} ${item.model}`,
    latitude: (item: RentalCarTableItem) => {
      // Use coordinates from data if available, otherwise calculate from location
      if (item.latitude !== undefined) {
        return item.latitude
      }
      // Fallback: Mock latitude based on location hash
      const hash = item.location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return 40.7 + (hash % 100) / 1000
    },
    longitude: (item: RentalCarTableItem) => {
      // Use coordinates from data if available, otherwise calculate from location
      if (item.longitude !== undefined) {
        return item.longitude
      }
      // Fallback: Mock longitude based on location hash
      const hash = item.location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return -74.0 - (hash % 100) / 1000
    },
    address: (item: RentalCarTableItem) => item.location,
  },
}
