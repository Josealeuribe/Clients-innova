import { useState } from 'react'
import type { PuntoSerie } from '../utils/dashboardStats'
import { formatDiaCorto, formatNumero } from '../utils/adminFormatters'
import { colorDeSede, REJILLA, SUPERFICIE, TINTA } from './paleta'
import { FilaTooltip, Tooltip, useTooltip } from './Tooltip'
import { useAncho } from './useAncho'

// RITMO DE ENTREGA: ACUMULADO POR CASINO
//
// POR QUÉ ACUMULADO Y NO CANJES POR DÍA
//
// Con el volumen real de la promoción, el conteo diario oscila entre 0 y unos
// pocos canjes: la línea queda en diente de sierra y no se lee ninguna
// tendencia. El acumulado responde lo que el panel tiene que responder —cuánto
// lleva entregado cada casino y a qué ritmo— y las líneas se separan solas
// cuando una sede se adelanta.
//
// UN SOLO EJE
//
// Las tres series son la misma medida (bonos) en la misma escala, así que
// comparten eje. Nunca un segundo eje: dos escalas en un mismo plano inventan
// una relación que no está en los datos.
//
// LAS CIFRAS FINALES VAN EN LA LEYENDA, NO PEGADAS A CADA LÍNEA
//
// Con tres líneas que arrancan juntas en cero, las etiquetas de extremo se
// pisan en la parte izquierda, y separarlas a la fuerza las desprende de su
// línea. La leyenda las lleva ordenadas, el crosshair da el valor de cualquier
// día y la vista de tabla tiene la serie completa.

const ALTO = 200
const PAD = { arriba: 10, derecha: 10, abajo: 24, izquierda: 38 }

// Escalón "bonito" para el eje: 1, 2, 5, 10, 20, 50... Sin esto los rótulos
// salen en 7, 14, 21, que nadie lee de un vistazo.
function escalonBonito(maximo: number, objetivoTicks: number) {
  const crudo = Math.max(maximo, 1) / objetivoTicks
  const magnitud = 10 ** Math.floor(Math.log10(crudo))
  const normalizado = crudo / magnitud
  const paso = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10
  return paso * magnitud
}

/** Quita el prefijo comercial que comparten los tres casinos. */
function nombreCorto(sede: string) {
  return sede.replace('Gran Casino Cúcuta ', '')
}

interface Props {
  serie: PuntoSerie[]
  sedes: string[]
}

