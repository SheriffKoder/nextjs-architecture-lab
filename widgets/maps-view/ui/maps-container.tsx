"use client"

import React, { useMemo } from "react"
import { useLoadScript } from "@react-google-maps/api"
import MapVisualizer from "./map-visualizer"
import type { MapItem, MapCenter, MapContainerStyle } from "../model/types"

export type MapConfig<T = any> = {
  onItemClick?: (item: T) => void
  center?: MapCenter
  containerStyle?: MapContainerStyle
  zoom?: number
  // Field mappings to convert data items to MapItem format
  fieldMappings?: {
    id?: string | ((item: T) => string)
    title?: string | ((item: T) => string)
    latitude?: string | ((item: T) => number)
    longitude?: string | ((item: T) => number)
    address?: string | ((item: T) => string | undefined)
  }
}

type MapsContainerProps<T = any> = {
  data: T[]
  mapConfig?: MapConfig<T>
}

/**
 * Maps Container Component
 * 
 * Wraps MapVisualizer with Google Maps API loading and data transformation
 * Converts generic data items to MapItem format for display on map
 */
export default function MapsContainer<T extends Record<string, any> = Record<string, any>>({
  data,
  mapConfig = {},
}: MapsContainerProps<T>) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    libraries: ['places']
  })

  // Default field mappings - assume common field names
  const defaultMappings = {
    id: 'id',
    title: 'title' as string | ((item: T) => string),
    latitude: 'latitude' as string | ((item: T) => number),
    longitude: 'longitude' as string | ((item: T) => number),
    address: 'address' as string | ((item: T) => string | undefined),
  }

  const mappings = { ...defaultMappings, ...mapConfig.fieldMappings }

  // Transform data items to MapItem format
  const mapItems: MapItem[] = useMemo(() => {
    if (!data || data.length === 0) return []

    return data
      .filter((item) => {
        // Filter out items without valid coordinates
        const lat = typeof mappings.latitude === 'function'
          ? mappings.latitude(item)
          : item[mappings.latitude as string]
        const lng = typeof mappings.longitude === 'function'
          ? mappings.longitude(item)
          : item[mappings.longitude as string]
        
        return lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))
      })
      .map((item): MapItem => {
        const getId = () => {
          if (typeof mappings.id === 'function') return mappings.id(item)
          return String(item[mappings.id as string] ?? item.id ?? '')
        }

        const getTitle = () => {
          if (typeof mappings.title === 'function') return mappings.title(item)
          return String(item[mappings.title as string] ?? item.title ?? item.name ?? '')
        }

        const getLatitude = () => {
          if (typeof mappings.latitude === 'function') return mappings.latitude(item)
          return Number(item[mappings.latitude as string] ?? item.latitude ?? 0)
        }

        const getLongitude = () => {
          if (typeof mappings.longitude === 'function') return mappings.longitude(item)
          return Number(item[mappings.longitude as string] ?? item.longitude ?? 0)
        }

        const getAddress = () => {
          if (!mappings.address) return undefined
          if (typeof mappings.address === 'function') return mappings.address(item)
          return item[mappings.address as string] ?? item.address
        }

        return {
          id: getId(),
          title: getTitle(),
          latitude: getLatitude(),
          longitude: getLongitude(),
          address: getAddress(),
        }
      })
  }, [data, mappings])

  // Handle item click - convert MapItem back to original data item
  const handleItemClick = (mapItem: MapItem) => {
    if (!mapConfig.onItemClick) return
    
    // Find the original item by ID
    const originalItem = data.find((item) => {
      const itemId = typeof mappings.id === 'function'
        ? mappings.id(item)
        : String(item[mappings.id as string] ?? item.id ?? '')
      return itemId === mapItem.id
    })
    
    if (originalItem) {
      mapConfig.onItemClick(originalItem)
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
    <div className="h-full w-full">
      <MapVisualizer
        items={mapItems}
        onItemClick={mapConfig.onItemClick ? handleItemClick : undefined}
        center={mapConfig.center}
        containerStyle={mapConfig.containerStyle || { width: "100%", height: "100%" }}
        zoom={mapConfig.zoom}
      />
    </div>
  )
}
