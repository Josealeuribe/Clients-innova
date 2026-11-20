// El mapa DE VERDAD. Vive en su propio archivo para que Leaflet y su CSS
// queden en un chunk aparte: lo carga LocationsMap.tsx solo cuando el mapa se
// acerca a la pantalla. Ver ahi el porque.
import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { comoLlegarUrl, VENUES } from '@/shared/data/locations'
import fichardoPin from '@/shared/assets/images/fichardo-ubicacion-pin.webp'

// Un marcador por sede, no uno por ciudad. Las 3 están en Cúcuta y antes
// aparecían agrupadas bajo un solo pin, así que el mapa no servía para saber
// a cuál ir: es justo lo que necesita alguien con un bono asignado a una sede
// concreta.
//
// El marcador es Fichardo sosteniendo el pin. Sirve el mismo para el mapa de
// Inicio y el del pie de pagina, porque los dos montan este componente.
//
// Se usa fichardo-ubicacion-pin.webp (192 px, ~13 KB), generado recortando
// fichardo-ubicacion.png (1 MB): pintar el original a ~56 px descargaria un
// mega por nada. Si se cambia la imagen, regenerar tambien la version pin.
//
// El ancla va en la PUNTA DEL PIN rojo (≈50% del ancho, ≈92% del alto de la
// imagen), no en el centro: es la punta la que tiene que caer sobre la sede.
const TAM_MARCADOR = 56
const goldIcon = L.icon({
  iconUrl: fichardoPin,
  iconSize: [TAM_MARCADOR, TAM_MARCADOR],
  iconAnchor: [Math.round(TAM_MARCADOR * 0.5), Math.round(TAM_MARCADOR * 0.92)],
  popupAnchor: [0, -Math.round(TAM_MARCADOR * 0.85)],
  className: 'marcador-fichardo',
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

export default function LocationsMapInterno({ height = 360, compact = false }: Props) {
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
