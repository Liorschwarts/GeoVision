import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

interface Props {
  lat: number
  lng: number
  city: string
}

export const CityMap = ({ lat, lng, city }: Props) => (
  <div className="relative w-full h-44 rounded-xl overflow-hidden">
    <MapContainer
      center={[lat, lng]}
      zoom={10}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
      aria-label={`Map of ${city}`}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} />
    </MapContainer>

    <a
      href={`https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute inset-0 z-[1000] flex items-end justify-end p-2"
      aria-label={`Open ${city} in Google Maps`}
    >
      <span className="bg-white/90 backdrop-blur-sm text-xs text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
        <GoogleMapsIcon />
        Open in Maps
      </span>
    </a>
  </div>
)

const GoogleMapsIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
)
