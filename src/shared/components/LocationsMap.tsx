import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { comoLlegarUrl, VENUES } from '@/shared/data/locations'

// Un marcador por sede, no uno por ciudad. Las 3 están en Cúcuta y antes
// aparecían agrupadas bajo un solo pin, así que el mapa no servía para saber
// a cuál ir: es justo lo que necesita alguien con un bono asignado a una sede
// concreta.
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

// Encuadra el mapa para que las 3 sedes queden visibles. No se usa un zoom
// fijo porque la distancia entre ellas puede cambiar si mañana abren una
// sede en otro punto de la ciudad, y un zoom quemado dejaría alguna fuera.
function EncuadrarSedes({ puntos }: { puntos: [number, number][] }) {
  const mapa = useMap()

  useEffect(() => {
    if (puntos.length === 0) return
    if (puntos.length === 1) {
      mapa.setView(puntos[0], 15)
      return
    }
    // El padding evita que un marcador quede pegado al borde; maxZoom impide
    // que, con sedes muy juntas, el mapa se acerque tanto que se pierda la
    // referencia de la ciudad.
    mapa.fitBounds(L.latLngBounds(puntos), { padding: [48, 48], maxZoom: 15 })
  }, [mapa, puntos])

  return null
}

interface Props {
  height?: number | string
  compact?: boolean
}

export default function LocationsMap({ height = 360, compact = false }: Props) {
  const puntos = VENUES.map((venue) => venue.coords)

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#D4AF37]/20" style={{ height }}>
      <MapContainer
        center={puntos[0]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!compact}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <EncuadrarSedes puntos={puntos} />

        {VENUES.map((venue) => (
          <Marker key={venue.clave} position={venue.coords} icon={goldIcon}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 200 }}>
                <strong style={{ fontSize: 13 }}>{venue.name}</strong>
                <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{venue.address}</div>

                <div style={{ marginTop: 8 }}>
                  {venue.schedule.map((line) => (
                    <div key={line.days} style={{ fontSize: 11, color: '#777' }}>
                      {line.days}: {line.hours}
                    </div>
                  ))}
                </div>

                <a
                  href={comoLlegarUrl(venue)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#8A6000',
                  }}
                >
                  Cómo llegar →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
