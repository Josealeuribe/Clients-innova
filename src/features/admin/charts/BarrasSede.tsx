import type { SedeBonos } from '../utils/dashboardStats'
import { formatNumero } from '../utils/adminFormatters'
import { colorDeSede, GROSOR_BARRA, HUECO_SUPERFICIE, TINTA } from './paleta'
import Leyenda from './Leyenda'
import { FilaTooltip, Tooltip, useTooltip } from './Tooltip'

// BONOS POR CASINO: BARRA APILADA HORIZONTAL
//
// POR QUÉ APILADA Y NO DOS BARRAS AGRUPADAS
//
// Entregados y pendientes son las dos partes de un mismo total —los bonos
// asignados a ese casino— así que la pregunta es parte-de-un-todo. Apiladas, el
// largo total ES el total asignado y se lee de una vez; agrupadas, hay que
// sumar mentalmente dos barras para saberlo.
//
// POR QUÉ HORIZONTAL
//
// "Gran Casino Cúcuta Ventura Plaza" no cabe bajo una columna sin girar el
// texto ni cortarlo. En horizontal la etiqueta se lee entera.
//
// POR QUÉ EL PENDIENTE ES EL MISMO COLOR LAVADO
//
// El color identifica a la SEDE y nada más. Si el pendiente llevara un matiz
// propio, el mismo color diría dos cosas distintas según la gráfica. Lavado, la
// sede se sigue reconociendo y el estado se lee por el relleno.

interface Props {
  filas: SedeBonos[]
}

export default function BarrasSede({ filas }: Props) {
  const { estado, mostrar, ocultar } = useTooltip()

  if (filas.length === 0) {
    return <p className="text-sm" style={{ color: TINTA.tenue }}>Aún no se ha asignado ningún bono.</p>
  }

  // Todas las barras se miden contra el mismo máximo: es lo que hace que dos
  // barras de distinta sede sean comparables a simple vista.
  const maximo = Math.max(...filas.map((f) => f.asignados), 1)

  return (
    <>
      {/* La leyenda explica el RELLENO (sólido / lavado), no la sede, así que
          su cuadrito va en gris neutro: con un matiz de sede se leería como un
          cuarto casino, y con el tono crema se leía como un color de serie más. */}
      <Leyenda
        entradas={[
          { etiqueta: 'Entregado', color: TINTA.tenue },
          { etiqueta: 'Pendiente de reclamo', color: TINTA.tenue, lavado: true },
        ]}
      />

      <div className="flex flex-col gap-4">
        {filas.map((fila) => {
          const color = colorDeSede(fila.sede)
          const anchoTotal = (fila.asignados / maximo) * 100
          const porcionEntregada = fila.asignados > 0 ? (fila.entregados / fila.asignados) * 100 : 0
          const porcionPendiente = 100 - porcionEntregada

          // Un solo detalle para mouse y teclado: antes el foco mostraba una
          // fila menos que el hover, y quien navega con tabulador veía menos
          // dato por el mismo gesto.
          const detalle = (
            <span className="flex flex-col gap-1">
              <span className="font-semibold">{fila.sede}</span>
              <FilaTooltip color={color} etiqueta="Entregados" valor={formatNumero(fila.entregados)} />
              <FilaTooltip etiqueta="Pendientes" valor={formatNumero(fila.pendientes)} />
              <FilaTooltip etiqueta="Asignados" valor={formatNumero(fila.asignados)} />
            </span>
          )

          return (
            <div key={fila.sede}>
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <span className="flex items-center gap-2 text-sm min-w-0">
                  {/* La identidad la carga esta marca, no el texto. */}
                  <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                  {/* El nombre ENVUELVE, no se corta. "Gran Casino Cúcuta Av. 5"
                      y "Gran Casino Cúcuta Ventura Plaza" truncados quedan los
                      dos como "Gran Casino Cúcuta...", indistinguibles — que es
                      justo lo que este panel no puede permitirse. */}
                  <span style={{ color: TINTA.secundaria }}>{fila.sede}</span>
                </span>
                <span className="text-xs flex-shrink-0 tabular-nums" style={{ color: TINTA.tenue }}>
                  {Math.round(fila.tasaReclamo * 100)}% reclamado
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* La barra vive en el espacio flexible y la cifra en una
                    columna de ancho fijo: así la etiqueta directa SIEMPRE cae
                    fuera del extremo de la barra, con aire, y nunca se recorta
                    por más larga que sea la barra. */}
                <div className="flex-1 min-w-0">
                  <div
                    tabIndex={0}
                    role="img"
                    aria-label={`${fila.sede}: ${fila.entregados} de ${fila.asignados} bonos entregados, ${fila.pendientes} pendientes.`}
                    className="flex outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 rounded-sm"
                    style={{ height: GROSOR_BARRA, gap: HUECO_SUPERFICIE }}
                    onMouseMove={(e) => mostrar(e, detalle)}
                    onMouseLeave={ocultar}
                    onFocus={(e) => mostrar(e, detalle)}
                    onBlur={ocultar}
                  >
                    <div style={{ width: `${anchoTotal}%`, display: 'flex', gap: HUECO_SUPERFICIE, minWidth: 0 }}>
                      {fila.entregados > 0 && (
                        <div
                          style={{
                            // El hueco de 2px se descuenta de los dos lados que
                            // se tocan, para que la suma siga midiendo el 100%
                            // del total asignado y la proporción no mienta.
                            width: fila.pendientes > 0 ? `calc(${porcionEntregada}% - 1px)` : '100%',
                            background: color,
                            // Extremo del dato redondeado, base cuadrada. Si no
                            // hay pendiente, este segmento ES el extremo.
                            borderRadius: fila.pendientes > 0 ? '3px 0 0 3px' : '3px 4px 4px 3px',
                          }}
                        />
                      )}
                      {fila.pendientes > 0 && (
                        <div
                          style={{
                            width: fila.entregados > 0 ? `calc(${porcionPendiente}% - 1px)` : '100%',
                            background: color,
                            opacity: 0.26,
                            borderRadius: fila.entregados > 0 ? '0 4px 4px 0' : '3px 4px 4px 3px',
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className="w-24 text-right text-xs tabular-nums flex-shrink-0"
                  style={{ color: TINTA.apagada }}
                >
                  <span className="font-bold" style={{ color: TINTA.primaria }}>{formatNumero(fila.entregados)}</span>
                  {' de '}
                  {formatNumero(fila.asignados)}
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
