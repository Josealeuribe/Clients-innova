import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { AdminCanjeRow } from '@/shared/api/types'
import AdminError from '../components/AdminError'
import AdminLoading from '../components/AdminLoading'
import { formatDateTime, formatDemora } from '../utils/adminFormatters'

interface Props {
  canjes: AdminCanjeRow[] | null
  error: string | null
}

export default function CanjesSection({ canjes, error }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!canjes) return []
    const q = search.trim().toLowerCase()
    if (!q) return canjes

    return canjes.filter((canje) =>
      `${canje.cliente.nombres} ${canje.cliente.apellidos} ${canje.cliente.docNumero} ${canje.codigo} ${canje.sede ?? ''} ${canje.canjeadoPor ?? ''}`
        .toLowerCase()
        .includes(q),
    )
  }, [canjes, search])

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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60"
            />
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/12 overflow-x-auto" style={{ background: '#121009' }}>
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-xs text-[#6B5D3F] border-b border-[#D4AF37]/12">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Premio</th>
                  <th className="px-4 py-3 font-medium">Sede</th>
                  <th className="px-4 py-3 font-medium">Cajero</th>
                  <th className="px-4 py-3 font-medium">Entregado</th>
                  <th className="px-4 py-3 font-medium">Demora</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((canje) => (
                  <tr key={canje.codigo} className="border-b border-[#D4AF37]/8 last:border-0">
                    <td className="px-4 py-3 text-[#D4AF37] font-mono whitespace-nowrap">{canje.codigo}</td>
                    <td className="px-4 py-3 text-[#F5E6C8] whitespace-nowrap">
                      {canje.cliente.nombres} {canje.cliente.apellidos}<br />
                      <span className="text-xs text-[#6B5D3F]">
                        {canje.cliente.docTipo}: {canje.cliente.docNumero}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#C4A97A] whitespace-nowrap">{canje.premio.nombre}</td>
                    <td className="px-4 py-3 text-[#C4A97A] whitespace-nowrap">{canje.sede || '—'}</td>
                    <td className="px-4 py-3 text-[#9A7B50] whitespace-nowrap">{canje.canjeadoPor || '—'}</td>
                    <td className="px-4 py-3 text-[#6B5D3F] whitespace-nowrap">
                      {canje.canjeadoEn ? formatDateTime(canje.canjeadoEn) : '—'}
                    </td>
                    <td className="px-4 py-3 text-[#6B5D3F] whitespace-nowrap">
                      {formatDemora(canje.horasHastaCanje)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
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
        </>
      )}
    </div>
  )
}
