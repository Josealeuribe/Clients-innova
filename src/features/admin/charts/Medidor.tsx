import { TINTA } from './paleta'

// MEDIDOR: UNA RAZÓN CONTRA SU TOTAL
//
// Es la forma correcta para "qué proporción de los bonos ya se reclamó": un
// solo número contra un límite. Una torta de dos porciones diría lo mismo
// ocupando cinco veces el espacio y obligando a comparar áreas, que es lo que
// peor hace el ojo.
//
// La pista sin llenar es un paso más claro del MISMO matiz, no un gris: así el
// estado se lee a lo largo de toda la barra y no solo en el trozo lleno.
//
// El relleno NO usa colores de estado (verde/ámbar/rojo). Una tasa de reclamo
// baja no es un error del casino: puede ser un premio recién lanzado o una
// vigencia que todavía tiene semanas por delante. Pintarla de rojo afirmaría un
// juicio que el dato no sostiene.

interface Props {
  /** Entre 0 y 1. */
  razon: number
  etiquetaIzquierda: string
  etiquetaDerecha: string
  color?: string
}

export default function Medidor({ razon, etiquetaIzquierda, etiquetaDerecha, color = '#b1900f' }: Props) {
  const porcentaje = Math.max(0, Math.min(100, razon * 100))

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-2xl font-black tabular-nums" style={{ color: TINTA.primaria, fontFamily: "'Inter', sans-serif" }}>
          {Math.round(porcentaje)}%
        </span>
        <span className="text-xs text-right" style={{ color: TINTA.tenue }}>{etiquetaDerecha}</span>
      </div>

      <div
        role="meter"
        aria-valuenow={Math.round(porcentaje)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={etiquetaIzquierda}
        className="relative h-2 rounded-full overflow-hidden"
      >
        {/* Pista: el MISMO matiz a baja opacidad, no un gris. Va como capa
            aparte y no como `backgroundColor` del contenedor para que el paso
            claro se derive del color que se reciba, sin un rgba fijo al lado
            que lo contradiga. */}
        <div className="absolute inset-0" style={{ background: color, opacity: 0.22 }} />
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${porcentaje}%`, background: color }} />
      </div>

      <p className="text-xs mt-2" style={{ color: TINTA.apagada }}>{etiquetaIzquierda}</p>
    </div>
  )
}
