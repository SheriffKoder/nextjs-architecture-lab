"use client"

import React from "react"
import type { MapItem } from "../model/types"

type Props = {
  item: MapItem
  onItemClick?: (item: MapItem) => void
}

// Helper function to format trailer status for display
const formatTrailerStatus = (status?: string): string => {
  if (!status) return ''
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function InfoWindowContent({ item, onItemClick }: Props) {
  return (
    <div style={{ color: '#000', padding: '8px', minWidth: '200px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#000' }}>
        {item.title}
      </h3>
      {item.trailerCode && (
        <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#000', fontWeight: '500' }}>
          Trailer: {item.trailerCode}
        </p>
      )}
      {item.trailerStatus && (
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
          Status: {formatTrailerStatus(item.trailerStatus)}
        </p>
      )}
      {item.address && (
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
          {item.address}
        </p>
      )}
      {onItemClick && (
        <button
          onClick={() => onItemClick(item)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          More details
        </button>
      )}
    </div>
  )
}
