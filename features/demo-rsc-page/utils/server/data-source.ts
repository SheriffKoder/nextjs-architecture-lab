/**
 * Mock Rental Cars Data Source
 * 
 * Purpose: Provides mock rental car data for development and testing
 * Used in: RSC pages that need to display rental car data
 * Why: Provides sample data without requiring database or API setup
 */

import type { RentalCarTableItem } from '../../types/rental-car-table-item'

/**
 * Helper function to generate rental dates
 * Creates dates spread across the current month and next month for variety
 */
function generateRentalDates(index: number): { rentalStartDate: string; rentalEndDate: string } {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12
  
  // Spread dates across current month and next month
  const month = currentMonth + Math.floor(index / 15)
  const day = (index % 15) + 1 // Days 1-15
  const duration = 3 + (index % 7) // 3-9 days duration
  
  const startDate = new Date(currentYear, month - 1, day)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + duration)
  
  return {
    rentalStartDate: startDate.toISOString(),
    rentalEndDate: endDate.toISOString(),
  }
}

/**
 * Helper function to get coordinates based on location and car ID
 * Uses deterministic hash for consistent coordinates per car
 */
function getCoordinates(location: string, carId: string): { lat: number; lng: number } {
  // Create a deterministic hash from car ID
  const hash = carId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const variation = (hash % 100) / 1000 // 0.000 to 0.099 variation
  
  if (location.includes('New York')) {
    // NYC area coordinates with deterministic variation
    return {
      lat: 40.7128 + (variation - 0.05) * 0.1,
      lng: -74.0060 + (variation - 0.05) * 0.1,
    }
  } else if (location.includes('Los Angeles')) {
    // LA area coordinates with deterministic variation
    return {
      lat: 34.0522 + (variation - 0.05) * 0.1,
      lng: -118.2437 + (variation - 0.05) * 0.1,
    }
  }
  // Default to NYC
  return {
    lat: 40.7128,
    lng: -74.0060,
  }
}

/** Per-`status` index in array iteration order — used by subheadings manual sort. */
function assignManualSortingForSubheadingsDemo(
  items: RentalCarTableItem[]
): RentalCarTableItem[] {
  const counts = new Map<string, number>()
  return items.map((item) => {
    const idx = counts.get(item.status) ?? 0
    counts.set(item.status, idx + 1)
    return { ...item, manual_sorting: idx }
  })
}

/**
 * Generate mock rental cars data
 * 
 * Why: Provides varied sample data for demo purposes
 * How: Creates array of rental car objects with realistic values
 */
