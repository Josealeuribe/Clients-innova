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
