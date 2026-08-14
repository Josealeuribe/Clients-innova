// Indicador de presencia de una cuenta de personal.
//
// TRES ESTADOS, NO DOS
//
// `enLinea` llega `undefined` cuando la API que responde todavía no tiene
// presencia (el front y el backend son dos servicios de Render que se
// despliegan por separado). En ese caso se dice "Sin datos" en vez de "Fuera de
// línea": afirmar que alguien no está cuando en realidad no se sabe es
// exactamente el error que un panel de monitoreo no puede cometer.

interface Props {
  enLinea: boolean | undefined
  /** Texto de apoyo: "hace 12 min", "nunca ha entrado". */
  detalle?: string
}

export default function PresenciaBadge({ enLinea, detalle }: Props) {
  const estado =
    enLinea === undefined
      ? { label: 'Sin datos', color: '#6B5D3F' }
      : enLinea
        ? { label: 'Activo', color: '#22c55e' }
        : { label: 'Fuera de línea', color: '#6B5D3F' }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{
        color: estado.color,
        background: `${estado.color}18`,
        border: `1px solid ${estado.color}30`,
      }}
      title={detalle}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0">
        {/* El halo que late solo se dibuja para quien está dentro: es lo que
            hace que el estado se lea de un vistazo sin tener que buscar el
            texto en una lista de quince cuentas. */}
        {enLinea && (
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping"
            style={{ background: estado.color }}
          />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: estado.color }} />
      </span>
      {estado.label}
    </span>
  )
}
