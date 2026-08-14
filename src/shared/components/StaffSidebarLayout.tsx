import { useState, type ReactNode } from 'react'
import { useAuth } from '@/shared/context/AuthContext'
import { useNavigation } from '@/shared/context/NavigationContext'
import logoImg from '@/shared/assets/images/LOGO-CASINO.png'
import { Home, LogOut, type LucideIcon } from 'lucide-react'

export interface StaffNavItem {
  id: string
  label: string
  icon: LucideIcon
}

interface Props {
  title: string
  navItems: StaffNavItem[]
  activeSection: string
  onSectionChange: (id: string) => void
  children: ReactNode
}

// Sidebar compartido entre el panel de Administrador y el de Cajero — mismo
// lenguaje visual que el sidebar del cliente en DashboardPage.
export default function StaffSidebarLayout({ title, navItems, activeSection, onSectionChange, children }: Props) {
  const { staff, logout } = useAuth()
  const { navigate, goHome } = useNavigation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Solo el primer nombre: "Hola, José Alejandro Uribe" no cabe en un botón de
  // cabecera y el apellido no aporta nada en un saludo.
  const primerNombre = staff?.nombre?.trim().split(/\s+/)[0] ?? ''

  const handleSignOut = () => {
    logout()
    navigate('landing')
  }

  return (
    <div className="min-h-screen bg-[#0a0805] flex">
      {/*
        SIDEBAR ESTÁTICO

        Antes era `lg:static`: al ser un elemento de flujo normal dentro del
        flex, se iba hacia arriba con el resto de la página y en un listado
        largo el menú desaparecía — para cambiar de sección tocaba subir hasta
        arriba del todo.

        Ahora es `sticky top-0` con la altura exacta de la ventana. `self-start`
        es imprescindible: sin él, el flex estira el elemento a la altura de
        TODO el contenido y entonces no hay nada que fijar, porque el elemento
        ya cubre el recorrido completo — el sticky no haría nada.

        Lleva su propio `overflow-y-auto` para que un menú más largo que la
        pantalla siga siendo alcanzable dentro del propio sidebar.
      */}
      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col border-r border-[#D4AF37]/15 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:flex-shrink-0`}
        style={{ width: 240, background: '#0d0a06' }}>

        <div className="p-6 border-b border-[#D4AF37]/12 flex-shrink-0">
          <img src={logoImg} alt="Gran Casino Cucuta" className="h-12 w-auto mx-auto" />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onSectionChange(item.id); setSidebarOpen(false) }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left w-full transition-all
                ${activeSection === item.id
                  ? 'text-[#0a0805]'
                  : 'text-[#9A7B50] hover:text-[#C4A97A] hover:bg-[#D4AF37]/6'}`}
              style={activeSection === item.id ? {
                background: 'linear-gradient(135deg, #D4AF37, #A0832A)',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.02em'
              } : {}}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#D4AF37]/12 flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#6B5D3F] hover:text-[#C4A97A] hover:bg-[#D4AF37]/6 transition-all w-full">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ minWidth: 0 }}>
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/12"
          style={{ background: 'rgba(10,8,5,0.96)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#9A7B50] hover:text-[#D4AF37] transition-colors flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-[#F5E6C8] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{title}</h1>
          </div>

          {/*
            Antes aquí había dos elementos sueltos: el enlace "Volver a Inicio"
            y el nombre como texto plano. Ahora es un solo botón con la misma
            forma de píldora que "Cerrar Sesión" y que el botón de cuenta del
            navbar público — el saludo y la salida al sitio son la misma acción,
            y no dos cosas que compiten por el mismo rincón.
          */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={goHome}
              title="Ir al inicio del sitio"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 text-sm font-semibold text-[#D4AF37] border border-[#D4AF37]/50 rounded-full hover:bg-[#D4AF37]/10 transition-all"
              style={{ letterSpacing: '0.05em' }}
            >
              <Home size={15} className="flex-shrink-0" />
              <span className="hidden sm:inline max-w-[16ch] truncate">Hola, {primerNombre}</span>
            </button>
          </div>
        </header>

        {/*
          Sin `max-w-6xl`: ese tope dejaba una franja negra enorme a la derecha
          en cualquier monitor de escritorio mientras las tablas, apretadas
          dentro de él, pedían barra de desplazamiento horizontal. El ancho
          desperdiciado ERA la causa del scroll lateral.

          `min-w-0` deja que las tablas se encojan hasta caber en vez de empujar
          el ancho del contenedor: sin él, un elemento de la rejilla flex se
          niega a bajar de su ancho de contenido y el desbordamiento vuelve.
        */}
        <main className="flex-1 p-4 sm:p-6 w-full min-w-0">{children}</main>
      </div>
    </div>
  )
}
