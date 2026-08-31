import { useEffect, useState } from 'react'
import { fetchVigencias, ApiError } from '@/shared/api/client'
import type { VigenciasResponse } from '@/shared/api/types'

// Vigencia de la promoción, para cualquiera de las cuatro vistas que la
// muestran. Un solo hook para las cuatro: si mañana cambia la forma de leerla,
// cambia en un sitio y no en cuatro que se desincronizarían.
//
// `enabled` permite no pedirla hasta que la sección esté abierta, igual que
// hacen useAdminCanjes y useCajeroHistorial.
export function useVigencias(enabled = true) {
  const [datos, setDatos] = useState<VigenciasResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || datos) return

    let vigente = true
    fetchVigencias()
      .then((res) => {
        if (vigente) setDatos(res)
      })
      .catch((err) => {
        if (vigente) {
          setError(err instanceof ApiError ? err.message : 'No se pudo consultar la vigencia.')
        }
      })

    // Si la vista se desmonta mientras la petición viaja, no se toca el estado
    // de un componente que ya no existe.
    return () => {
      vigente = false
    }
  }, [enabled, datos])

  return { datos, error }
}
