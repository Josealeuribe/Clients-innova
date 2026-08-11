import { useEffect, useState } from 'react'
import { adminFetchCanjes, ApiError } from '@/shared/api/client'
import type { AdminCanjeRow } from '@/shared/api/types'

export function useAdminCanjes(token: string | null | undefined, enabled: boolean) {
  const [canjes, setCanjes] = useState<AdminCanjeRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !token || canjes) return

    adminFetchCanjes(token)
      .then((res) => setCanjes(res.canjes))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar la auditoría.'),
      )
  }, [enabled, token, canjes])

  return { canjes, error }
}
