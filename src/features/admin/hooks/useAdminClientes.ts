import { useEffect, useState } from 'react'
import { adminFetchClientes, ApiError } from '@/shared/api/client'
import type { AdminClienteRow } from '@/shared/api/types'

export function useAdminClientes(token: string | null | undefined, enabled = true) {
  const [clientes, setClientes] = useState<AdminClienteRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !token || clientes) return

    adminFetchClientes(token)
      .then((res) => setClientes(res.clientes))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar la información.'),
      )
  }, [enabled, token, clientes])

  return { clientes, error }
}
