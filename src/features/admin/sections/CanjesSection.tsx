import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { AdminCanjeRow } from '@/shared/api/types'
import Paginacion from '@/shared/components/Paginacion'
import { usePaginacion } from '@/shared/hooks/usePaginacion'
import AdminError from '../components/AdminError'
import AdminLoading from '../components/AdminLoading'
import { formatDateTime, formatDemora } from '../utils/adminFormatters'

interface Props {
  canjes: AdminCanjeRow[] | null
  error: string | null
}

export default function CanjesSection({ canjes, error }: Props) {
  const [search, setSearch] = useState('')

  // Devuelve null —y no []— mientras se carga: para la paginación no es lo
  // mismo "no hay canjes" que "todavía no se sabe". Con [] daría por buena una
  // sola página y borraría la página guardada antes de que lleguen los datos.
  const filtered = useMemo(() => {
    if (!canjes) return null
    const q = search.trim().toLowerCase()
    if (!q) return canjes

    return canjes.filter((canje) =>
      `${canje.cliente.nombres} ${canje.cliente.apellidos} ${canje.cliente.docNumero} ${canje.codigo} ${canje.sede ?? ''} ${canje.canjeadoPor ?? ''}`
        .toLowerCase()
        .includes(q),
    )
  }, [canjes, search])

  const { visibles, pagina, setPagina, totalPaginas, total, desde, hasta } = usePaginacion(
    filtered,
    'admin.canjes',
  )

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Auditoría de Canjes
        </h2>
        <p className="text-sm text-[#9A7B50] mt-1">
          {canjes ? `${canjes.length} bonos entregados en total` : 'Cargando...'}
        </p>
      </div>

      {error && <AdminError message={error} centered />}
      {!canjes && !error && <AdminLoading label="Cargando auditoría..." />}

      {canjes && (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5D3F]" />
            <input
              type="text"
              placeholder="Buscar por cliente, cédula, código, sede o cajero..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPagina(1)
              }}
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60"
            />
          </div>

          {/* Siete columnas eran las que peor cabían: de aquí salía el
              `min-w-[900px]`. Con `table-fixed` la tabla mide lo que su
              contenedor y las columnas de auditoría fina (sede, cajero, fecha,
              demora) se van retirando por prioridad al angostarse. Código,
              cliente y premio no se ocultan nunca. */}
          <div className="rounded-2xl border border-[#D4AF37]/12" style={{ background: '#121009' }}>
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-left text-xs text-[#6B5D3F] border-b border-[#D4AF37]/12">
                  <th className="px-4 py-3 font-medium w-[28%] sm:w-[16%] lg:w-[12%]">Código</th>
                  <th className="px-4 py-3 font-medium w-[42%] sm:w-[30%] lg:w-[22%]">Cliente</th>
                  <th className="px-4 py-3 font-medium w-[30%] sm:w-[22%] lg:w-[18%]">Premio</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell lg:w-[14%]">Sede</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell lg:w-[14%]">Cajero</th>
                  <th className="px-4 py-3 font-medium hidden xl:table-cell xl:w-[13%]">Entregado</th>
                  <th className="px-4 py-3 font-medium hidden xl:table-cell xl:w-[7%]">Demora</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((canje) => (
                  <tr key={canje.codigo} className="border-b border-[#D4AF37]/8 last:border-0 align-top">
                    <td className="px-4 py-3 text-[#D4AF37] font-mono truncate" title={canje.codigo}>
                      {canje.codigo}
                    </td>
                    <td className="px-4 py-3 text-[#F5E6C8]">
                      <span
                        className="block truncate"
                        title={`${canje.cliente.nombres} ${canje.cliente.apellidos}`}
                      >
                        {canje.cliente.nombres} {canje.cliente.apellidos}
                      </span>
                      <span className="block truncate text-xs text-[#6B5D3F]">
                        {canje.cliente.docTipo}: {canje.cliente.docNumero}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#C4A97A] truncate" title={canje.premio.nombre}>
                      {canje.premio.nombre}
                    </td>
                    <td className="px-4 py-3 text-[#C4A97A] hidden lg:table-cell truncate" title={canje.sede ?? ''}>
                      {canje.sede || '—'}
                    </td>
                    <td
                      className="px-4 py-3 text-[#9A7B50] hidden lg:table-cell truncate"
                      title={canje.canjeadoPor ?? ''}
                    >
                      {canje.canjeadoPor || '—'}
                    </td>
                    <td className="px-4 py-3 text-[#6B5D3F] hidden xl:table-cell truncate">
                      {canje.canjeadoEn ? formatDateTime(canje.canjeadoEn) : '—'}
                    </td>
                    <td className="px-4 py-3 text-[#6B5D3F] hidden xl:table-cell truncate">
                      {formatDemora(canje.horasHastaCanje)}
                    </td>
                  </tr>
                ))}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[#6B5D3F] text-sm">
                      {canjes.length === 0
                        ? 'Todavía no se ha entregado ningún bono.'
                        : 'No se encontraron canjes con ese criterio.'}
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
