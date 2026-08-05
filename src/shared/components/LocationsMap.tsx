import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { groupVenuesByCity, VENUES } from '@/shared/data/locations'

const COLOMBIA_CENTER: [number, number] = [4.9, -74.2]

const goldIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, #F0C847, #D4AF37, #A0832A);
    border: 2px solid #0a0805;
    box-shadow: 0 0 10px rgba(212,175,55,0.8);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -9],
})

interface Props {
  height?: number | string
  compact?: boolean
}

export default function LocationsMap({ height = 360, compact = false }: Props) {
  const cityGroups = groupVenuesByCity(VENUES)
  const isSingleCity = cityGroups.length === 1
  const center: [number, number] = isSingleCity
    ? [cityGroups[0].lat, cityGroups[0].lng]
    : COLOMBIA_CENTER
  const zoom = isSingleCity ? (compact ? 12 : 13) : compact ? 5 : 6

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-[#D4AF37]/20"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!compact}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {cityGroups.map((group) => (
          <Marker key={group.city} position={[group.lat, group.lng]} icon={goldIcon}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
                <strong>{group.city}</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                  {group.venues.map((venue) => (
                    <li key={venue.name} style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 600 }}>{venue.name}</span>
                      <br />
                      <span style={{ fontSize: 12, color: '#555' }}>{venue.address}</span>
                      {venue.schedule.map((line) => (
                        <div key={line.days} style={{ fontSize: 11, color: '#777' }}>
                          {line.days}: {line.hours}
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
