export type Page =
  | 'landing'
  | 'roulette'
  | 'register'
  | 'login'
  | 'dashboard'
  | 'terms'
  | 'privacy'
  | 'home'
  | 'prizes'
  | 'how-it-works'
  | 'faq'
  | 'responsible-gaming'
  | 'admin'
  | 'cajero'

export interface AppState {
  prize: string | null
  ticket: string | null
}

// URL publica de cada modulo. Cada vista tiene la suya para que se pueda
// entrar directo (por ejemplo /ruleta desde un QR en sede), compartir el
// enlace y usar atras/adelante del navegador.
//
// OJO: al ser una SPA, el servidor debe responder index.html en cualquier
// ruta. En el Static Site de Render eso es una regla de Rewrite
// /* -> /index.html; sin ella, entrar directo a /ruleta (o recargar estando
// ahi) da 404. La regla esta declarada en render.yaml, pero solo aplica si el
// servicio se sincroniza como Blueprint: si el Static Site se creo a mano,
// hay que agregarla ademas en Dashboard > Redirects/Rewrites.
export const ROUTES: Record<Page, string> = {
  landing: '/',
  home: '/inicio',
  roulette: '/ruleta',
  register: '/registro',
  login: '/login',
  dashboard: '/mi-cuenta',
  prizes: '/premios',
  'how-it-works': '/como-funciona',
  faq: '/preguntas-frecuentes',
  'responsible-gaming': '/juego-responsable',
  terms: '/terminos',
  privacy: '/privacidad',
  admin: '/admin',
  cajero: '/cajero',
}

// Titulo del documento por vista: es lo que se ve en la pestaña y en el
// historial del navegador.
export const PAGE_TITLES: Record<Page, string> = {
  landing: 'Gran Casino Cúcuta | Gira y Gana',
  home: 'Inicio | Gran Casino Cúcuta',
  roulette: 'Gira la Ruleta | Gran Casino Cúcuta',
  register: 'Crear cuenta | Gran Casino Cúcuta',
  login: 'Iniciar sesión | Gran Casino Cúcuta',
  dashboard: 'Mi cuenta | Gran Casino Cúcuta',
  prizes: 'Premios | Gran Casino Cúcuta',
  'how-it-works': 'Cómo funciona | Gran Casino Cúcuta',
  faq: 'Preguntas frecuentes | Gran Casino Cúcuta',
  'responsible-gaming': 'Juego responsable | Gran Casino Cúcuta',
  terms: 'Términos y condiciones | Gran Casino Cúcuta',
  privacy: 'Política de privacidad | Gran Casino Cúcuta',
  admin: 'Panel de administración | Gran Casino Cúcuta',
  cajero: 'Panel de cajero | Gran Casino Cúcuta',
}

const PAGE_BY_PATH = new Map<string, Page>(
  (Object.entries(ROUTES) as [Page, string][]).map(([page, path]) => [path, page]),
)

// Subpath donde vive esta app dentro de innovaclub.com.co (p.ej. '/cucuta'),
// tomado de BASE_URL -- variable propia de Vite que ya refleja el `base`
// fijado en vite.config.ts (via FIGMA_PUBLIC_URL al construir). Se deriva de
// ahi en vez de hardcodear el string para que quede siempre en sincronia con
// el build, sin una segunda fuente de verdad que se pueda desincronizar.
// Vacio cuando la app vive en la raiz de su propio dominio (build sin
// FIGMA_PUBLIC_URL, p.ej. local o un despliegue standalone).
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

// Normaliza la barra final para que /ruleta y /ruleta/ sean la misma vista.
function normalizarPath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.replace(/\/+$/, '')
  return pathname
}

// Devuelve null si la URL no corresponde a ningun modulo, para que quien
// llame decida (hoy: mandar a la landing y corregir la barra de direcciones).
//
// Recorta BASE_PATH antes de buscar: window.location.pathname trae el
// prefijo completo (p.ej. '/cucuta/ruleta'), pero ROUTES esta escrito sin el
// (solo '/ruleta') porque es el mismo mapa que usa la app standalone.
export function pageFromPath(pathname: string): Page | null {
  const sinPrefijo = BASE_PATH && pathname.startsWith(BASE_PATH)
    ? pathname.slice(BASE_PATH.length) || '/'
    : pathname
  return PAGE_BY_PATH.get(normalizarPath(sinPrefijo)) ?? null
}

// Ruta PUBLICA de una vista, con el prefijo puesto -- para pushState/
// replaceState y para href reales que funcionen tal cual bajo el subpath.
export function pathFor(page: Page): string {
  return BASE_PATH + ROUTES[page]
}
