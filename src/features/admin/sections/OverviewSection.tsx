import { CircleCheck, Clock, Gift, Users } from 'lucide-react'
import type { AdminClienteRow } from '@/shared/api/types'
import { buildAdminStats } from '../utils/adminStats'
import { formatDate } from '../utils/adminFormatters'

interface Props {
  clientes: AdminClienteRow[]
}

export default function OverviewSection({ clientes }: Props) {
  const stats = buildAdminStats(clientes)
  if (!stats) return null

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Vista General
        </h2>
        <p className="text-sm text-[#9A7B50] mt-1">Estado real de la promoción "Gira y Gana"</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clientes registrados', value: stats.totalClientes, icon: Users, color: '#D4AF37' },
          { label: 'Bonos pendientes', value: stats.pendientes, icon: Clock, color: '#eab308' },
          { label: 'Bonos canjeados', value: stats.reclamados, icon: CircleCheck, color: '#22c55e' },
          { label: 'Sin bono ganado', value: stats.sinBono, icon: Gift, color: '#6B5D3F' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#D4AF37]/15 p-5"
            style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}
          >
            <card.icon size={24} style={{ color: card.color }} className="mb-3" />
            <p className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {card.value}
            </p>
            <p className="text-xs text-[#6B5D3F] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#D4AF37]/12 p-5" style={{ background: '#121009' }}>
          <h3 className="font-bold text-[#F5E6C8] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            Bonos por premio
          </h3>
          {stats.porPremio.length === 0 ? (
            <p className="text-sm text-[#6B5D3F]">Aún no se ha asignado ningún bono.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.porPremio.map(([nombre, cantidad]) => (
                <div key={nombre} className="flex items-center justify-between text-sm">
                  <span className="text-[#C4A97A]">{nombre}</span>
                  <span className="text-[#D4AF37] font-bold">{cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#D4AF37]/12 p-5" style={{ background: '#121009' }}>
          <h3 className="font-bold text-[#F5E6C8] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            Últimos registros
          </h3>
          {stats.recientes.length === 0 ? (
            <p className="text-sm text-[#6B5D3F]">Todavía no hay clientes registrados.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.recientes.map((cliente) => (
                <div key={cliente.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#C4A97A]">
                    {cliente.nombres} {cliente.apellidos}
                  </span>
                  <span className="text-xs text-[#6B5D3F]">{formatDate(cliente.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
