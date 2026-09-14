import type { PremioBonos } from '../utils/dashboardStats'
import { formatNumero } from '../utils/adminFormatters'
import { GROSOR_BARRA, HUECO_SUPERFICIE, TINTA } from './paleta'
import Leyenda from './Leyenda'
import { FilaTooltip, Tooltip, useTooltip } from './Tooltip'

// BONOS POR PREMIO
//
// POR QUÉ TODAS LAS BARRAS SON DEL MISMO COLOR
//
// Los premios son categorías nominales: no hay un orden natural entre "Bono de
// $5.000" y "Cartón de Bingo". Pintar cada barra de un color distinto gastaría
// el canal de identidad en algo que el largo de la barra ya dice, y siete
// matices dejan de distinguirse entre sí. Y pintarlas más oscuras según su
// valor sería peor: doblaría el largo en color sin agregar información.
//
// Una serie, un color. La leyenda de dos entradas es por el estado del bono
// (entregado / pendiente), no por el premio: el premio lo dice su etiqueta.

interface Props {
  filas: PremioBonos[]
}

export default function BarrasPremio({ filas }: Props) {
  const { estado, mostrar, ocultar } = useTooltip()

  if (filas.length === 0) {
    return <p className="text-sm" style={{ color: TINTA.tenue }}>Aún no se ha asignado ningún bono.</p>
  }

  const COLOR = '#b1900f'
  const maximo = Math.max(...filas.map((f) => f.total), 1)

  return (
    <>
      <Leyenda
        entradas={[
          { etiqueta: 'Entregado', color: COLOR },
          { etiqueta: 'Pendiente de reclamo', color: COLOR, lavado: true },
        ]}
      />


      <div className="flex flex-col gap-3">
        {filas.map((fila) => {
          const anchoTotal = (fila.total / maximo) * 100
          const porcionEntregada = fila.total > 0 ? (fila.entregados / fila.total) * 100 : 0

          const detalle = (
            <span className="flex flex-col gap-1">
              <span className="font-semibold">{fila.nombre}</span>
              <FilaTooltip color={COLOR} etiqueta="Entregados" valor={formatNumero(fila.entregados)} />
              <FilaTooltip etiqueta="Pendientes" valor={formatNumero(fila.pendientes)} />
            </span>
          )

          return (
            <div key={fila.nombre}>
              <div className="text-sm mb-1" style={{ color: TINTA.secundaria }}>{fila.nombre}</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div
                    tabIndex={0}
                    role="img"
                    aria-label={`${fila.nombre}: ${fila.total} bonos, ${fila.entregados} entregados y ${fila.pendientes} pendientes.`}
                    className="flex outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 rounded-sm"
                    style={{ height: GROSOR_BARRA - 6 }}
                    onMouseMove={(e) => mostrar(e, detalle)}
                    onMouseLeave={ocultar}
                    onFocus={(e) => mostrar(e, detalle)}
                    onBlur={ocultar}
                  >
                    <div style={{ width: `${anchoTotal}%`, display: 'flex', gap: HUECO_SUPERFICIE, minWidth: 0 }}>
                      {fila.entregados > 0 && (
                        <div
                          style={{
                            width: fila.pendientes > 0 ? `calc(${porcionEntregada}% - 1px)` : '100%',
                            background: COLOR,
                            borderRadius: fila.pendientes > 0 ? '3px 0 0 3px' : '3px 4px 4px 3px',
                          }}
                        />
                      )}
                      {fila.pendientes > 0 && (
                        <div
                          style={{
                            width: fila.entregados > 0 ? `calc(${100 - porcionEntregada}% - 1px)` : '100%',
                            background: COLOR,
                            opacity: 0.26,
                            borderRadius: fila.entregados > 0 ? '0 4px 4px 0' : '3px 4px 4px 3px',
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* Columna fija: la cifra nunca se mete dentro de la barra, así
                    que no hay forma de que quede recortada. */}
                <span className="w-10 text-right text-xs tabular-nums flex-shrink-0 font-bold" style={{ color: TINTA.primaria }}>
                  {formatNumero(fila.total)}
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
