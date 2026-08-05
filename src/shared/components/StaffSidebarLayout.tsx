import { useState, type ReactNode } from 'react'
import { useAuth } from '@/shared/context/AuthContext'
import { useNavigation } from '@/shared/context/NavigationContext'
import BackButton from '@/shared/components/BackButton'
import logoImg from '@/shared/assets/images/LOGO-CASINO.png'
import { LogOut, type LucideIcon } from 'lucide-react'

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
  const { navigate } = useNavigation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = () => {
    logout()
    navigate('landing')
  }

  return (
    <div className="min-h-screen bg-[#0a0805] flex">
      {/* Sidebar desktop */}
      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col border-r border-[#D4AF37]/15 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex`}
        style={{ width: 240, background: '#0d0a06', minHeight: '100vh' }}>

        <div className="p-6 border-b border-[#D4AF37]/12">
          <img src={logoImg} alt="Gran Casino Cucuta" className="h-12 w-auto mx-auto" />
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
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

        <div className="p-4 border-t border-[#D4AF37]/12">
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

          <div className="flex items-center gap-4 flex-shrink-0">
            <BackButton compact className="inline-flex items-center gap-1.5 text-sm text-[#9A7B50] hover:text-[#D4AF37] transition-colors" />
            <span className="hidden sm:block text-sm text-[#C4A97A] font-medium">{staff?.nombre}</span>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
