import { useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import logoImg from '@/shared/assets/images/logo.png'

interface Props {
  navigate: (page: Page) => void
  prize: string | null
  userName: string | null
}

type DashSection = 'home' | 'credits' | 'bonuses' | 'bingos' | 'prizes' | 'history' | 'profile'

const NAV_ITEMS: { id: DashSection; label: string; icon: string }[] = [
  { id: 'home', label: 'Inicio', icon: '🏠' },
  { id: 'credits', label: 'Mis Créditos', icon: '💰' },
  { id: 'bonuses', label: 'Mis Bonos', icon: '🎁' },
  { id: 'bingos', label: 'Mis Bingos', icon: '🎴' },
  { id: 'prizes', label: 'Mis Premios', icon: '⭐' },
  { id: 'history', label: 'Historial', icon: '📋' },
  { id: 'profile', label: 'Mi Perfil', icon: '👤' },
]

const MOVEMENTS = [
  { type: 'credit', icon: '💰', title: 'Premio de Ruleta', desc: 'Créditos ganados en promoción', date: '03 ago 2026', amount: '+5,000', status: 'Acreditado' },
  { type: 'debit', icon: '🎮', title: 'Uso de Beneficio', desc: 'Créditos canjeados en evento', date: '04 ago 2026', amount: '-1,500', status: 'Aplicado' },
  { type: 'credit', icon: '🎁', title: 'Bono Asignado', desc: 'Bono de bienvenida activado', date: '03 ago 2026', amount: '+1', status: 'Activo' },
  { type: 'credit', icon: '🎴', title: 'Cartón Bingo', desc: 'Cartón para evento 10 ago', date: '03 ago 2026', amount: '+1', status: 'Disponible' },
]

const PRIZES_DATA = [
  { name: '5,000 Créditos Promocionales', type: 'Créditos', campaign: 'Ruleta de Bienvenida', date: '03 ago 2026', expires: '03 sep 2026', status: 'Disponible', code: 'IC-2026-8A4F', statusColor: '#22c55e' },
  { name: 'Bono de Bienvenida', type: 'Bono', campaign: 'Ruleta de Bienvenida', date: '03 ago 2026', expires: '10 ago 2026', status: 'Próximo a vencer', code: 'IC-2026-7B2E', statusColor: '#eab308' },
]

const BONUSES_DATA = [
  { name: 'Bono de Bienvenida Especial', desc: 'Beneficio exclusivo para nuevos miembros de Innova Club SAS.', assigned: '03 ago 2026', expires: '10 ago 2026', status: 'Activo', statusColor: '#22c55e' },
]

const BINGOS_DATA = [
  { event: 'Bingo Especial Agosto', date: '10 ago 2026', time: '7:00 PM', place: 'Sede Principal Innova Club', card: '#IC-8423', status: 'Disponible', statusColor: '#22c55e' },
]

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}>
      {label}
    </span>
  )
}

