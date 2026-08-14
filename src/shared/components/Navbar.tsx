import { useState } from 'react'
import type { Page } from '@/shared/types/navigation'
import logoImg from '@/shared/assets/images/LOGO-CASINO.png'
import { useAuth } from '@/shared/context/AuthContext'
import { useNavigation } from '@/shared/context/NavigationContext'

interface Props {
  navigate: (page: Page) => void
}

const NAV_LINKS: { label: string; page: Page }[] = [
  { label: 'Inicio', page: 'home' },
  { label: 'Gira y Gana', page: 'landing' },
  { label: 'Premios', page: 'prizes' },
  { label: 'Cómo Funciona', page: 'how-it-works' },
  { label: 'FAQ', page: 'faq' },
]

export default function Navbar({ navigate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, cliente, staff, logout } = useAuth()
  const { page } = useNavigation()

  const homePage: Page = staff ? (staff.rol === 'admin' ? 'admin' : 'cajero') : 'dashboard'

  // Antes este botón decía "Hola, {nombre}" y no se entendía a dónde llevaba:
  // parecía una etiqueta con el nombre puesto, no un acceso. Ahora nombra su
  // DESTINO, que además cambia según quién entró — el mismo botón lleva a tres
  // sitios distintos y decir solo "Cuenta" sería mentirle a dos de los tres.
  const accesoLabel = staff ? (staff.rol === 'admin' ? 'Panel admin' : 'Panel de caja') : 'Mi cuenta'

  // Misma forma que "Cerrar Sesión": los dos son acciones de sesión y estar uno
  // al lado del otro con formas distintas los hacía ver desparejos.
  const clasePildora =
    'inline-flex items-center px-5 py-2 text-sm font-semibold text-[#D4AF37] border border-[#D4AF37]/50 rounded-full hover:bg-[#D4AF37]/10 transition-all'

  const handleLogout = () => {
    logout()
    navigate('landing')
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#D4AF37]/20"
      style={{ background: 'rgba(10,8,5,0.92)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="flex items-center gap-3"
        >
          <img src={logoImg} alt="Gran Casino Cucuta" className="h-16 w-auto" />
          <span className="text-lg sm:text-xl font-black tracking-wider whitespace-nowrap">
            <span style={{ color: '#F5E6C8' }}>GRAN CASINO</span>{' '}
            <span style={{ color: '#D4AF37' }}>CUCUTA</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.page)}
              className={`text-sm font-medium tracking-wide transition-colors pb-1 border-b-2 ${
                page === item.page
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'text-[#C4A97A] border-transparent hover:text-[#D4AF37]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(homePage)}
                className={clasePildora}
                style={{ letterSpacing: '0.05em' }}
              >
                {accesoLabel}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className={clasePildora}
                style={{ letterSpacing: '0.05em' }}
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('login')}
                className="inline-flex items-center px-5 py-2 text-sm font-semibold text-[#D4AF37] border border-[#D4AF37]/50 rounded-full hover:bg-[#D4AF37]/10 transition-all"
                style={{ letterSpacing: '0.05em' }}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => navigate('register')}
                className="inline-flex items-center px-5 py-2 text-sm font-semibold text-[#0a0805] rounded-full transition-all hover:scale-[1.03]"
                style={{ letterSpacing: '0.05em', background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
              >
                Registrarse
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="md:hidden text-[#D4AF37] p-2"
            aria-label="Abrir menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#D4AF37]/20 bg-[#0a0805] px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`text-left transition-colors text-sm ${
                page === item.page ? 'text-[#D4AF37] font-semibold' : 'text-[#C4A97A] hover:text-[#D4AF37]'
              }`}
              onClick={() => {
                setMenuOpen(false)
                navigate(item.page)
              }}
            >
              {item.label}
            </button>
          ))}
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  navigate(homePage)
                }}
                className="text-left text-[#D4AF37] text-sm font-semibold border border-[#D4AF37]/40 rounded-full px-4 py-2 w-fit"
              >
                {accesoLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  handleLogout()
                }}
                className="text-left text-[#D4AF37] text-sm font-semibold border border-[#D4AF37]/40 rounded-full px-4 py-2 w-fit"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('login')
                }}
                className="text-left text-[#D4AF37] text-sm font-semibold border border-[#D4AF37]/40 rounded-full px-4 py-2 w-fit"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('register')
                }}
                className="text-left text-[#0a0805] text-sm font-semibold rounded-full px-4 py-2 w-fit"
                style={{ background: 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)' }}
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