export default function LineasRitmo({ serie, sedes }: Props) {
  const { ref, ancho } = useAncho<HTMLDivElement>()
  const { estado, mostrar, ocultar } = useTooltip()
  const [indiceActivo, setIndiceActivo] = useState<number | null>(null)

  if (serie.length === 0 || sedes.length === 0) {
    return (
      <p className="text-sm" style={{ color: TINTA.tenue }}>
        Todavía no se ha entregado ningún bono, así que no hay ritmo que graficar.
      </p>
    )
  }

  const ultimo = serie[serie.length - 1]
  const maximo = Math.max(...sedes.map((s) => ultimo.acumulado[s] ?? 0), 1)
  const paso = escalonBonito(maximo, 4)
  const techo = Math.ceil(maximo / paso) * paso
  const ticks = Array.from({ length: Math.floor(techo / paso) + 1 }, (_, i) => i * paso)

  const anchoUtil = Math.max(ancho - PAD.izquierda - PAD.derecha, 10)
  const altoUtil = ALTO - PAD.arriba - PAD.abajo

  const x = (indice: number) =>
    PAD.izquierda + (serie.length === 1 ? anchoUtil / 2 : (indice / (serie.length - 1)) * anchoUtil)
  const y = (valor: number) => PAD.arriba + altoUtil - (valor / techo) * altoUtil

  const indiceDesdeX = (px: number) => {
    if (serie.length === 1) return 0
    const proporcion = (px - PAD.izquierda) / anchoUtil
    return Math.max(0, Math.min(serie.length - 1, Math.round(proporcion * (serie.length - 1))))
  }

  const detalleDe = (indice: number) => {
    const punto = serie[indice]
    return (
      <span className="flex flex-col gap-1">
        <span className="font-semibold">{formatDiaCorto(punto.dia)}</span>
        {sedes.map((sede) => (
          <FilaTooltip
            key={sede}
            color={colorDeSede(sede)}
            etiqueta={nombreCorto(sede)}
            valor={formatNumero(punto.acumulado[sede] ?? 0)}
          />
        ))}
      </span>
    )
  }

  // Rótulos del eje x: el primero, el último y uno intermedio. Más que eso se
  // amontonan en las pantallas de caja.
  const indicesRotulados =
    serie.length <= 2 ? serie.map((_, i) => i) : [0, Math.floor((serie.length - 1) / 2), serie.length - 1]

  return (
    <>
      {/* La leyenda lleva el total de cada sede: es la etiqueta directa que no
          se puede poner sobre líneas que arrancan pegadas en cero. */}
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3">
        {sedes.map((sede) => (
          <li key={sede} className="flex items-center gap-2 text-xs">
            <span className="h-0.5 w-4 rounded-full flex-shrink-0" style={{ background: colorDeSede(sede) }} />
            <span style={{ color: TINTA.apagada }}>{nombreCorto(sede)}</span>
            <span className="font-bold tabular-nums" style={{ color: TINTA.primaria }}>
              {formatNumero(ultimo.acumulado[sede] ?? 0)}
            </span>
          </li>
        ))}
      </ul>

      {/* El alto se reserva desde el primer render: sin esto la tarjeta salta
          cuando el ResizeObserver reporta el ancho y aparece el SVG. */}
      <div ref={ref} style={{ minHeight: ALTO }}>
        {ancho > 0 && (
          <svg
            width={ancho}
            height={ALTO}
            role="img"
            aria-label={`Bonos entregados acumulados por casino, del ${formatDiaCorto(serie[0].dia)} al ${formatDiaCorto(ultimo.dia)}.`}
            tabIndex={0}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 rounded-lg"
            onMouseMove={(evento) => {
              const caja = evento.currentTarget.getBoundingClientRect()
              const indice = indiceDesdeX(evento.clientX - caja.left)
              setIndiceActivo(indice)
              mostrar(evento, detalleDe(indice))
            }}
            onMouseLeave={() => {
              setIndiceActivo(null)
              ocultar()
            }}
            onFocus={(evento) => {
              const indice = serie.length - 1
              setIndiceActivo(indice)
              mostrar(evento, detalleDe(indice))
            }}
            onBlur={() => {
              setIndiceActivo(null)
              ocultar()
            }}
            onKeyDown={(evento) => {
              // Con el teclado se recorre día por día: el mismo dato que da el
              // mouse, sin necesitar mouse.
              if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return
              evento.preventDefault()
              const actual = indiceActivo ?? serie.length - 1
              const siguiente = Math.max(
                0,
                Math.min(serie.length - 1, actual + (evento.key === 'ArrowRight' ? 1 : -1)),
              )
              setIndiceActivo(siguiente)
              mostrar(evento, detalleDe(siguiente))
            }}
          >
            {/* Rejilla: línea de 1px SÓLIDA, un paso por encima del fondo.
                Nunca punteada — el punteado se lee como umbral o proyección. */}
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.izquierda}
                  x2={ancho - PAD.derecha}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke={REJILLA}
                  strokeWidth={1}
                />
                <text
                  x={PAD.izquierda - 8}
                  y={y(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={10}
                  fill={TINTA.minima}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatNumero(tick)}
                </text>
              </g>
            ))}

            {indicesRotulados.map((indice) => (
              <text
                key={indice}
                x={x(indice)}
                y={ALTO - 6}
                textAnchor={indice === 0 ? 'start' : indice === serie.length - 1 ? 'end' : 'middle'}
                fontSize={10}
                fill={TINTA.minima}
              >
                {formatDiaCorto(serie[indice].dia)}
              </text>
            ))}

            {indiceActivo != null && (
              <line
                x1={x(indiceActivo)}
                x2={x(indiceActivo)}
                y1={PAD.arriba}
                y2={PAD.arriba + altoUtil}
                stroke="rgba(212,175,55,0.45)"
                strokeWidth={1}
              />
            )}

            {sedes.map((sede) => {
              const color = colorDeSede(sede)
              const puntos = serie.map((p, i) => `${x(i)},${y(p.acumulado[sede] ?? 0)}`).join(' ')
              const valorFinal = ultimo.acumulado[sede] ?? 0

              return (
                <g key={sede}>
                  <polyline
                    points={puntos}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Marcador de extremo con anillo del color de la superficie:
                      sigue legible donde dos líneas se cruzan. */}
                  <circle
                    cx={x(serie.length - 1)}
                    cy={y(valorFinal)}
                    r={4}
                    fill={color}
                    stroke={SUPERFICIE}
                    strokeWidth={2}
                  />
                  {indiceActivo != null && (
                    <circle
                      cx={x(indiceActivo)}
                      cy={y(serie[indiceActivo].acumulado[sede] ?? 0)}
                      r={4}
                      fill={color}
                      stroke={SUPERFICIE}
                      strokeWidth={2}
                    />
                  )}
                </g>
              )
            })}
          </svg>
        )}
      </div>

      <Tooltip estado={estado} />
    </>
  )
}
