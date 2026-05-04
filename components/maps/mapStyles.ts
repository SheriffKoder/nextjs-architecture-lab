export const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#383838" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#000000" }],
    },
  ]


  export const darkBlueMapStyle: google.maps.MapTypeStyle[] = [
    {
      elementType: "geometry",
      stylers: [{ color: "#0f172a" }], // deep navy
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#0b1220" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#94a3b8" }],
    },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#1e293b" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#1e293b" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#1f2a44" }], // blue-ish road
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#0b1220" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#0f506a" }], // subtle blue highlight
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0a2540" }], // deep blue water
    },
  ]
    