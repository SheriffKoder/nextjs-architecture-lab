/**
 * Rental Cars Index Component
 * 
 * Purpose: Main orchestrator component for rental cars management page
 * Used in: app/(root)/rental-cars/page.tsx
 * Why: Separates layout logic from data, manages page header and actions
 * 
 * Steps:
 * 1. Define mock data for rental cars
 * 2. Render page header with "Add Car" button
 * 3. Render rental-cars-content.tsx with data
 */

'use client'

import { RentalCarTableItem } from './config/table-config'
import RentalCarsContent from './rental-cars-content'
import PageHeader from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

////////////////////////////////////
// Mock Data: Rental Cars
////////////////////////////////////

/**
 * Generate mock rental cars data
 */
const generateMockCars = (): RentalCarTableItem[] => {
  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Tesla']
  const models = ['Camry', 'Accord', 'F-150', 'Silverado', '3 Series', 'C-Class', 'A4', 'Model 3']
  const locations = [
    'New York, NY',
    'Los Angeles, CA',
  ]
  const statuses = ['available', 'rented']
  const colors = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Gray']
  
  const cars: RentalCarTableItem[] = []
  
  // Generate 50 rental cars
  for (let i = 1; i <= 10; i++) {
    const makeIndex = Math.floor(Math.random() * makes.length)
    const modelIndex = Math.floor(Math.random() * models.length)
    const locationIndex = Math.floor(Math.random() * locations.length)
    const statusIndex = Math.floor(Math.random() * statuses.length)
    const colorIndex = Math.floor(Math.random() * colors.length)
    
    const year = 2018 + Math.floor(Math.random() * 7) // 2018-2024
    const mileage = Math.floor(Math.random() * 50000) + 1000 // 1,000 - 51,000 miles
    const pricePerDay = Math.floor(Math.random() * 100) + 30 // $30 - $130 per day
    
    // Generate license plate (format: ABC-1234)
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                   String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                   String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const licensePlate = `${letters}-${numbers}`
    
    // Random last service date (within last 6 months)
    const lastServiceDate = new Date()
    lastServiceDate.setMonth(lastServiceDate.getMonth() - Math.floor(Math.random() * 6))
    
    cars.push({
      id: `car-${i}`,
      model: models[modelIndex],
      make: makes[makeIndex],
      year,
      status: statuses[statusIndex],
      location: locations[locationIndex],
      mileage,
      pricePerDay,
      color: colors[colorIndex],
      licensePlate,
      lastServiceDate,
    })
  }
  
  return cars
}

////////////////////////////////////
// Component Implementation: Main layout
////////////////////////////////////

/**
 * Rental cars management index component
 * 
 * Why: Main orchestrator component for rental cars management page
 * How: Provides page header, action buttons, and renders content with mock data
 */
export default function RentalCarsIndex() {
  // Mock data - in real app, this would come from API/hooks
  const cars = generateMockCars()
  
  /**
   * Handle row click
   * 
   * @param car - Rental car table item that was clicked
   */
  const handleRowClick = (car: RentalCarTableItem) => {
    console.log('Car clicked:', car)
    // In real app, this would open a drawer or navigate to details
  }
  
  /**
   * Handle subheadings drag end
   * 
   * @param updatedData - Updated rental cars data after drag
   */
  const handleSubheadingsDragEnd = (updatedData: RentalCarTableItem[]) => {
    console.log('Cars reordered:', updatedData)
    // In real app, this would update the data via API
  }
  
  /**
   * Handle add car button click
   */
  const handleAddCar = () => {
    console.log('Add car clicked')
    // In real app, this would open a create form/drawer
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden">
      {/* Header - Always visible */}
      <header className="flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0">
        <PageHeader 
          subTitle="Manage rental car fleet and availability"
        />
        <div className="flex gap-2">
          <Button onClick={handleAddCar} variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Add Car
          </Button>
        </div>
      </header>

      {/* Main content - Table/Subheadings/Map display */}
      <div className="flex-1 overflow-y-auto flex pb-2 min-w-0 pt-2 w-full">
        <div className="h-full w-full pr-2 pt-2 min-w-0 flex flex-col">
          <RentalCarsContent
            cars={cars}
            onRowClick={handleRowClick}
            onSubheadingsDragEnd={handleSubheadingsDragEnd}
          />
        </div>
      </div>
    </div>
  )
}
