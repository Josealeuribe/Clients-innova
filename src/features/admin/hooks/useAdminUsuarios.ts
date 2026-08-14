import { useEffect, useState } from 'react'
import { adminFetchUsuarios, adminRestablecerPassword, ApiError } from '@/shared/api/client'
import type { AdminUsuarioRow } from '@/shared/api/types'
import type { TemporalPassword } from '../admin.types'

// Cada cuánto se vuelve a pedir el listado mientras la sección está abierta.
//
// El módulo de Personal muestra quién está conectado, y un estado de presencia
// que solo se actualiza al recargar la página no sirve para monitorear: diría
// "Activo" de alguien que se fue hace media hora. Con 20 s el indicador va como
// máximo 20 s por detrás de la realidad.
//
// Solo corre con la sección de Personal a la vista (ver el flag `enabled` desde
// AdminPage): estando en Clientes o Canjes no se gasta ni una petición.
const REFRESCO_MS = 20_000

export function useAdminUsuarios(token: string | null | undefined, enabled: boolean) {
  const [usuarios, setUsuarios] = useState<AdminUsuarioRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Criterio con el que el servidor decidió `enLinea`. Se guarda para poder
  // explicarlo en la vista sin repetir la constante del backend.
  const [ventanaEnLinea, setVentanaEnLinea] = useState<number | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [temporal, setTemporal] = useState<TemporalPassword | null>(null)
  const [reseteando, setReseteando] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled || !token) return

    let cancelado = false

    const cargar = () =>
      adminFetchUsuarios(token)
        .then((res) => {
          if (cancelado) return
          setUsuarios(res.usuarios)
          setVentanaEnLinea(res.ventanaEnLineaSegundos ?? null)
          setError(null)
        })
        .catch((err) => {
          if (cancelado) return
          // El listado que ya está en pantalla NO se borra: un refresco que
          // falla por un bache de red no tiene por qué dejar la vista vacía.
          // Solo se avisa, y el siguiente intento lo arregla solo.
          setError(err instanceof ApiError ? err.message : 'No se pudo cargar el personal.')
        })

    void cargar()
    const temporizador = window.setInterval(() => void cargar(), REFRESCO_MS)

    return () => {
      cancelado = true
      window.clearInterval(temporizador)
    }
  }, [enabled, token])

  const restablecer = async (usuario: AdminUsuarioRow) => {
    if (!token) return

    const seguro = window.confirm(
      `¿Generar una contraseña temporal para ${usuario.nombre}?\n\n` +
        'Su contraseña actual dejará de funcionar de inmediato y tendrá que cambiarla al entrar.',
    )

    if (!seguro) return

    setErrorAccion(null)
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
      setErrorAccion(err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña.')
    } finally {
      setReseteando(null)
    }
  }

  return {
    usuarios,
    // El fallo de una acción se lleva aparte del fallo de carga: si compartieran
    // estado, el refresco automático borraría a los 20 s el "no se pudo
    // restablecer la contraseña" antes de que el admin llegue a leerlo.
    error: errorAccion ?? error,
    ventanaEnLinea,
    temporal,
    reseteando,
    restablecer,
    clearTemporal: () => setTemporal(null),
  }
}
