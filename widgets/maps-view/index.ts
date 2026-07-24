/**
 * @file widgets/maps-view/index.ts
 * Public barrel for the maps-view widget (production UI + types).
 * Mock helpers are exported from `./mock` for demos/tests only.
 */

export { default as MapVisualizer } from './ui/map-visualizer'
export { default as InfoWindowContent } from './ui/info-window-content'
export { default as MapsContainer } from './ui/maps-container'
export { default as AddressAutocomplete } from './ui/address-autocomplete'

export type { MapItem, MapCenter, MapContainerStyle } from './model/types'
export type { MapConfig } from './ui/maps-container'

/** Demo/mock entry — prefer importing from `@/widgets/maps-view/mock` in demos. */
export { default as MapsContainerWithMock } from './mock/maps-container-with-mock'
export type { MapConfigWithMock } from './mock/maps-container-with-mock'
