export type Page = 'landing' | 'roulette' | 'register' | 'login' | 'dashboard' | 'terms'

export interface AppState {
  prize: string | null
  userName: string | null
}
