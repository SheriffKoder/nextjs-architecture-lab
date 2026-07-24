"use client"

import React, { useRef } from "react"
import { Autocomplete } from "@react-google-maps/api"

type Props = {
  onSelect: (data: {
    address: string
    lat: number
    lng: number
    fullPlaceObject: string // JSON string of the full place object
  }) => void
  onChange?: (value: string) => void // Callback for manual typing
  value?: string // JSON string or plain address string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function AddressAutocomplete({ 
  onSelect, 
  onChange,
  value,
  placeholder = "Search address",
  className = "",
  disabled = false
}: Props) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  
  // Parse value to extract address if it's JSON
  const parsedValue = React.useMemo(() => {
    if (!value) return ''
    try {
      const parsed = JSON.parse(value)
      return parsed.address || value
    } catch {
      return value
    }
  }, [value])
  
  // Local state for input value to allow free editing
  const [inputValue, setInputValue] = React.useState(parsedValue)
  
  // Sync local state with prop value when it changes externally
  React.useEffect(() => {
    setInputValue(parsedValue)
  }, [parsedValue])
  
  // Handle manual typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typedValue = e.target.value
    setInputValue(typedValue)
    if (onChange) {
      // If user is typing manually, store as plain text (not JSON)
      // They can select from autocomplete to get coordinates
      onChange(typedValue)
    }
  }

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()

    if (!place?.geometry) return

    const formattedAddress = place.formatted_address || ""

    // Update local input value to show the selected address
    setInputValue(formattedAddress)

    // Create simplified address object with address, latitude, longitude
    const addressData = {
      address: formattedAddress,
      latitude: place.geometry?.location?.lat() || 0,
      longitude: place.geometry?.location?.lng() || 0,
    }

    // Convert to JSON string
    const fullPlaceObjectJson = JSON.stringify(addressData)

    onSelect({
      address: formattedAddress,
      lat: place.geometry?.location?.lat() || 0,
      lng: place.geometry?.location?.lng() || 0,
      fullPlaceObject: fullPlaceObjectJson,
    })
  }

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full h-10 px-3 rounded-sm bg-[rgba(255,255,255,0.25)] md:bg-[rgba(26,26,26,0.02)] dark:md:bg-background/10 dark:bg-background/50 border border-foreground/10 text-foreground placeholder-foreground/30 focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary/50 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        disabled={disabled}
      />
    </Autocomplete>
  )
}