const rentalCarsBase: RentalCarTableItem[] = [
  {
    id: 'car-1',
    model: 'Camry',
    make: 'Toyota',
    year: 2022,
    status: 'available',
    location: 'New York, NY',
    mileage: 15000,
    pricePerDay: 45,
    color: 'Black',
    licensePlate: 'ABC-1234',
    ...generateRentalDates(0),
    ...getCoordinates('New York, NY', 'car-1'),
  },
  {
    id: 'car-2',
    model: 'Accord',
    make: 'Honda',
    year: 2023,
    status: 'rented',
    location: 'Los Angeles, CA',
    mileage: 8500,
    pricePerDay: 50,
    color: 'White',
    licensePlate: 'DEF-5678',
    ...generateRentalDates(1),
    ...getCoordinates('Los Angeles, CA', 'car-2'),
  },
  {
    id: 'car-3',
    model: 'F-150',
    make: 'Ford',
    year: 2021,
    status: 'available',
    location: 'New York, NY',
    mileage: 25000,
    pricePerDay: 75,
    color: 'Silver',
    licensePlate: 'GHI-9012',
    ...generateRentalDates(2),
    ...getCoordinates('New York, NY', 'car-3'),
  },
  {
    id: 'car-4',
    model: 'Silverado',
    make: 'Chevrolet',
    year: 2022,
    status: 'maintenance',
    location: 'Los Angeles, CA',
    mileage: 18000,
    pricePerDay: 70,
    color: 'Red',
    licensePlate: 'JKL-3456',
    ...generateRentalDates(3),
    ...getCoordinates('Los Angeles, CA', 'car-4'),
  },
  {
    id: 'car-5',
    model: '3 Series',
    make: 'BMW',
    year: 2023,
    status: 'reserved',
    location: 'New York, NY',
    mileage: 5000,
    pricePerDay: 120,
    color: 'Blue',
    licensePlate: 'MNO-7890',
    ...generateRentalDates(4),
    ...getCoordinates('New York, NY', 'car-5'),
  },
  {
    id: 'car-6',
    model: 'C-Class',
    make: 'Mercedes-Benz',
    year: 2022,
    status: 'available',
    location: 'Los Angeles, CA',
    mileage: 12000,
    pricePerDay: 110,
    color: 'Gray',
    licensePlate: 'PQR-1357',
    ...generateRentalDates(5),
    ...getCoordinates('Los Angeles, CA', 'car-6'),
  },
  {
    id: 'car-7',
    model: 'A4',
    make: 'Audi',
    year: 2023,
    status: 'rented',
    location: 'New York, NY',
    mileage: 7000,
    pricePerDay: 100,
    color: 'Black',
    licensePlate: 'STU-2468',
    ...generateRentalDates(6),
    ...getCoordinates('New York, NY', 'car-7'),
  },
  {
    id: 'car-8',
    model: 'Model 3',
    make: 'Tesla',
    year: 2024,
    status: 'available',
    location: 'Los Angeles, CA',
    mileage: 3000,
    pricePerDay: 150,
    color: 'White',
    licensePlate: 'VWX-3691',
    ...generateRentalDates(7),
    ...getCoordinates('Los Angeles, CA', 'car-8'),
  },
  {
    id: 'car-9',
    model: 'Camry',
    make: 'Toyota',
    year: 2021,
    status: 'available',
    location: 'New York, NY',
    mileage: 28000,
    pricePerDay: 40,
    color: 'Silver',
    licensePlate: 'YZA-4826',
    ...generateRentalDates(8),
    ...getCoordinates('New York, NY', 'car-9'),
  },
  {
    id: 'car-10',
    model: 'Accord',
    make: 'Honda',
    year: 2022,
    status: 'rented',
    location: 'Los Angeles, CA',
    mileage: 16000,
    pricePerDay: 48,
    color: 'Blue',
    licensePlate: 'BCD-5927',
    ...generateRentalDates(9),
    ...getCoordinates('Los Angeles, CA', 'car-10'),
  },
  {
    id: 'car-11',
    model: 'F-150',
    make: 'Ford',
    year: 2023,
    status: 'available',
    location: 'New York, NY',
    mileage: 9000,
    pricePerDay: 80,
    color: 'Black',
    licensePlate: 'EFG-6038',
    ...generateRentalDates(10),
    ...getCoordinates('New York, NY', 'car-11'),
  },
  {
    id: 'car-12',
    model: 'Silverado',
    make: 'Chevrolet',
    year: 2020,
    status: 'maintenance',
    location: 'Los Angeles, CA',
    mileage: 35000,
    pricePerDay: 65,
    color: 'Red',
    licensePlate: 'HIJ-7149',
    ...generateRentalDates(11),
    ...getCoordinates('Los Angeles, CA', 'car-12'),
  },
  {
    id: 'car-13',
    model: '3 Series',
    make: 'BMW',
    year: 2022,
    status: 'available',
    location: 'New York, NY',
    mileage: 14000,
    pricePerDay: 115,
    color: 'White',
    licensePlate: 'KLM-8250',
    ...generateRentalDates(12),
    ...getCoordinates('New York, NY', 'car-13'),
  },
  {
    id: 'car-14',
    model: 'C-Class',
    make: 'Mercedes-Benz',
    year: 2023,
    status: 'reserved',
    location: 'Los Angeles, CA',
    mileage: 6000,
    pricePerDay: 105,
    color: 'Gray',
    licensePlate: 'NOP-9361',
    ...generateRentalDates(13),
    ...getCoordinates('Los Angeles, CA', 'car-14'),
  },
  {
    id: 'car-15',
    model: 'A4',
    make: 'Audi',
    year: 2021,
    status: 'available',
    location: 'New York, NY',
    mileage: 22000,
    pricePerDay: 95,
    color: 'Black',
    licensePlate: 'QRS-0472',
    ...generateRentalDates(14),
    ...getCoordinates('New York, NY', 'car-15'),
  },
  {
    id: 'car-16',
    model: 'Model 3',
    make: 'Tesla',
    year: 2023,
    status: 'rented',
    location: 'Los Angeles, CA',
    mileage: 11000,
    pricePerDay: 145,
    color: 'Blue',
    licensePlate: 'TUV-1583',
    ...generateRentalDates(15),
    ...getCoordinates('Los Angeles, CA', 'car-16'),
  },
  {
    id: 'car-17',
    model: 'Camry',
    make: 'Toyota',
    year: 2024,
    status: 'available',
    location: 'New York, NY',
    mileage: 2000,
    pricePerDay: 47,
    color: 'Silver',
    licensePlate: 'WXY-2694',
    ...generateRentalDates(16),
    ...getCoordinates('New York, NY', 'car-17'),
  },
  {
    id: 'car-18',
    model: 'Accord',
    make: 'Honda',
    year: 2021,
    status: 'available',
    location: 'Los Angeles, CA',
    mileage: 30000,
    pricePerDay: 42,
    color: 'White',
    licensePlate: 'ZAB-3705',
    ...generateRentalDates(17),
    ...getCoordinates('Los Angeles, CA', 'car-18'),
  },
  {
    id: 'car-19',
    model: 'F-150',
    make: 'Ford',
    year: 2022,
    status: 'maintenance',
    location: 'New York, NY',
    mileage: 19000,
    pricePerDay: 72,
    color: 'Red',
    licensePlate: 'CDE-4816',
    ...generateRentalDates(18),
    ...getCoordinates('New York, NY', 'car-19'),
  },
  {
    id: 'car-20',
    model: 'Silverado',
    make: 'Chevrolet',
    year: 2023,
    status: 'available',
    location: 'Los Angeles, CA',
    mileage: 8000,
    pricePerDay: 68,
    color: 'Black',
    licensePlate: 'FGH-5927',
    ...generateRentalDates(19),
    ...getCoordinates('Los Angeles, CA', 'car-20'),
  },
  {
    id: 'car-21',
    model: '3 Series',
    make: 'BMW',
    year: 2021,
    status: 'rented',
    location: 'New York, NY',
    mileage: 24000,
    pricePerDay: 110,
    color: 'Blue',
    licensePlate: 'IJK-6038',
    ...generateRentalDates(20),
    ...getCoordinates('New York, NY', 'car-21'),
  },
  {
    id: 'car-22',
    model: 'C-Class',
    make: 'Mercedes-Benz',
    year: 2022,
    status: 'available',
    location: 'Los Angeles, CA',
    mileage: 13000,
    pricePerDay: 108,
    color: 'Gray',
    licensePlate: 'LMN-7149',
    ...generateRentalDates(21),
    ...getCoordinates('Los Angeles, CA', 'car-22'),
  },
  {
    id: 'car-23',
    model: 'A4',
    make: 'Audi',
    year: 2024,
    status: 'reserved',
    location: 'New York, NY',
    mileage: 1000,
    pricePerDay: 102,
    color: 'White',
    licensePlate: 'OPQ-8250',
    ...generateRentalDates(22),
    ...getCoordinates('New York, NY', 'car-23'),
  },
  {
    id: 'car-24',
    model: 'Model 3',
    make: 'Tesla',
    year: 2022,
    status: 'available',
    location: 'Los Angeles, CA',
    mileage: 17000,
    pricePerDay: 140,
    color: 'Silver',
    licensePlate: 'RST-9361',
    ...generateRentalDates(23),
    ...getCoordinates('Los Angeles, CA', 'car-24'),
  },
  {
    id: 'car-25',
    model: 'Camry',
    make: 'Toyota',
    year: 2023,
    status: 'available',
    location: 'New York, NY',
    mileage: 10000,
    pricePerDay: 46,
    color: 'Black',
    licensePlate: 'UVW-0472',
    ...generateRentalDates(24),
    ...getCoordinates('New York, NY', 'car-25'),
  },
]

export const rentalCars: RentalCarTableItem[] =
  assignManualSortingForSubheadingsDemo(rentalCarsBase)
