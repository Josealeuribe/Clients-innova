import { useCallback, useState, type ReactNode } from 'react'
import { TINTA } from './paleta'

// TOOLTIP DE LAS GRÁFICAS
//
// El tooltip AGREGA, nunca es la única forma de leer un valor: cada gráfica de
// este panel lleva además etiquetas directas y una vista de tabla. Si alguien no
// puede pasar el mouse por encima —teclado, lector de pantalla, celular— el dato
// sigue estando.
//
// Por eso mismo se abre con `focus` y no solo con `hover`: recorrer las barras
// con el tabulador muestra exactamente lo mismo que el mouse.

export interface EstadoTooltip {
  x: number
  y: number
  contenido: ReactNode
}

export function useTooltip() {
  const [estado, setEstado] = useState<EstadoTooltip | null>(null)

  // El posicionamiento es relativo al contenedor de la gráfica, no a la
  // ventana: la tarjeta scrollea con la página y coordenadas de viewport
  // dejarían el tooltip flotando lejos de su barra.
  const mostrar = useCallback((evento: { currentTarget: Element; clientX?: number; clientY?: number }, contenido: ReactNode) => {
    const marca = evento.currentTarget.getBoundingClientRect()
    const contenedor = evento.currentTarget.closest('[data-grafica]')?.getBoundingClientRect()
    if (!contenedor) return

    // Con mouse sigue al cursor en horizontal; con teclado (sin clientX) se
    // ancla al centro de la marca enfocada.
    const x = (evento.clientX ?? marca.left + marca.width / 2) - contenedor.left
    const y = marca.top - contenedor.top
    setEstado({ x, y, contenido })
  }, [])

  const ocultar = useCallback(() => setEstado(null), [])

  return { estado, mostrar, ocultar }
}

export function Tooltip({ estado }: { estado: EstadoTooltip | null }) {
  if (!estado) return null

  return (
    <div
      // No captura el mouse: si lo hiciera, aparecer bajo el cursor dispararía
      // el `mouseleave` de la barra y el tooltip parpadearía sin parar.
      className="pointer-events-none absolute z-20 rounded-xl border px-3 py-2 text-xs whitespace-nowrap"
      style={{
        left: estado.x,
        top: estado.y,
        // Centrado sobre el punto y levantado por encima de la marca, para no
        // taparla justo cuando se la está señalando.
        transform: 'translate(-50%, calc(-100% - 8px))',
        background: 'rgba(18,16,9,0.97)',
        borderColor: 'rgba(212,175,55,0.35)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.55)',
        color: TINTA.primaria,
      }}
      role="tooltip"
    >
      {estado.contenido}
    </div>
  )
}

/** Fila de tooltip: la marca de color al lado del texto, nunca el texto de color. */
export function FilaTooltip({ color, etiqueta, valor }: { color?: string; etiqueta: string; valor: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      {color && <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />}
      <span style={{ color: TINTA.apagada }}>{etiqueta}</span>
      <span className="font-semibold tabular-nums" style={{ color: TINTA.primaria }}>{valor}</span>
    </span>
  )
}
