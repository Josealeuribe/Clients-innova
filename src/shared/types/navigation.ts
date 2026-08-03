export type Page = 'landing' | 'roulette' | 'register' | 'login' | 'dashboard' | 'terms' | 'privacy'

export interface AppState {
  prize: string | null
  userName: string | null
}
