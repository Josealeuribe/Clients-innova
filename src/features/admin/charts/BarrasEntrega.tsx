import { formatNumero } from '../utils/adminFormatters'
import { colorDeSede, GROSOR_BARRA, TINTA } from './paleta'
import { FilaTooltip, Tooltip, useTooltip } from './Tooltip'

// DÓNDE SE ENTREGARON DE VERDAD
//
// Esta gráfica NO repite la de "bonos por casino". Aquella agrupa por la sede
// del PREMIO —a qué casino manda el bono al cliente— y esta por la sede donde
// la cajera lo entregó. El esquema guarda las dos columnas a propósito (ver
// BonoGanado.sedeCanjeId) precisamente para poder comparar una con otra.
//
// Es la dimensión de caja: de aquí sale el dinero, y es la misma con la que se
// calcula el modal de dinero entregado.
//
// Una sola medida por sede, así que no lleva leyenda: el nombre de cada fila y
// su marca de color ya dicen quién es quién.

interface Props {
  filas: { sede: string; entregados: number }[]
}

export default function BarrasEntrega({ filas }: Props) {
  const { estado, mostrar, ocultar } = useTooltip()

  if (filas.length === 0) {
    return <p className="text-sm" style={{ color: TINTA.tenue }}>Todavía no se ha entregado ningún bono.</p>
  }

  const maximo = Math.max(...filas.map((f) => f.entregados), 1)
  const total = filas.reduce((t, f) => t + f.entregados, 0)

  return (
    <>
      <div className="flex flex-col gap-4">
        {filas.map((fila) => {
          const color = colorDeSede(fila.sede)
          const ancho = (fila.entregados / maximo) * 100
          const cuota = total > 0 ? Math.round((fila.entregados / total) * 100) : 0

          const detalle = (
            <span className="flex flex-col gap-1">
              <span className="font-semibold">{fila.sede}</span>
              <FilaTooltip color={color} etiqueta="Entregados aquí" valor={formatNumero(fila.entregados)} />
              <FilaTooltip etiqueta="Del total entregado" valor={`${cuota}%`} />
            </span>
          )

          return (
            <div key={fila.sede}>
              {/* El nombre completo, envolviendo si hace falta: cortado, los
                  tres casinos quedan como "Gran Casino Cúcuta...". */}
              <div className="flex items-start gap-2 text-sm mb-1.5 min-w-0">
                <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0 mt-1" style={{ background: color }} />
                <span style={{ color: TINTA.secundaria }}>{fila.sede}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div
                    tabIndex={0}
                    role="img"
                    aria-label={`${fila.sede}: ${fila.entregados} bonos entregados, ${cuota}% del total.`}
                    className="outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 rounded-sm"
                    style={{ height: GROSOR_BARRA }}
                    onMouseMove={(e) => mostrar(e, detalle)}
                    onMouseLeave={ocultar}
                    onFocus={(e) => mostrar(e, detalle)}
                    onBlur={ocultar}
                  >
                    {/* Extremo del dato redondeado 4px, base cuadrada contra el
                        eje: la barra crece desde una sola línea de partida. */}
                    <div
                      className="h-full"
                      style={{ width: `${ancho}%`, background: color, borderRadius: '2px 4px 4px 2px' }}
                    />
                  </div>
                </div>
                <span className="w-20 text-right text-xs tabular-nums flex-shrink-0" style={{ color: TINTA.apagada }}>
                  <span className="font-bold" style={{ color: TINTA.primaria }}>{formatNumero(fila.entregados)}</span>
                  {' · '}{cuota}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <Tooltip estado={estado} />
    </>
  )
}