export default function DashboardPage({ navigate, prize, userName }: Props) {
  const [section, setSection] = useState<DashSection>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const displayName = userName?.split(' ')[0] || 'Cliente'

  const credits = 3500
  const totalCredits = 5000

  return (
    <div className="min-h-screen bg-[#0a0805] flex">

      {/* Sidebar desktop */}
      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col border-r border-[#D4AF37]/15 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex`}
        style={{ width: 240, background: '#0d0a06', minHeight: '100vh' }}>

        {/* Logo */}
        <div className="p-6 border-b border-[#D4AF37]/12">
          <img src={logoImg} alt="Innova Club SAS" className="h-12 w-auto mx-auto" />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSidebarOpen(false) }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left w-full transition-all
                ${section === item.id
                  ? 'text-[#0a0805]'
                  : 'text-[#9A7B50] hover:text-[#C4A97A] hover:bg-[#D4AF37]/6'}`}
              style={section === item.id ? {
                background: 'linear-gradient(135deg, #D4AF37, #A0832A)',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.02em'
              } : {}}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-[#D4AF37]/12">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#6B5D3F] hover:text-[#C4A97A] hover:bg-[#D4AF37]/6 transition-all w-full">
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0" style={{ minWidth: 0 }}>

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/12"
          style={{ background: 'rgba(10,8,5,0.96)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#9A7B50] hover:text-[#D4AF37] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {NAV_ITEMS.find(n => n.id === section)?.label || 'Panel'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-[#9A7B50] hover:text-[#D4AF37] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4AF37]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0a0805] text-sm font-bold">
                {displayName[0]}
              </div>
              <span className="hidden sm:block text-sm text-[#C4A97A] font-medium">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 max-w-5xl w-full mx-auto">

          {/* HOME */}
          {section === 'home' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              <div className="mb-6">
                <p className="text-[#D4AF37] text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>BIENVENIDO</p>
                <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Hola, {displayName} 👋
                </h2>
                <p className="text-[#9A7B50] text-sm mt-1">Estos son tus beneficios disponibles</p>
              </div>

              {/* Prize notification */}
              {prize && (
                <div className="rounded-2xl border border-[#D4AF37]/35 p-5 mb-6 flex items-center gap-4"
                  style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))' }}>
                  <span className="text-4xl">🏆</span>
                  <div>
                    <p className="text-[#D4AF37] text-xs font-bold tracking-wider mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>PREMIO GANADO</p>
                    <p className="text-[#F5E6C8] font-semibold">{prize}</p>
                    <p className="text-[#9A7B50] text-xs mt-0.5">Ya disponible en tu cuenta · Vence: 03 sep 2026</p>
                  </div>
                  <button onClick={() => setSection('prizes')} className="ml-auto text-xs text-[#D4AF37] border border-[#D4AF37]/30 rounded-full px-3 py-1.5 hover:bg-[#D4AF37]/10 transition-all flex-shrink-0">
                    Ver →
                  </button>
                </div>
              )}

              {/* Summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Créditos', value: credits.toLocaleString(), sub: `de ${totalCredits.toLocaleString()} totales`, icon: '💰', section: 'credits' as DashSection },
                  { label: 'Bonos Activos', value: '1', sub: 'Vence en 7 días', icon: '🎁', section: 'bonuses' as DashSection },
                  { label: 'Bingos', value: '1', sub: 'Próximo evento 10 ago', icon: '🎴', section: 'bingos' as DashSection },
                  { label: 'Premios', value: '2', sub: '1 por vencer pronto', icon: '⭐', section: 'prizes' as DashSection },
                ].map((card, i) => (
                  <button key={i} onClick={() => setSection(card.section)}
                    className="rounded-2xl border border-[#D4AF37]/15 p-5 text-left hover:border-[#D4AF37]/35 transition-all group"
                    style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                    <div className="text-3xl mb-3">{card.icon}</div>
                    <p className="text-xs text-[#6B5D3F] mb-1">{card.label}</p>
                    <p className="text-2xl font-black text-[#D4AF37]" style={{ fontFamily: "'Inter', sans-serif" }}>{card.value}</p>
                    <p className="text-xs text-[#6B5D3F] mt-1">{card.sub}</p>
                  </button>
                ))}
              </div>

              {/* Recent activity */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>Actividad Reciente</h3>
                  <button onClick={() => setSection('history')} className="text-xs text-[#D4AF37] hover:underline">Ver todo →</button>
                </div>
                <div className="rounded-2xl border border-[#D4AF37]/12 overflow-hidden" style={{ background: '#121009' }}>
                  {MOVEMENTS.slice(0, 3).map((m, i) => (
                    <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < 2 ? 'border-b border-[#D4AF37]/8' : ''}`}>
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#F5E6C8] truncate">{m.title}</p>
                        <p className="text-xs text-[#6B5D3F]">{m.date}</p>
                      </div>
                      <span className={`text-sm font-bold flex-shrink-0 ${m.type === 'credit' ? 'text-[#22c55e]' : 'text-red-400'}`}>
                        {m.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CREDITS */}
          {section === 'credits' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              {/* Balance card */}
              <div className="rounded-2xl border border-[#D4AF37]/25 p-6 mb-6"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.03) 100%)' }}>
                <p className="text-[#9A7B50] text-xs mb-1">Créditos disponibles</p>
                <p className="text-5xl font-black text-[#D4AF37] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {credits.toLocaleString()}
                </p>
                <p className="text-[#6B5D3F] text-sm">de {totalCredits.toLocaleString()} créditos totales · Vencen: 03 sep 2026</p>
                <div className="mt-4 bg-[#D4AF37]/15 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${(credits/totalCredits)*100}%`, background: 'linear-gradient(90deg, #A0832A, #D4AF37)' }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Disponibles', value: credits.toLocaleString(), color: '#22c55e' },
                  { label: 'Utilizados', value: '1,500', color: '#9A7B50' },
                  { label: 'Vencidos', value: '0', color: '#6B5D3F' },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl border border-[#D4AF37]/12 p-4 text-center" style={{ background: '#121009' }}>
                    <p className="text-xs text-[#6B5D3F] mb-1">{stat.label}</p>
                    <p className="text-xl font-black" style={{ color: stat.color, fontFamily: "'Inter', sans-serif" }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-[#F5E6C8] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>Movimientos</h3>
              <div className="rounded-2xl border border-[#D4AF37]/12 overflow-hidden" style={{ background: '#121009' }}>
                {MOVEMENTS.map((m, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < MOVEMENTS.length - 1 ? 'border-b border-[#D4AF37]/8' : ''}`}>
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F5E6C8]">{m.title}</p>
                      <p className="text-xs text-[#6B5D3F]">{m.desc} · {m.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${m.type === 'credit' ? 'text-[#22c55e]' : 'text-red-400'}`}>{m.amount}</p>
                      <StatusBadge label={m.status} color={m.type === 'credit' ? '#22c55e' : '#9A7B50'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BONUSES */}
          {section === 'bonuses' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              <div className="grid gap-4">
                {BONUSES_DATA.map((b, i) => (
                  <div key={i} className="rounded-2xl border border-[#D4AF37]/15 p-5"
                    style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-3xl">🎁</div>
                      <StatusBadge label={b.status} color={b.statusColor} />
                    </div>
                    <h3 className="font-bold text-[#F5E6C8] mt-3 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{b.name}</h3>
                    <p className="text-sm text-[#9A7B50] mb-3">{b.desc}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs text-[#6B5D3F]">
                      <span>Asignado: {b.assigned}</span>
                      <span>Vence: <span className="text-[#eab308]">{b.expires}</span></span>
                    </div>
                    <button className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-all">
                      Ver detalle →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BINGOS */}
          {section === 'bingos' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              {BINGOS_DATA.map((b, i) => (
                <div key={i} className="rounded-2xl border border-[#D4AF37]/15 p-5"
                  style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-3xl">🎴</div>
                    <StatusBadge label={b.status} color={b.statusColor} />
                  </div>
                  <h3 className="font-bold text-[#F5E6C8] mt-3 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{b.event}</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm text-[#9A7B50] mb-4">
                    <span>📅 {b.date}</span>
                    <span>🕖 {b.time}</span>
                    <span>📍 {b.place}</span>
                    <span>🎴 Cartón {b.card}</span>
                  </div>
                  <button className="px-4 py-2 rounded-lg text-xs font-semibold text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-all">
                    Ver cartón →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* PRIZES */}
          {section === 'prizes' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              <div className="grid gap-4">
                {PRIZES_DATA.map((p, i) => (
                  <div key={i} className="rounded-2xl border border-[#D4AF37]/15 p-5"
                    style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</h3>
                        <p className="text-xs text-[#6B5D3F] mt-0.5">{p.campaign}</p>
                      </div>
                      <StatusBadge label={p.status} color={p.statusColor} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-[#9A7B50] mb-4">
                      <span>Tipo: {p.type}</span>
                      <span>Obtenido: {p.date}</span>
                      <span>Vence: <span style={{ color: p.statusColor }}>{p.expires}</span></span>
                      <span>Código: <span className="text-[#D4AF37] font-mono">{p.code}</span></span>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-xs font-semibold text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-all">
                      Usar beneficio →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HISTORY */}
          {section === 'history' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              <div className="rounded-2xl border border-[#D4AF37]/12 overflow-hidden" style={{ background: '#121009' }}>
                {MOVEMENTS.map((m, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < MOVEMENTS.length - 1 ? 'border-b border-[#D4AF37]/8' : ''}`}>
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F5E6C8]">{m.title}</p>
                      <p className="text-xs text-[#6B5D3F]">{m.desc} · {m.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${m.type === 'credit' ? 'text-[#22c55e]' : 'text-red-400'}`}>{m.amount}</p>
                      <StatusBadge label={m.status} color={m.type === 'credit' ? '#22c55e' : '#9A7B50'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {section === 'profile' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 p-5 rounded-2xl border border-[#D4AF37]/15"
                style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                <div className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0a0805] text-2xl font-black">
                  {displayName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>{userName || 'Cliente Innova'}</h3>
                  <p className="text-sm text-[#9A7B50]">Miembro desde agosto 2026</p>
                  <StatusBadge label="Cuenta activa" color="#22c55e" />
                </div>
              </div>

              {/* Info */}
              <div className="grid gap-3">
                {[
                  ['Documento', 'Cédula: 1.***.***.456'],
                  ['Correo', 'c***@ejemplo.com'],
                  ['Celular', '+57 300 *** 4567'],
                  ['Departamento', 'Cundinamarca'],
                  ['Ciudad', 'Bogotá'],
                ].map(([label, value], i) => (
                  <div key={i} className="flex justify-between items-center px-5 py-3 rounded-xl border border-[#D4AF37]/10"
                    style={{ background: '#121009' }}>
                    <span className="text-xs text-[#6B5D3F]">{label}</span>
                    <span className="text-sm text-[#C4A97A] font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <button className="mt-5 w-full py-3 rounded-xl text-sm font-semibold text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-all">
                Editar información
              </button>
              <button
                onClick={() => navigate('landing')}
                className="mt-3 w-full py-3 rounded-xl text-sm text-[#6B5D3F] border border-[#6B5D3F]/20 hover:text-red-400 hover:border-red-400/30 transition-all">
                Cerrar sesión
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#D4AF37]/15 flex justify-around"
        style={{ background: 'rgba(10,8,5,0.97)', backdropFilter: 'blur(12px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV_ITEMS.slice(0, 5).map(item => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={`flex flex-col items-center gap-0.5 py-3 px-2 text-xs transition-all flex-1
              ${section === item.id ? 'text-[#D4AF37]' : 'text-[#4A3D28]'}`}>
            <span className="text-lg">{item.icon}</span>
            <span className="truncate text-[10px]">{item.label.split(' ').pop()}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
