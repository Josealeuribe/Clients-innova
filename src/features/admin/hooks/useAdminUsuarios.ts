import { useEffect, useState } from 'react'
import { adminFetchUsuarios, adminRestablecerPassword, ApiError } from '@/shared/api/client'
import type { AdminUsuarioRow } from '@/shared/api/types'
import type { TemporalPassword } from '../admin.types'

export function useAdminUsuarios(token: string | null | undefined, enabled: boolean) {
  const [usuarios, setUsuarios] = useState<AdminUsuarioRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [temporal, setTemporal] = useState<TemporalPassword | null>(null)
  const [reseteando, setReseteando] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled || !token || usuarios) return

    adminFetchUsuarios(token)
      .then((res) => setUsuarios(res.usuarios))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar el personal.'),
      )
  }, [enabled, token, usuarios])

  const restablecer = async (usuario: AdminUsuarioRow) => {
    if (!token) return

    const seguro = window.confirm(
      `¿Generar una contraseña temporal para ${usuario.nombre}?\n\n` +
        'Su contraseña actual dejará de funcionar de inmediato y tendrá que cambiarla al entrar.',
    )

    if (!seguro) return

    setError(null)
    setReseteando(usuario.id)

    try {
      const res = await adminRestablecerPassword(token, usuario.id)
      setTemporal({
        nombre: res.usuario.nombre,
        email: res.usuario.email,
        clave: res.temporal,
      })
      setUsuarios((prev) =>
        prev
          ? prev.map((u) =>
              u.id === usuario.id ? { ...u, debeCambiarPassword: true } : u,
            )
          : prev,
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña.')
    } finally {
      setReseteando(null)
    }
  }

  return {
    usuarios,
    error,
    temporal,
    reseteando,
    restablecer,
    clearTemporal: () => setTemporal(null),
  }
}
