import { CircleCheck, Clock, Gift, Users } from 'lucide-react'
import type { AdminClienteRow } from '@/shared/api/types'
import { useVigencias } from '@/shared/hooks/useVigencias'
import { RegistroVigencias, VigenciaResumen } from '@/shared/components/VigenciaPromocion'
import { buildAdminStats } from '../utils/adminStats'
import { formatDate } from '../utils/adminFormatters'

interface Props {
  clientes: AdminClienteRow[]
}

export default function OverviewSection({ clientes }: Props) {
  // La vigencia va en la primera pantalla del admin, no escondida en su
  // sección: "Bonos pendientes: 22" cambia de significado por completo según si
  // el plazo para redimirlos vence mañana o el mes entrante.
  const { datos: vigencias, error: vigenciasError } = useVigencias()
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

      <VigenciaResumen datos={vigencias} error={vigenciasError} className="mb-6" />

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

      {/* REPARTO ENTRE CASINOS — solo premios generales.
          Los cartones de la campaña de bingo se cuentan aparte: son de una sola
          sede y mezclarlos haría ver a Ventura Plaza como desbalanceada cuando
          no lo está. */}
      <div className="rounded-2xl border border-[#D4AF37]/12 p-5 mb-6" style={{ background: '#121009' }}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Reparto de premios generales por casino
            </h3>
            <p className="text-xs text-[#6B5D3F] mt-1">
              El sistema favorece a la sede más atrasada en cada giro, así que esto tiende a igualarse.
            </p>
          </div>
          {stats.totalPromocionales > 0 && (
            <div className="rounded-xl border border-[#6A00B8]/30 px-3 py-2" style={{ background: 'rgba(106,0,184,0.10)' }}>
              <p className="text-[10px] text-[#C77DFF] font-bold tracking-wider">CAMPAÑA BINGO (APARTE)</p>
              <p className="text-sm text-[#F5E6C8] font-bold mt-0.5">
                {stats.totalPromocionales} cartón{stats.totalPromocionales === 1 ? '' : 'es'}
                <span className="text-xs font-normal text-[#9A7B50]">
                  {' '}· {stats.promocionalesPendientes} sin redimir
                </span>
              </p>
            </div>
          )}
        </div>

        {stats.porSedeGenerales.length === 0 ? (
          <p className="text-sm text-[#6B5D3F]">Aún no se ha asignado ningún premio general.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.porSedeGenerales.map(([sede, cantidad]) => {
              const porcentaje = stats.totalGenerales
                ? Math.round((cantidad / stats.totalGenerales) * 100)
                : 0
              // 33% es el reparto perfecto entre 3 sedes. Se marca la desviación
              // para que el desbalance se vea sin tener que calcularlo.
              const desvio = porcentaje - 33
              const color = Math.abs(desvio) <= 8 ? '#22c55e' : Math.abs(desvio) <= 18 ? '#eab308' : '#ef4444'
              return (
                <div key={sede}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#C4A97A]">{sede}</span>
                    <span className="text-xs">
                      <span className="font-bold" style={{ color }}>{cantidad}</span>
                      <span className="text-[#6B5D3F]"> · {porcentaje}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(212,175,55,0.10)' }}>
                    <div className="h-full rounded-full" style={{ width: `${porcentaje}%`, background: color }} />
                  </div>
                </div>
              )
            })}
            <p className="text-[10px] text-[#4A3D28] mt-1">
              Reparto ideal entre 3 casinos: 33% cada uno · {stats.totalGenerales} premios generales en total.
            </p>
          </div>
        )}
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

      {/* El registro premio por premio, con cuántos bonos vivos quedan en cada
          uno. Es lo que convierte la fecha en una decisión: un premio que vence
          con 8 clientes esperando pide una campaña; uno con 0 no pide nada. */}
      <div className="mt-6">
        <RegistroVigencias
          datos={vigencias}
          error={vigenciasError}
          mostrarPendientes
          titulo="Vigencia por premio"
          descripcion="Hasta cuándo se redime cada uno. El historial de cambios está en la sección Vigencias."
        />
      </div>
    </div>
  )
}
