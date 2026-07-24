# Maps View

Google Maps widget: load the API, render markers, info windows, and optional address autocomplete.

## Import

```ts
import {
  MapsContainer,
  MapVisualizer,
  AddressAutocomplete,
  type MapItem,
  type MapConfig,
} from '@/widgets/maps-view'
```

For demos / local mock markers:

```ts
import { MapsContainerWithMock } from '@/widgets/maps-view/mock'
// or still available from the main barrel for convenience
```

Prefer barrels. Do not deep-import `ui/`, `lib/`, or `model/` from outside this widget.

## Structure

```text
maps-view/
├── index.ts
├── ui/                 # MapsContainer, MapVisualizer, InfoWindow, AddressAutocomplete
├── model/              # MapItem, center, container style types
├── lib/                # map styles (e.g. dark theme)
└── mock/               # mock locations + MapsContainerWithMock (demos only)
```

## Production usage

```tsx
'use client'

import { MapsContainer, type MapConfig } from '@/widgets/maps-view'

type Car = { id: string; name: string; lat: number; lng: number }

const mapConfig: MapConfig<Car> = {
  zoom: 11,
  fieldMappings: {
    id: 'id',
    title: 'name',
    latitude: 'lat',
    longitude: 'lng',
  },
  onItemClick: (item) => console.log(item),
}

<MapsContainer data={cars} mapConfig={mapConfig} />
```

Requires `NEXT_PUBLIC_GOOGLE_MAPS_KEY` and the Places library when using autocomplete.

## Address autocomplete

```tsx
import { AddressAutocomplete } from '@/widgets/maps-view'

<AddressAutocomplete
  onSelect={({ address, lat, lng }) => {
    // persist or set form values
  }}
  placeholder="Search address"
/>
```

## Mock / demo

See `mock/MOCK_DATA.md`. Use `MapsContainerWithMock` only in demos (e.g. multi-view map tab).
