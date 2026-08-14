import type { CanjeHistorialRow } from '@/shared/api/types'
import Paginacion from '@/shared/components/Paginacion'
import { usePaginacion } from '@/shared/hooks/usePaginacion'
import CajeroError from '../components/CajeroError'
import CajeroLoading from '../components/CajeroLoading'
import { formatDateTime } from '../utils/cajeroFormatters'


interface Props {
  historial: CanjeHistorialRow[] | null
  error: string | null
  soloPropios: boolean
}

export default function HistorialSection({ historial, error, soloPropios }: Props) {
  // Clave distinta según el alcance: el historial propio de una cajera y el
  // listado completo que ve el admin son dos listas de largo distinto, y
  // compartir la página entre ambas dejaría a una de las dos fuera de rango.
  const { visibles, pagina, setPagina, totalPaginas, total, desde, hasta } = usePaginacion(
    historial,
    soloPropios ? 'cajero.historial.propios' : 'cajero.historial.todos',
  )

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
          {soloPropios ? 'Mis canjes' : 'Todos los canjes'}
        </h2>
        <p className="text-sm text-[#9A7B50] mt-1">
          {historial
            ? soloPropios
              ? `${historial.length} ${historial.length === 1 ? 'bono entregado' : 'bonos entregados'} por ti`
              : `${historial.length} bonos entregados en total`
            : 'Cargando...'}
        </p>
      </div>

      {error && <CajeroError message={error} centered />}
      {!historial && !error && <CajeroLoading label="Cargando historial..." />}

      {historial && (
        <>
          {/* Sin ancho mínimo ni `overflow-x-auto`: la tabla mide lo que su
              contenedor y las columnas menos críticas se retiran al angostarse.
              En el mostrador esto importa el doble — la cajera trabaja de pie y
              arrastrar una tabla de lado a lado con el cliente enfrente era
              tiempo perdido. */}
          <div className="rounded-2xl border border-[#D4AF37]/12" style={{ background: '#121009' }}>
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-left text-xs text-[#6B5D3F] border-b border-[#D4AF37]/12">
                  <th className="px-4 py-3 font-medium w-[28%] sm:w-[18%]">Código</th>
                  <th className="px-4 py-3 font-medium w-[32%] sm:w-[22%]">Premio</th>
                  <th className="px-4 py-3 font-medium w-[40%] sm:w-[24%]">Cliente</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell lg:w-[16%]">Sede</th>
                  {!soloPropios && (
                    <th className="px-4 py-3 font-medium hidden xl:table-cell xl:w-[12%]">Canjeado por</th>
                  )}
                  <th className="px-4 py-3 font-medium hidden md:table-cell md:w-[18%] lg:w-[14%]">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((item) => (
                  <tr key={item.codigo} className="border-b border-[#D4AF37]/8 last:border-0 align-top">
                    <td className="px-4 py-3 text-[#D4AF37] font-mono truncate" title={item.codigo}>
                      {item.codigo}
                    </td>
                    <td className="px-4 py-3 text-[#C4A97A] truncate" title={item.premio.nombre}>
                      {item.premio.nombre}
                    </td>
                    <td className="px-4 py-3 text-[#F5E6C8]">
                      <span
                        className="block truncate"
                        title={`${item.cliente.nombres} ${item.cliente.apellidos}`}
                      >
                        {item.cliente.nombres} {item.cliente.apellidos}
                      </span>
                      <span className="block truncate text-xs text-[#6B5D3F]">{item.cliente.docNumero}</span>
                    </td>
                    <td className="px-4 py-3 text-[#C4A97A] hidden lg:table-cell truncate" title={item.sede ?? ''}>
                      {item.sede || '—'}
                    </td>
                    {!soloPropios && (
                      <td
                        className="px-4 py-3 text-[#9A7B50] hidden xl:table-cell truncate"
                        title={item.canjeadoPor ?? ''}
                      >
                        {item.canjeadoPor || '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-[#6B5D3F] hidden md:table-cell truncate">
                      {item.canjeadoEn ? formatDateTime(item.canjeadoEn) : '—'}
                    </td>
                  </tr>
                ))}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={soloPropios ? 5 : 6} className="px-4 py-10 text-center text-[#6B5D3F] text-sm">
                      {soloPropios ? 'Todavía no has entregado ningún bono.' : 'Aún no se ha canjeado ningún bono.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            total={total}
            desde={desde}
            hasta={hasta}
            onCambiar={setPagina}
            etiqueta="canjes"
          />
        </>
      )}
    </div>
  )
}
