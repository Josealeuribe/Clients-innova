import { useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import { useAuth } from '@/shared/context/AuthContext'
import BackButton from '@/shared/components/BackButton'
import logoImg from '@/shared/assets/images/LOGO-CASINO.png'
import { Home, Gift, Layers, Trophy, History, User, LogOut, ChevronRight, CircleCheck, MapPin, type LucideIcon } from 'lucide-react'

interface Props {
  navigate: (page: Page) => void
}

function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  if (!domain) return email
  return `${user[0] || ''}***@${domain}`
}

function maskPhone(phone: string) {
  return phone.length <= 4 ? phone : `${phone.slice(0, -4).replace(/\d/g, '*')}${phone.slice(-4)}`
}

function maskDoc(doc: string) {
  return doc.length <= 3 ? doc : `${doc.slice(0, -3).replace(/\d/g, '*')}${doc.slice(-3)}`
}

type DashSection = 'home' | 'bonuses' | 'bingos' | 'prizes' | 'history' | 'profile'

const NAV_ITEMS: { id: DashSection; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'bonuses', label: 'Mis Bonos', icon: Gift },
  { id: 'bingos', label: 'Mis Bingos', icon: Layers },
  { id: 'prizes', label: 'Mis Premios', icon: Trophy },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'profile', label: 'Mi Perfil', icon: User },
]

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}>
      {label}
    </span>
  )
}

