import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { PAGE_TITLES, ROUTES, pageFromPath, type Page } from '@/shared/types/navigation'

const HOME_PAGE: Page = 'home'

interface NavigationContextValue {
  page: Page
  /** Vista desde la que se llego a la actual, o null si se entro directo por
   * URL. Sirve para ofrecer un "volver" contextual donde el generico (que
   * siempre va a Inicio) dejaria al usuario tirado — por ejemplo al salir del
   * formulario de registro a leer los terminos. */
  previousPage: Page | null
  navigate: (page: Page) => void
  goHome: () => void
  homePage: Page
  /** Ruta publica de una vista, para usarla en href y que el enlace sea real. */
  hrefFor: (page: Page) => string
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

function aplicarTitulo(page: Page) {
  document.title = PAGE_TITLES[page]
}

// Fuente única de la navegación de toda la app. Cada vista tiene su propia
// URL (ver ROUTES) y se sincroniza con el historial del navegador: se puede
// entrar directo a /ruleta, compartir el enlace y usar atrás/adelante.
//
// No se usa react-router a propósito: la app no tiene rutas anidadas ni
// parámetros, así que la History API basta y evita la dependencia. Si algún
// día hacen falta rutas con parámetros (p. ej. /bono/:codigo), este es el
// punto donde se cambiaría.
export function NavigationProvider({ fallbackPage = 'landing', children }: { fallbackPage?: Page; children: ReactNode }) {
  const [page, setPage] = useState<Page>(() => pageFromPath(window.location.pathname) ?? fallbackPage)
  const [previousPage, setPreviousPage] = useState<Page | null>(null)

  // Una URL desconocida no deja la barra de direcciones mintiendo: se
  // reemplaza por la de la vista que realmente se está mostrando.
  useEffect(() => {
    if (pageFromPath(window.location.pathname) === null) {
      window.history.replaceState({ page: fallbackPage }, '', ROUTES[fallbackPage])
    }
    aplicarTitulo(page)
    // Solo al montar: los cambios posteriores los maneja navigate/popstate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Atrás/adelante del navegador: la URL manda, así que se sincroniza el
  // estado a partir de ella.
  useEffect(() => {
    const alVolver = () => {
      const destino = pageFromPath(window.location.pathname) ?? fallbackPage
      setPage((actual) => {
        setPreviousPage(actual)
        return destino
      })
      aplicarTitulo(destino)
      window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [fallbackPage])

  const navigate = useCallback((newPage: Page) => {
    if (newPage === page) return
    window.history.pushState({ page: newPage }, '', ROUTES[newPage])
    aplicarTitulo(newPage)
    window.scrollTo(0, 0)
    setPreviousPage(page)
    setPage(newPage)
  }, [page])

  const goHome = useCallback(() => navigate(HOME_PAGE), [navigate])

  const hrefFor = useCallback((destino: Page) => ROUTES[destino], [])

  return (
    <NavigationContext.Provider value={{ page, previousPage, navigate, goHome, homePage: HOME_PAGE, hrefFor }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation debe usarse dentro de <NavigationProvider>')
  return ctx
}
