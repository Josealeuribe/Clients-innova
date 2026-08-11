import type { Campana } from '../admin.types'

const STORAGE_KEY = 'gran-casino-admin-campanas'

export function loadCampanas(): Campana[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCampanas(campanas: Campana[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(campanas))
}
