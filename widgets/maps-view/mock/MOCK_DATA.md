# Mock Data Usage

## Current Status

The `MapsContainerWithMock` component is currently using **mock location data** for development and testing purposes. This component is used in the `FilteringWrapper` for map view display.

## Components

- **MapsContainer**: Generic container that transforms and displays any data with field mappings
- **MapsContainerWithMock**: Simplified container that uses mock locations (used in FilteringWrapper)

## Mock Data Location

Mock locations are defined in:
- **File**: `components/maps/mock-locations.ts`
- **Export**: `mockLocations` constant

## Data Structure

The mock data follows the `MapItem` type structure:
```typescript
{
  id: string
  title: string
  latitude: number
  longitude: number
  address?: string
}
```

## Current Mock Data

The mock data includes 10 locations:
- 7 locations in Washington, DC
- 3 locations in Baltimore, MD

## Migration Path

When ready to use real data in FilteringWrapper:

1. Update `MapsContainerWithMock.tsx` to use the `data` prop instead of `mockLocations`
2. Or replace `MapsContainerWithMock` with `MapsContainer` in `filtering-wrapper.tsx` and provide appropriate `fieldMappings` in `mapConfig`
3. Ensure your data items match the `MapItem` structure or provide appropriate `fieldMappings` in `mapConfig`
4. Update this documentation to reflect the change

## Notes

- Mock data is used when `data` prop is empty or when explicitly enabled
- Field mappings can be configured via `mapConfig.fieldMappings` to transform custom data structures
- The component will automatically filter out items without valid coordinates
