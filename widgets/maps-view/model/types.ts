export type MapItem = {
  id: string
  title: string
  latitude: number
  longitude: number
  address?: string
  trailerCode?: string
  trailerStatus?: string
}

export type MapCenter = {
  lat: number
  lng: number
}

export type MapContainerStyle = {
  width: string
  height: string
}
