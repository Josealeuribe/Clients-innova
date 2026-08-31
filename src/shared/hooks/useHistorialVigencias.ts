import { useEffect, useState } from 'react'
import { fetchHistorialVigencias, ApiError } from '@/shared/api/client'
import type { CambioVigenciaRow } from '@/shared/api/types'

// Registro de cambios de vigencia: quién movió cada fecha, cuándo y por qué.
//
// Lo usan el panel de admin y el de cajero. La cajera también lo necesita, no
// solo el admin: es quien recibe en el mostrador el "a mí me dijeron otra fecha"
// y hasta ahora no tenía con qué responderlo.
//
// `enabled` evita pedirlo hasta que la sección esté abierta, igual que
// useAdminCanjes y useCajeroHistorial.
export function useHistorialVigencias(token: string | null | undefined, enabled: boolean) {
  const [cambios, setCambios] = useState<CambioVigenciaRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !token || cambios) return

    let vigente = true
    fetchHistorialVigencias(token)
      .then((res) => {
        if (vigente) setCambios(res.cambios)
      })
      .catch((err) => {
        if (vigente) {
          setError(err instanceof ApiError ? err.message : 'No se pudo cargar el registro de vigencias.')
        }
      })

    return () => {
      vigente = false
    }
  }, [enabled, token, cambios])

  return { cambios, error }
}
