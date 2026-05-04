"use client"

import React from "react"
import { useLoadScript } from "@react-google-maps/api"
import MapVisualizer from "./MapVisualizer"
import type { MapCenter, MapContainerStyle } from "./types"
import { mockLocations } from "./mock-locations"

export type MapConfigWithMock = {
  onItemClick?: (item: any) => void
  center?: MapCenter
  containerStyle?: MapContainerStyle
  zoom?: number
}

type MapsContainerWithMockProps = {
  data?: any[] // Optional - if not provided, uses mock data
  mapConfig?: MapConfigWithMock
}

/**
 * Maps Container With Mock Data Component
 * 
 * Wraps MapVisualizer with Google Maps API loading
 * Uses mock locations data for development/testing
 * 
 * Note: This component uses mock data. See MOCK_DATA.md for details.
 * 
 * @param data - Optional data array (currently not used, uses mock data instead)
 * @param mapConfig - Configuration for map display and interactions
 */
export default function MapsContainerWithMock({
  data,
  mapConfig = {},
}: MapsContainerWithMockProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    libraries: ['places']
  })

  // Use mock locations for now
  // TODO: Replace with actual data when available
  const mapItems = mockLocations

  // Handle item click
  const handleItemClick = (mapItem: typeof mockLocations[0]) => {
    console.log('Map item clicked:', mapItem)
    if (mapConfig.onItemClick) {
      mapConfig.onItemClick(mapItem)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full border border-border rounded-lg bg-muted/20">
        <div className="text-center p-8">
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  if (mapItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full border border-border rounded-lg bg-muted/20">
        <div className="text-center p-8">
          <p className="text-lg font-medium text-foreground mb-2">No locations to display</p>
          <p className="text-sm text-muted-foreground">No items with valid coordinates found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full border border-border rounded-xl bg-muted/20 overflow-hidden">
      <MapVisualizer
        items={mapItems}
        onItemClick={handleItemClick}
        center={mapConfig.center}
        containerStyle={mapConfig.containerStyle || { width: "100%", height: "100%" }}
        zoom={mapConfig.zoom}
      />
    </div>
  )
}
