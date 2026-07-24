/**
 * Mock Locations Data
 * 
 * Purpose: Temporary mock data for map visualization during development
 * Used in: MapsContainer component
 * Why: Allows testing map functionality without real data source
 * 
 * Note: This is temporary mock data. Replace with actual data source when available.
 */

import type { MapItem } from "../model/types"

export enum TrailerStatus {
  AVAILABLE = 'available',
  IN_TRANSIT = 'in_transit',
  RETURNING = 'returning',
  ASSIGNED = 'assigned',
  UNDER_MAINTENANCE = 'under_maintenance',
}

export const mockLocations: MapItem[] = [
  // Washington, DC (7)
  {
    id: '1',
    title: 'White House',
    longitude: -77.0365,
    latitude: 38.8977,
    address: "1600 Pennsylvania Ave NW, Washington, DC 20500 (White House)",
    trailerCode: 'TRL-2024-001',
    trailerStatus: TrailerStatus.ASSIGNED
  },
  {
    id: '2',
    title: 'U.S. Capitol',
    longitude: -77.0091,
    latitude: 38.8899,
    address: "First St SE, Washington, DC 20004 (U.S. Capitol)",
    trailerCode: 'TRL-2024-002',
    trailerStatus: TrailerStatus.IN_TRANSIT
  },
  {
    id: '3',
    title: 'Washington Monument',
    longitude: -77.0353,
    latitude: 38.8895,
    address: "2 15th St NW, Washington, DC 20024 (Washington Monument)",
    trailerCode: 'TRL-2024-003',
    trailerStatus: TrailerStatus.AVAILABLE
  },
  {
    id: '4',
    title: 'Lincoln Memorial',
    longitude: -77.0502,
    latitude: 38.8893,
    address: "2 Lincoln Memorial Cir NW, Washington, DC 20002 (Lincoln Memorial)",
    trailerCode: 'TRL-2024-004',
    trailerStatus: TrailerStatus.RETURNING
  },
  {
    id: '5',
    title: 'National Archives',
    longitude: -77.0199,
    latitude: 38.8913,
    address: "701 Constitution Ave NW, Washington, DC 20408 (National Archives)",
    trailerCode: 'TRL-2024-005',
    trailerStatus: TrailerStatus.ASSIGNED
  },
  {
    id: '6',
    title: 'Smithsonian American Art Museum',
    longitude: -77.0260,
    latitude: 38.8977,
    address: "8th St NW & F St NW, Washington, DC 20004 (Smithsonian American Art Museum)",
    trailerCode: 'TRL-2024-006',
    trailerStatus: TrailerStatus.AVAILABLE
  },
  {
    id: '7',
    title: 'Smithsonian National Museum of Natural History',
    longitude: -77.0283,
    latitude: 38.8887,
    address: "1000 Jefferson Dr SW, Washington, DC 20560 (Smithsonian National Museum of Natural History)",
    trailerCode: 'TRL-2024-007',
    trailerStatus: TrailerStatus.UNDER_MAINTENANCE
  },
]
