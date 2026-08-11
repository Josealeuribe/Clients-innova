import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { AdminClienteRow } from '@/shared/api/types'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils/adminFormatters'

interface Props {
  clientes: AdminClienteRow[]
}

export default function ClientesSection({ clientes }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return clientes

    return clientes.filter((cliente) =>
      `${cliente.nombres} ${cliente.apellidos} ${cliente.docNumero} ${cliente.email}`
        .toLowerCase()
        .includes(q),
    )
  }, [clientes, search])

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Clientes registrados
          </h2>
          <p className="text-sm text-[#9A7B50] mt-1">{clientes.length} clientes en total</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5D3F]" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#D4AF37]/12 overflow-x-auto" style={{ background: '#121009' }}>
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-xs text-[#6B5D3F] border-b border-[#D4AF37]/12">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Documento</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Ubicación</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium">Bono</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cliente) => (
              <tr key={cliente.id} className="border-b border-[#D4AF37]/8 last:border-0">
                <td className="px-4 py-3 text-[#F5E6C8] font-medium whitespace-nowrap">
                  {cliente.nombres} {cliente.apellidos}
                </td>
                <td className="px-4 py-3 text-[#C4A97A] whitespace-nowrap">
                  {cliente.docTipo}<br />
                  <span className="text-xs text-[#6B5D3F]">{cliente.docNumero}</span>
                </td>
                <td className="px-4 py-3 text-[#C4A97A]">
                  {cliente.email}<br />
                  <span className="text-xs text-[#6B5D3F]">{cliente.telefono}</span>
                </td>
                <td className="px-4 py-3 text-[#9A7B50] whitespace-nowrap">
                  {cliente.ciudad}, {cliente.departamento}
                </td>
                <td className="px-4 py-3 text-[#6B5D3F] whitespace-nowrap">
                  {formatDate(cliente.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {cliente.bono ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-[#D4AF37] text-xs font-semibold">{cliente.bono.premio.nombre}</span>
                      <StatusBadge
                        label={cliente.bono.estado === 'pendiente' ? 'Pendiente' : 'Canjeado'}
                        color={cliente.bono.estado === 'pendiente' ? '#eab308' : '#22c55e'}
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-[#4A3D28]">Sin bono</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#6B5D3F] text-sm">
                  No se encontraron clientes con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
