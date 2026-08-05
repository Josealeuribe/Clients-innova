import { useEffect, useMemo, useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import { adminFetchClientes, ApiError } from '@/shared/api/client'
import type { AdminClienteRow } from '@/shared/api/types'
import StaffSidebarLayout from '@/shared/components/StaffSidebarLayout'
import { LayoutDashboard, Users, Search, Loader2, Gift, CircleCheck, Clock } from 'lucide-react'

interface Props {
  navigate: (page: Page) => void
}

type AdminSection = 'overview' | 'clientes'

const NAV_ITEMS = [
  { id: 'overview' as AdminSection, label: 'Vista General', icon: LayoutDashboard },
  { id: 'clientes' as AdminSection, label: 'Clientes', icon: Users },
]

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}>
      {label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminPage({ navigate }: Props) {
  const { staff, token, loading: authLoading } = useAuth()
  const [section, setSection] = useState<AdminSection>('overview')
  const [clientes, setClientes] = useState<AdminClienteRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!staff || staff.rol !== 'admin') {
      navigate('landing')
      return
    }
    if (!token) return
    adminFetchClientes(token)
      .then((res) => setClientes(res.clientes))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar la información.'))
  }, [authLoading, staff, token, navigate])

  const filtered = useMemo(() => {
    if (!clientes) return []
    const q = search.trim().toLowerCase()
    if (!q) return clientes
    return clientes.filter((c) =>
      `${c.nombres} ${c.apellidos} ${c.docNumero} ${c.email}`.toLowerCase().includes(q),
    )
  }, [clientes, search])

  // Estadísticas de la Vista General: se calculan sobre los mismos datos ya
  // cargados para la tabla de clientes — no hace falta un endpoint aparte.
  const stats = useMemo(() => {
    if (!clientes) return null
    const conBono = clientes.filter((c) => c.bono)
    const pendientes = conBono.filter((c) => c.bono?.estado === 'pendiente')
    const reclamados = conBono.filter((c) => c.bono?.estado === 'reclamado')
    const porPremio = new Map<string, number>()
    for (const c of conBono) {
      const nombre = c.bono!.premio.nombre
      porPremio.set(nombre, (porPremio.get(nombre) || 0) + 1)
    }
    return {
      totalClientes: clientes.length,
      sinBono: clientes.length - conBono.length,
      pendientes: pendientes.length,
      reclamados: reclamados.length,
      porPremio: Array.from(porPremio.entries()).sort((a, b) => b[1] - a[1]),
      recientes: clientes.slice(0, 5),
    }
  }, [clientes])

  return (
    <StaffSidebarLayout
      title={NAV_ITEMS.find((n) => n.id === section)?.label || 'Panel'}
      navItems={NAV_ITEMS}
      activeSection={section}
      onSectionChange={(id) => setSection(id as AdminSection)}
    >
      {error && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {!clientes && !error && (
        <div className="flex items-center justify-center gap-2 text-[#9A7B50] py-20">
          <Loader2 size={20} className="animate-spin" /> Cargando información...
        </div>
      )}

      {/* VISTA GENERAL */}
      {section === 'overview' && stats && (
        <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>Vista General</h2>
            <p className="text-sm text-[#9A7B50] mt-1">Estado real de la promoción "Gira y Gana"</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Clientes registrados', value: stats.totalClientes, icon: Users, color: '#D4AF37' },
              { label: 'Bonos pendientes', value: stats.pendientes, icon: Clock, color: '#eab308' },
              { label: 'Bonos canjeados', value: stats.reclamados, icon: CircleCheck, color: '#22c55e' },
              { label: 'Sin bono ganado', value: stats.sinBono, icon: Gift, color: '#6B5D3F' },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-[#D4AF37]/15 p-5"
                style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                <card.icon size={24} style={{ color: card.color }} className="mb-3" />
                <p className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>{card.value}</p>
                <p className="text-xs text-[#6B5D3F] mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#D4AF37]/12 p-5" style={{ background: '#121009' }}>
              <h3 className="font-bold text-[#F5E6C8] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Bonos por premio</h3>
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
              <h3 className="font-bold text-[#F5E6C8] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Últimos registros</h3>
              {stats.recientes.length === 0 ? (
                <p className="text-sm text-[#6B5D3F]">Todavía no hay clientes registrados.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {stats.recientes.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <span className="text-[#C4A97A]">{c.nombres} {c.apellidos}</span>
                      <span className="text-xs text-[#6B5D3F]">{formatDate(c.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLIENTES */}
      {section === 'clientes' && clientes && (
        <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>Clientes registrados</h2>
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
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-[#D4AF37]/8 last:border-0">
                    <td className="px-4 py-3 text-[#F5E6C8] font-medium whitespace-nowrap">{c.nombres} {c.apellidos}</td>
                    <td className="px-4 py-3 text-[#C4A97A] whitespace-nowrap">{c.docTipo}<br /><span className="text-xs text-[#6B5D3F]">{c.docNumero}</span></td>
                    <td className="px-4 py-3 text-[#C4A97A]">{c.email}<br /><span className="text-xs text-[#6B5D3F]">{c.telefono}</span></td>
                    <td className="px-4 py-3 text-[#9A7B50] whitespace-nowrap">{c.ciudad}, {c.departamento}</td>
                    <td className="px-4 py-3 text-[#6B5D3F] whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {c.bono ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[#D4AF37] text-xs font-semibold">{c.bono.premio.nombre}</span>
                          <StatusBadge
                            label={c.bono.estado === 'pendiente' ? 'Pendiente' : 'Canjeado'}
                            color={c.bono.estado === 'pendiente' ? '#eab308' : '#22c55e'}
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
      )}
    </StaffSidebarLayout>
  )
}
