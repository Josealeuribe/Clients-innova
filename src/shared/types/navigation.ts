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
// /* -> /index.html; sin ella, entrar directo a /ruleta da 404.
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

// Normaliza la barra final para que /ruleta y /ruleta/ sean la misma vista.
function normalizarPath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.replace(/\/+$/, '')
  return pathname
}

// Devuelve null si la URL no corresponde a ningun modulo, para que quien
// llame decida (hoy: mandar a la landing y corregir la barra de direcciones).
export function pageFromPath(pathname: string): Page | null {
  return PAGE_BY_PATH.get(normalizarPath(pathname)) ?? null
}
