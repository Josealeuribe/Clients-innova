import { lazy, Suspense, useEffect, useRef, useState } from 'react'

// Envoltorio PEREZOSO del mapa de sedes.
//
// El mapa vive en el Footer, y el Footer está en casi todas las vistas. Montado
// de golpe costaba lo mismo en todas: Leaflet y su CSS dentro del bundle
// principal, más 12 imágenes de tiles pedidas a OpenStreetMap nada más abrir la
// página — aunque el visitante nunca bajara hasta el pie, que es lo normal.
//
// Aquí se corta por los dos lados:
//
//   · `lazy()` saca Leaflet del bundle principal y lo deja en un chunk propio,
//     que solo se descarga cuando hace falta.
//   · El IntersectionObserver espera a que el hueco del mapa se acerque a la
//     pantalla (200px antes) para montarlo. Quien no baja, no lo paga.
//
// Mientras tanto se pinta un marco del mismo tamaño. Eso importa: sin él, el
// mapa apareciendo de golpe empujaría el contenido de abajo — el salto de
// maquetación que justamente se siente como un "flasheo" al hacer scroll.
const LocationsMapInterno = lazy(() => import('./LocationsMapInterno'))

interface Props {
  height?: number | string
  compact?: boolean
}

// Mismo borde y radio que el mapa real, para que la sustitución no se note.
function Marco({ height, children }: { height: number | string; children?: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-[#D4AF37]/20 flex items-center justify-center"
      style={{ height, background: 'linear-gradient(160deg, #1C1810, #121009)' }}
    >
      {children}
    </div>
  )
}

export default function LocationsMap({ height = 360, compact = false }: Props) {
  const hueco = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const nodo = hueco.current
    if (!nodo || visible) return

    // Sin IntersectionObserver (navegadores muy viejos) se monta y ya: es
    // preferible cargar de más que quedarse sin mapa.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisible(true)
          observador.disconnect()
        }
      },
      // Se adelanta 200px para que el mapa esté puesto cuando el usuario llegue,
      // en vez de verlo aparecer.
      { rootMargin: '200px' },
    )
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [visible])

  if (!visible) {
    return (
      <div ref={hueco}>
        <Marco height={height}>
          <span className="text-xs text-[#6B5D3F]">Cargando mapa…</span>
        </Marco>
      </div>
    )
  }

  return (
    <Suspense fallback={<Marco height={height}><span className="text-xs text-[#6B5D3F]">Cargando mapa…</span></Marco>}>
      <LocationsMapInterno height={height} compact={compact} />
    </Suspense>
  )
}
