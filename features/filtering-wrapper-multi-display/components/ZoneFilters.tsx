/**
 * Zone Filters Component
 * 
 * Purpose: Displays filter buttons for unique zone values from report data
 * Used in: VirtualizedTable component for zone-based filtering
 * Why: Provides quick access to filter data by zone values
 */

import React, { useMemo } from 'react';

interface ZoneFiltersProps {
  data: any[];
  zoneField?: string; // Optional field name, defaults to 'zones'
  handleFilterChange: (columnKey: string, value: any) => void;
  filters: Record<string, any>;
  label?: string; // Optional label for the "All" button
}

export function ZoneFilters({ 
  data, 
  zoneField = 'zones',
  handleFilterChange,
  filters,
  label = 'Zones'
}: ZoneFiltersProps) {
  // Extract unique zone values from data
  const uniqueZones = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const zones = data
      .map(item => item[zoneField])
      .filter(zone => zone !== null && zone !== undefined && zone !== '')
      .filter((zone, index, array) => array.indexOf(zone) === index) // Remove duplicates
      .sort(); // Sort alphabetically
    
    return zones;
  }, [data, zoneField]);

  // Get current selected zones from filters
  const selectedZones = filters[zoneField];

  // Handle zone selection/deselection
  const handleZoneToggle = (zone: string) => {
    // Ensure selectedZones is an array or default to empty array
    const currentZones = Array.isArray(selectedZones) ? selectedZones : [];
    const isSelected = currentZones.includes(zone);
    
    if (isSelected) {
      // Remove zone from selection
      const newZones = currentZones.filter((z: string) => z !== zone);
      // If no zones left, set to null to show "All" button as active
      handleFilterChange(zoneField, newZones.length > 0 ? newZones : null);
    } else {
      // Add zone to selection
      const newZones = [...currentZones, zone];
      handleFilterChange(zoneField, newZones);
    }
  };

  // Clear all zone filters
  const handleClearAll = () => {
    handleFilterChange(zoneField, null);
  };

  // Don't render if no zones found
  if (uniqueZones.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-2">
      {/* All zones button */}
      <button
        onClick={handleClearAll}
        className={`
          px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer hover:opacity-80
          ${!selectedZones || (Array.isArray(selectedZones) && selectedZones.length === 0)
            ? 'bg-secondary text-white' 
            : 'bg-primary text-white'
          }
        `}
      >
        All {label}
      </button>
      
      {/* Individual zone buttons */}
      {uniqueZones.map((zone) => {
        // Safely check if zone is selected - handle null/undefined/empty array
        const isSelected = Array.isArray(selectedZones) && selectedZones.length > 0 && selectedZones.includes(zone);
        
        return (
          <button
            key={zone}
            onClick={() => handleZoneToggle(zone)}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer hover:opacity-80
              ${isSelected 
                ? 'bg-secondary text-white' 
                : 'bg-primary text-white'
              }
            `}
          >
            {zone}
          </button>
        );
      })}
    </div>
  );
}
