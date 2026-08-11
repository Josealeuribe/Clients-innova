import { useCallback } from 'react'
import type { Page } from '@/shared/types/navigation'

export function useLandingNavigation(navigate: (page: Page) => void) {
  const irARuleta = useCallback(() => {
    navigate('roulette')
  }, [navigate])

  const irALogin = useCallback(() => {
    navigate('login')
  }, [navigate])

  return {
    irARuleta,
    irALogin,
  }
}
