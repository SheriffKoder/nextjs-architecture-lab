"use client"

import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api"
import React, { useState, useCallback } from "react"
import InfoWindowContent from "./InfoWindowContent"
import type { MapItem, MapCenter, MapContainerStyle } from "./types"
import { useTheme } from "next-themes"
import { darkBlueMapStyle } from "./mapStyles"

type Props = {
  center?: MapCenter
  items: MapItem[]
  onItemClick?: (item: MapItem) => void
  containerStyle?: MapContainerStyle
  zoom?: number
}

const defaultContainerStyle = {
  width: "100%",
  height: "500px",
}

export default function MapVisualizer({ 
  items, 
  onItemClick, 
  center,
  containerStyle = defaultContainerStyle,
  zoom = 12
}: Props) {
  const [selected, setSelected] = useState<MapItem | null>(null)

  // Only use onLoad (auto-fit bounds) if center is NOT provided
  const onLoad = useCallback((map: google.maps.Map) => {
    if (center) {
      return // Don't auto-fit if center is provided
    }

    const bounds = new window.google.maps.LatLngBounds()
    
    items.forEach((item) => {
      bounds.extend({
        lat: item.latitude,
        lng: item.longitude,
      })
    })
    
    map.fitBounds(bounds)
  }, [items, center])


  //// Theme 
  const { theme } = useTheme()

  const mapOptions = {
    styles: theme === "dark" ? darkBlueMapStyle : [],
    disableDefaultUI: false,
  }

  return (
    <GoogleMap 
      mapContainerStyle={containerStyle} 
      center={center}
      zoom={zoom}
      onLoad={center ? undefined : onLoad}
      options={mapOptions}
    >
      {items.map((item) => (
        <Marker
          key={item.id}
          position={{
            lat: item.latitude,
            lng: item.longitude,
          }}
          onClick={() => setSelected(item)}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{
            lat: selected.latitude,
            lng: selected.longitude,
          }}
          onCloseClick={() => setSelected(null)}
        >
          <InfoWindowContent 
            item={selected} 
            onItemClick={onItemClick}
          />
        </InfoWindow>
      )}
    </GoogleMap>
  )
}