function LinkArrow({ label, onClick, className = 'text-xs text-[#D4AF37] hover:underline' }: { label: string; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 ${className}`}>
      {label}
      <ChevronRight size={14} />
    </button>
  )
}

// Placeholder honesto para secciones que aún no tienen backend real (créditos,
// bingos, historial). Nada de datos inventados: mientras no exista el modelo
// de datos y el endpoint correspondiente, se muestra esto en vez de mocks.
function ComingSoon({ icon: Icon, title, message }: { icon: LucideIcon; title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/15 p-10 text-center flex flex-col items-center gap-3"
      style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
      <Icon size={40} className="text-[#6B5D3F]" />
      <h3 className="font-bold text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>{title}</h3>
      <p className="text-sm text-[#6B5D3F] max-w-sm">{message}</p>
      <StatusBadge label="Próximamente" color="#eab308" />
    </div>
  )
}

function NoBonoYet({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/15 p-10 text-center flex flex-col items-center gap-4"
      style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
      <Gift size={40} className="text-[#D4AF37]" />
      <div>
        <h3 className="font-bold text-[#F5E6C8] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Aún no has ganado ningún bono</h3>
        <p className="text-sm text-[#9A7B50]">Gira la ruleta para ganar un bono o cortesía redimible en cualquiera de nuestras sedes.</p>
      </div>
      <button
        onClick={() => navigate('roulette')}
        className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#0a0805] transition-all hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}>
        Girar la ruleta
      </button>
    </div>
  )
}

export default function DashboardPage({ navigate }: Props) {
  const { cliente, bono, logout } = useAuth()
  const [section, setSection] = useState<DashSection>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const displayName = cliente?.nombres?.split(' ')[0] || 'Cliente'
  const fullName = cliente ? `${cliente.nombres} ${cliente.apellidos}` : 'Cliente Gran Casino'

  const handleSignOut = () => {
    logout()
    navigate('landing')
  }

  const bonoFecha = bono
    ? new Date(bono.creadoEn).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  // El bono ya redimido no se borra: queda como constancia de la entrega. Por
  // eso el estado se muestra explícitamente, para que nadie se presente en
  // sede con un código que ya se usó.
  const bonoRedimido = bono?.estado === 'reclamado'
  const bonoFechaCanje = bono?.canjeadoEn
    ? new Date(bono.canjeadoEn).toLocaleString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null
  const bonoEstadoLabel = bonoRedimido ? 'Redimido' : bono?.estado === 'pendiente' ? 'Disponible' : bono?.estado
  const bonoEstadoColor = bonoRedimido ? '#9A7B50' : '#22c55e'

  return (
    <div className="min-h-screen bg-[#0a0805] flex">

      {/* Sidebar desktop */}
      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col border-r border-[#D4AF37]/15 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex`}
        style={{ width: 240, background: '#0d0a06', minHeight: '100vh' }}>

        {/* Logo */}
        <div className="p-6 border-b border-[#D4AF37]/12">
          <img src={logoImg} alt="Gran Casino Cucuta" className="h-12 w-auto mx-auto" />
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
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-[#D4AF37]/12">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#6B5D3F] hover:text-[#C4A97A] hover:bg-[#D4AF37]/6 transition-all w-full">
            <LogOut size={18} />
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
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#9A7B50] hover:text-[#D4AF37] transition-colors flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-[#F5E6C8] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
              {NAV_ITEMS.find(n => n.id === section)?.label || 'Panel'}
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <BackButton compact className="inline-flex items-center gap-1.5 text-sm text-[#9A7B50] hover:text-[#D4AF37] transition-colors" />
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
                  Hola, {displayName}
                </h2>
                <p className="text-[#9A7B50] text-sm mt-1">Este es el estado real de tu cuenta</p>
              </div>

              {/* Prize notification */}
              {bono && (
                <div className="rounded-2xl border border-[#D4AF37]/35 p-5 mb-6 flex items-center gap-4"
                  style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))' }}>
                  {bonoRedimido
                    ? <CircleCheck size={40} className="text-[#22c55e] flex-shrink-0" />
                    : <Trophy size={40} className="text-[#D4AF37] flex-shrink-0" />}
                  <div>
                    <p className="text-[#D4AF37] text-xs font-bold tracking-wider mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {bonoRedimido ? 'PREMIO REDIMIDO' : 'PREMIO GANADO'}
                    </p>
                    <p className="text-[#F5E6C8] font-semibold">{bono.premio.nombre}</p>
                    <p className="text-[#9A7B50] text-xs mt-0.5">
                      {bonoRedimido
                        ? `Entregado${bono.sede ? ` en ${bono.sede}` : ''}${bono.canjeadoPor ? ` por ${bono.canjeadoPor}` : ''}${bonoFechaCanje ? ` · ${bonoFechaCanje}` : ''}`
                        : `Código ${bono.codigo}${bono.sedeRedencion ? ` · Redímelo en ${bono.sedeRedencion.nombre}` : ''}`}
                    </p>
                  </div>
                  <LinkArrow
                    label="Ver"
                    onClick={() => setSection('bonuses')}
                    className="ml-auto text-xs text-[#D4AF37] border border-[#D4AF37]/30 rounded-full px-3 py-1.5 hover:bg-[#D4AF37]/10 transition-all flex-shrink-0"
                  />
                </div>
              )}

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  {
                    label: 'Mi Bono',
                    value: bono ? '1' : '0',
                    sub: bono ? bono.premio.nombre : 'Gira la ruleta para ganar uno',
                    icon: Gift,
                    section: 'bonuses' as DashSection,
                    soon: false,
                  },
                  { label: 'Bingos', value: '—', sub: 'Próximamente', icon: Layers, section: 'bingos' as DashSection, soon: true },
                  { label: 'Historial', value: '—', sub: 'Próximamente', icon: History, section: 'history' as DashSection, soon: true },
                ].map((card, i) => (
                  <button key={i} onClick={() => setSection(card.section)}
                    className="rounded-2xl border border-[#D4AF37]/15 p-5 text-left hover:border-[#D4AF37]/35 transition-all group"
                    style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                    <card.icon size={28} className={card.soon ? 'text-[#6B5D3F] mb-3' : 'text-[#D4AF37] mb-3'} />
                    <p className="text-xs text-[#6B5D3F] mb-1">{card.label}</p>
                    <p className="text-2xl font-black" style={{ color: card.soon ? '#6B5D3F' : '#D4AF37', fontFamily: "'Inter', sans-serif" }}>{card.value}</p>
                    <p className="text-xs text-[#6B5D3F] mt-1 truncate">{card.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BONUSES */}
          {section === 'bonuses' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              {bono ? (
                <div className="rounded-2xl border border-[#D4AF37]/15 p-5"
                  style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <Gift size={28} className="text-[#D4AF37]" />
                    <StatusBadge label={bonoEstadoLabel || bono.estado} color={bonoEstadoColor} />
                  </div>
                  <h3 className="font-bold text-[#F5E6C8] mt-3 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{bono.premio.nombre}</h3>
                  <p className="text-sm text-[#9A7B50] mb-3">{bono.premio.detalle}</p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-[#6B5D3F]">
                    <span>Asignado: {bonoFecha}</span>
                    <span>Código: <span className="text-[#D4AF37] font-mono">{bono.codigo}</span></span>
                  </div>

                  {bonoRedimido ? (
                    /* Constancia de entrega: el bono no desaparece al
                       canjearse, queda este comprobante con fecha y sede. */
                    <div className="mt-4 rounded-xl border border-[#22c55e]/25 bg-[#22c55e]/8 p-4">
                      <p className="text-sm text-[#22c55e] font-semibold flex items-center gap-1.5 mb-2">
                        <CircleCheck size={16} /> Redimido correctamente
                      </p>
                      <div className="grid gap-1 text-xs text-[#9A7B50]">
                        {bonoFechaCanje && <span>Fecha de entrega: {bonoFechaCanje}</span>}
                        {bono.sede && <span>Casino: {bono.sede}</span>}
                        {bono.canjeadoPor && <span>Atendido por: {bono.canjeadoPor}</span>}
                      </div>
                      <p className="text-[10px] text-[#6B5D3F] mt-2">
                        Conserva este comprobante. Este código ya fue usado y no puede volver a redimirse.
                      </p>
                    </div>
                  ) : bono.sedeRedencion ? (
                    /* Cada premio pertenece a un casino: el cliente debe ir a
                       ESE, no a cualquiera de los tres. */
                    <div className="mt-4 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/8 p-4">
                      <p className="text-xs text-[#D4AF37] font-bold tracking-wider mb-1.5 flex items-center gap-1.5">
                        <MapPin size={13} /> REDÍMELO EN
                      </p>
                      <p className="text-sm text-[#F5E6C8] font-semibold">{bono.sedeRedencion.nombre}</p>
                      <p className="text-xs text-[#9A7B50] mt-0.5">{bono.sedeRedencion.direccion}</p>
                      <p className="text-[10px] text-[#6B5D3F] mt-2">
                        Preséntate en caja con tu documento y este código. Este bono solo se entrega en esta sede.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#6B5D3F] mt-4">Preséntate en caja con tu documento y este código para redimirlo.</p>
                  )}
                </div>
              ) : (
                <NoBonoYet navigate={navigate} />
              )}
            </div>
          )}

          {/* BINGOS */}
          {section === 'bingos' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              <ComingSoon
                icon={Layers}
                title="Bingos"
                message="Todavía no hay eventos de bingo conectados a tu cuenta. Muy pronto podrás ver tus cartones aquí."
              />
            </div>
          )}

          {/* PRIZES */}
          {section === 'prizes' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              {bono ? (
                <div className="rounded-2xl border border-[#D4AF37]/15 p-5"
                  style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>{bono.premio.nombre}</h3>
                      <p className="text-xs text-[#6B5D3F] mt-0.5">Ruleta Gira y Gana</p>
                    </div>
                    <StatusBadge label={bonoEstadoLabel || bono.estado} color={bonoEstadoColor} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-[#9A7B50]">
                    <span>Tipo: {bono.premio.monetario ? 'Bono' : 'Cortesía'}</span>
                    <span>Obtenido: {bonoFecha}</span>
                    <span className="col-span-2">Código: <span className="text-[#D4AF37] font-mono">{bono.codigo}</span></span>
                    {bono.sedeRedencion && (
                      <span className="col-span-2">Sede: <span className="text-[#C4A97A]">{bono.sedeRedencion.nombre}</span></span>
                    )}
                  </div>
                </div>
              ) : (
                <NoBonoYet navigate={navigate} />
              )}
            </div>
          )}

          {/* HISTORY — auditoría del bono: qué pasó, cuándo y dónde */}
          {section === 'history' && (
            <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
              {bono ? (
                <div className="rounded-2xl border border-[#D4AF37]/15 p-6"
                  style={{ background: 'linear-gradient(145deg, #1C1810, #121009)' }}>
                  <h3 className="font-bold text-[#F5E6C8] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Historial de tu bono
                  </h3>
                  <p className="text-xs text-[#6B5D3F] mb-5">
                    Código <span className="text-[#D4AF37] font-mono">{bono.codigo}</span>
                  </p>

                  <ol className="relative border-l border-[#D4AF37]/20 ml-2">
                    <li className="ml-5 pb-6">
                      <span className="absolute -left-[7px] w-3.5 h-3.5 rounded-full bg-[#D4AF37]" />
                      <p className="text-sm text-[#F5E6C8] font-medium">Bono ganado en la ruleta</p>
                      <p className="text-xs text-[#9A7B50] mt-0.5">{bono.premio.nombre}</p>
                      {bono.sedeRedencion && (
                        <p className="text-xs text-[#6B5D3F] mt-0.5">Asignado a {bono.sedeRedencion.nombre}</p>
                      )}
                      <p className="text-xs text-[#6B5D3F] mt-0.5">{bonoFecha}</p>
                    </li>

                    <li className="ml-5">
                      <span
                        className="absolute -left-[7px] w-3.5 h-3.5 rounded-full"
                        style={{ background: bonoRedimido ? '#22c55e' : '#4A3D28' }}
                      />
                      {bonoRedimido ? (
                        <>
                          <p className="text-sm text-[#22c55e] font-medium">Redimido correctamente</p>
                          {bono.sede && <p className="text-xs text-[#9A7B50] mt-0.5">{bono.sede}</p>}
                          {bono.canjeadoPor && (
                            <p className="text-xs text-[#9A7B50] mt-0.5">Atendido por {bono.canjeadoPor}</p>
                          )}
                          <p className="text-xs text-[#6B5D3F] mt-0.5">{bonoFechaCanje}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-[#6B5D3F] font-medium">Pendiente de redimir</p>
                          <p className="text-xs text-[#6B5D3F] mt-0.5">
                            {bono.sedeRedencion
                              ? `Preséntate en ${bono.sedeRedencion.nombre} con tu documento.`
                              : 'Preséntate en caja con tu documento.'}
                          </p>
                        </>
                      )}
                    </li>
                  </ol>
                </div>
              ) : (
                <ComingSoon
                  icon={History}
                  title="Sin actividad todavía"
                  message="Cuando ganes un bono en la ruleta, aquí verás su historial completo: cuándo lo obtuviste y cuándo lo redimiste."
                />
              )}
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
                  <h3 className="text-xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>{fullName}</h3>
                  <p className="text-sm text-[#9A7B50]">{cliente?.email}</p>
                  <StatusBadge label="Cuenta activa" color="#22c55e" />
                </div>
              </div>

              {/* Info */}
              <div className="grid gap-3">
                {[
                  ['Documento', cliente ? maskDoc(cliente.docNumero) : '—'],
                  ['Correo', cliente ? maskEmail(cliente.email) : '—'],
                  ['Celular', cliente ? maskPhone(cliente.telefono) : '—'],
                  ['Departamento', cliente?.departamento || '—'],
                  ['Ciudad', cliente?.ciudad || '—'],
                ].map(([label, value], i) => (
                  <div key={i} className="flex justify-between items-center px-5 py-3 rounded-xl border border-[#D4AF37]/10"
                    style={{ background: '#121009' }}>
                    <span className="text-xs text-[#6B5D3F]">{label}</span>
                    <span className="text-sm text-[#C4A97A] font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSignOut}
                className="mt-5 w-full py-3 rounded-xl text-sm text-[#6B5D3F] border border-[#6B5D3F]/20 hover:text-red-400 hover:border-red-400/30 transition-all">
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
            <item.icon size={18} />
            <span className="truncate text-[10px]">{item.label.split(' ').pop()}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
