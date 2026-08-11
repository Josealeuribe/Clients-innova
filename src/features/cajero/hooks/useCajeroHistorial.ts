import { useEffect, useState } from 'react'
import type { CanjeHistorialRow } from '@/shared/api/types'
import { cajeroService, getCajeroError } from '../services/cajero.service'


export function useCajeroHistorial(token: string | null | undefined, enabled: boolean) {
  const [historial, setHistorial] = useState<CanjeHistorialRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [soloPropios, setSoloPropios] = useState(true)

  useEffect(() => {
    if (!enabled || !token || historial) return

    setError(null)
    cajeroService
      .fetchHistorial(token)
      .then((res) => {
        setHistorial(res.canjes)
        setSoloPropios(res.soloPropios)
      })
      .catch((err) => setError(getCajeroError(err, 'No se pudo cargar el historial.')))
  }, [enabled, token, historial])

  return {
    historial,
    error,
    soloPropios,
    invalidate: () => setHistorial(null),
  }
}
