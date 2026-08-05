import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Page } from '@/shared/types/navigation'

const HOME_PAGE: Page = 'home'

interface NavigationContextValue {
  page: Page
  navigate: (page: Page) => void
  goHome: () => void
  homePage: Page
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

// Fuente única de la navegación de toda la app (no hay react-router: la
// "página actual" es un valor de estado, no una URL). "Volver" siempre
// regresa a Inicio (HOME_PAGE) — regla explícita del negocio, no un
// historial de páginas visitadas.
export function NavigationProvider({ initialPage, children }: { initialPage: Page; children: ReactNode }) {
  const [page, setPage] = useState<Page>(initialPage)

  const navigate = (newPage: Page) => {
    if (newPage === page) return
    window.scrollTo(0, 0)
    setPage(newPage)
  }

  const goHome = () => navigate(HOME_PAGE)

  return (
    <NavigationContext.Provider value={{ page, navigate, goHome, homePage: HOME_PAGE }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation debe usarse dentro de <NavigationProvider>')
  return ctx
}
